import { NextRequest, NextResponse } from "next/server";

import { addToBrevoList } from "@/lib/brevo";
import { sendEmail } from "@/lib/email";
import { appendWaitlistRow } from "@/lib/googleSheets";
import { ipFromReq, rateLimitPair } from "@/lib/ratelimit";
import { verifyTurnstile } from "@/lib/turnstile";
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

  /* Rate limit first — cheapest reject path, saves a Turnstile round-trip
     when an IP is already over budget. */
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
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const turnstileToken = typeof body?.turnstileToken === "string" ? body.turnstileToken : null;

  if (!name || !phone || !emailLooksValid(email)) {
    return NextResponse.json({ error: "Invalid waitlist submission." }, { status: 400 });
  }

  const verify = await verifyTurnstile(turnstileToken, ip, "waitlist");
  if (!verify.success) {
    console.warn("waitlist: turnstile rejected", verify.errorCodes);
    return NextResponse.json({ error: "Verification failed. Refresh and try again." }, { status: 403 });
  }

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

  return NextResponse.json({ ok: true });
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
