import type { NextRequest } from "next/server";

/** Per-IP fixed-window rate limiting via the Upstash Redis REST API — no SDK,
 * just fetch (consistent with how this codebase talks to every other
 * external service). Fails open by default so a transient Upstash outage
 * doesn't block conversions. */

type Window = { limit: number; windowSec: number };
type RateLimitResult =
  | { allowed: true; degraded: boolean; reason?: string }
  | { allowed: false; scope: "short" | "long" };

export function ipFromReq(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

async function checkWindow(url: string, token: string, key: string, window: Window) {
  const res = await fetch(`${url}/incr/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Upstash INCR failed: HTTP ${res.status}`);

  const { result: count } = (await res.json()) as { result: number };
  if (count === 1) {
    await fetch(`${url}/expire/${encodeURIComponent(key)}/${window.windowSec}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  return count <= window.limit;
}

export async function rateLimitPair(
  prefix: string,
  ip: string,
  short: Window,
  long: Window,
  failOpen: boolean,
): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return { allowed: true, degraded: true, reason: "Upstash not configured" };
  }

  try {
    const [shortOk, longOk] = await Promise.all([
      checkWindow(url, token, `${prefix}:s:${ip}`, short),
      checkWindow(url, token, `${prefix}:l:${ip}`, long),
    ]);
    if (!shortOk) return { allowed: false, scope: "short" };
    if (!longOk) return { allowed: false, scope: "long" };
    return { allowed: true, degraded: false };
  } catch (err) {
    if (failOpen) {
      return { allowed: true, degraded: true, reason: (err as Error).message };
    }
    return { allowed: false, scope: "short" };
  }
}
