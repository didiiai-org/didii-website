import { NextResponse } from "next/server";

/** TEMPORARY — production config check for the waitlist. Reports whether each
 * env var is present (booleans only, never values) and how Brevo and the
 * Apps Script respond from this server. Delete once production is fixed. */

const KEYS = [
  "GOOGLE_APPS_SCRIPT_URL",
  "BREVO_API_KEY",
  "BREVO_LIST_ID",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
];

export async function GET() {
  const env = Object.fromEntries(
    KEYS.map((key) => {
      const value = process.env[key];
      return [key, { set: Boolean(value), strayWhitespaceOrQuotes: value ? /^\s|\s$|^["']|["']$/.test(value) : false }];
    }),
  );

  const [brevo, appsScript] = await Promise.all([checkBrevo(), checkAppsScript()]);

  return NextResponse.json(
    { vercelEnv: process.env.VERCEL_ENV ?? null, env, brevo, appsScript },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

async function checkBrevo() {
  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID;
  if (!apiKey || !listId) return { skipped: "BREVO_API_KEY or BREVO_LIST_ID not set" };

  try {
    const res = await fetch(`https://api.brevo.com/v3/contacts/lists/${encodeURIComponent(listId.trim())}`, {
      headers: { accept: "application/json", "api-key": apiKey },
    });
    const data = await res.json().catch(() => null);
    return res.ok
      ? { status: res.status, totalSubscribers: data?.totalSubscribers ?? null }
      : { status: res.status, code: data?.code ?? null, message: data?.message ?? null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

/** GET only — the script has no doGet, so a healthy deployment answers with
 * "Script function not found: doGet" and nothing is written to the sheet. */
async function checkAppsScript() {
  const url = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!url) return { skipped: "GOOGLE_APPS_SCRIPT_URL not set" };

  try {
    const res = await fetch(url);
    const text = await res.text();
    const body = text
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160);
    return { status: res.status, body };
  } catch (err) {
    return { error: (err as Error).message };
  }
}
