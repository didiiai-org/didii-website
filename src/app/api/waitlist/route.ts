import { NextRequest, NextResponse } from "next/server";

import { addToBrevoList, getBrevoListCount, isOnBrevoList, WAITLIST_BASELINE } from "@/lib/brevo";
import { sendEmail } from "@/lib/email";
import { appendWaitlistRow } from "@/lib/googleSheets";
import { ipFromReq, rateLimitPair } from "@/lib/ratelimit";
import { buildWaitlistConfirmationEmail } from "@/lib/waitlistEmail";

const MAX_BODY_BYTES = 8 * 1024;

const emailLooksValid = (value: string) => {
  const input = value.trim();
  const at = input.indexOf("@");
  const dot = input.lastIndexOf(".");
  return at > 0 && dot > at + 1 && dot < input.length - 1;
};

export async function POST(request: NextRequest) {
  const contentLength = Number.parseInt(request.headers.get("content-length") ?? "0", 10);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const ip = ipFromReq(request);

  /* Rate limit first — cheapest reject path. This is the only abuse control
     on the endpoint, and it fails open when Upstash isn't configured. */
  const rl = await rateLimitPair(
    "rl:waitlist",
    ip,
    { limit: 5, windowSec: 60 },
    { limit: 30, windowSec: 3600 },
    /* failOpen */ true,
  );
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Slow down." }, { status: 429 });
  }
  if (rl.degraded) console.warn("waitlist: rate-limit degraded", rl.reason);

  const body = await request.json().catch(() => null);

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!name || !phone || !emailLooksValid(email)) {
    return NextResponse.json({ error: "Invalid waitlist submission." }, { status: 400 });
  }

  /* One signup per email. Brevo is the only store we can query (Sheets is
     append-only via Apps Script). If the lookup fails we let the signup
     through rather than lose a lead. The count is read before the add so the
     new signup is counted exactly once, whenever Brevo updates its stats. */
  const [existing, countBefore] = await Promise.all([isOnBrevoList(email), getBrevoListCount()]);
  if (existing) {
    return NextResponse.json({ ok: true, alreadyJoined: true, position: null });
  }
  if (existing === null) console.warn("waitlist: Brevo lookup unavailable, duplicate check skipped");

  /* All three run in parallel; none blocks the response, and none can take
     the whole submission down — a Sheets, Brevo, or Resend outage still
     leaves the other two intact. */
  const results = await Promise.allSettled([
    appendWaitlistRow({ name, phone, email, source: "waitlist", timestamp: new Date().toISOString() }),
    addToBrevoList({ name, phone, email, source: "waitlist" }),
    sendConfirmationEmail(name, email),
  ]);

  const rowResult = results[0];
  if (rowResult.status === "rejected") {
    console.error("waitlist: failed to append row", rowResult.reason);
    return NextResponse.json({ error: "Could not save to waitlist." }, { status: 502 });
  }

  results.forEach((result, i) => {
    if (i === 0) return;
    const label = ["Sheets", "Brevo", "ConfirmEmail"][i];
    if (result.status === "rejected") {
      console.error(`waitlist: ${label} failed`, result.reason);
    }
  });

  /* Same figure `/api/count` shows: baseline + Brevo subscribers. */
  const position = countBefore === null ? null : WAITLIST_BASELINE + countBefore + 1;
  return NextResponse.json({ ok: true, alreadyJoined: false, position });
}

function sendConfirmationEmail(name: string, email: string) {
  const { html, subject } = buildWaitlistConfirmationEmail(name);
  return sendEmail({
    from: { name: "didii", email: process.env.RESEND_FROM_EMAIL || "hi@didiiai.com" },
    to: { email, name },
    subject,
    html,
    tag: "waitlist-confirm",
  });
}
