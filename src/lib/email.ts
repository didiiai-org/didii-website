/**
 * Thin wrapper around Resend's transactional send API — the one place a
 * `fetch(api.resend.com/emails)` call is allowed to live.
 *
 * sendEmail() throws on non-2xx with a message that includes Resend's error
 * code, so call sites can just try/catch + log.
 */

const RESEND_URL = "https://api.resend.com/emails";

type Address = string | { name?: string; email: string };

/** Accepts 'email@host', 'Name <email@host>', or { name, email }. */
function formatAddress(addr: Address | undefined | null): string | null {
  if (!addr) return null;
  if (typeof addr === "string") return addr.trim() || null;
  if (!addr.email) return null;
  return addr.name ? `${addr.name} <${addr.email}>` : addr.email;
}

function formatRecipients(to: Address | Address[] | undefined): string[] {
  if (!to) return [];
  if (Array.isArray(to)) return to.map(formatAddress).filter((v): v is string => Boolean(v));
  const one = formatAddress(to);
  return one ? [one] : [];
}

export type SendEmailInput = {
  from: Address;
  to: Address | Address[];
  replyTo?: Address;
  subject: string;
  html?: string;
  text?: string;
  tag?: string;
};

export async function sendEmail({ from, to, replyTo, subject, html, text, tag }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY missing");

  const fromStr = formatAddress(from);
  const toArr = formatRecipients(to);
  if (!fromStr) throw new Error("sendEmail: from address required");
  if (toArr.length === 0) throw new Error("sendEmail: to address required");
  if (!subject) throw new Error("sendEmail: subject required");
  if (!html && !text) throw new Error("sendEmail: html or text required");

  const body = {
    from: fromStr,
    to: toArr,
    subject,
    ...(html ? { html } : {}),
    ...(text ? { text } : {}),
    ...(replyTo ? { reply_to: formatAddress(replyTo) } : {}),
    ...(tag ? { tags: [{ name: "category", value: tag }] } : {}),
  };

  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = json?.name ?? res.status;
    const msg = json?.message ?? `HTTP ${res.status}`;
    throw new Error(`Resend ${code}: ${msg}`);
  }
  return { messageId: json?.id as string | undefined };
}
