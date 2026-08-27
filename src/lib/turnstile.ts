/** Cloudflare Turnstile verification — gates `/api/waitlist` before any
 * Brevo/Resend/Sheets fanout runs. Fail-closed: if Turnstile is unreachable
 * or unconfigured, the submission is rejected rather than let through. */

export type TurnstileResult = { success: boolean; errorCodes: string[] };

export async function verifyTurnstile(
  token: string | null | undefined,
  ip: string,
  action: string,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { success: false, errorCodes: ["missing-secret-key"] };
  if (!token) return { success: false, errorCodes: ["missing-input-response"] };

  const body = new URLSearchParams({ secret, response: token, remoteip: ip });

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await res.json().catch(() => ({}));
    const errorCodes: string[] = data["error-codes"] ?? [];
    const success = Boolean(data.success) && (!data.action || data.action === action);
    return { success, errorCodes };
  } catch {
    return { success: false, errorCodes: ["network-error"] };
  }
}
