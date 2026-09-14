/** Brevo is used only as a contacts list — it powers the live waitlist
 * count (`/api/count`) and gives marketing a mailable list. Lead-of-record
 * storage is still `appendWaitlistRow` (Google Sheets, see `googleSheets.ts`);
 * this is a secondary, best-effort integration. */

/** Added to the Brevo subscriber count everywhere the waitlist size or a
 * queue position is shown (`/api/count`, `/api/waitlist`). */
export const WAITLIST_BASELINE = 800;

export type BrevoLead = {
  name: string;
  phone: string;
  email: string;
  source?: string;
};

export async function addToBrevoList(lead: BrevoLead) {
  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number.parseInt(process.env.BREVO_LIST_ID ?? "", 10);
  if (!apiKey || !listId) return null;

  const res = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      email: lead.email,
      attributes: {
        FIRSTNAME: lead.name,
        SMS: lead.phone,
        SOURCE: lead.source ?? "waitlist",
      },
      listIds: [listId],
      updateEnabled: true,
    }),
  });

  return res.json().catch(() => null);
}

/** Whether `email` is already on the configured list. Returns null when
 * Brevo isn't configured or the lookup fails, so the caller decides whether
 * to fail open. */
export async function isOnBrevoList(email: string): Promise<boolean | null> {
  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number.parseInt(process.env.BREVO_LIST_ID ?? "", 10);
  if (!apiKey || !listId) return null;

  try {
    const res = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
      headers: {
        accept: "application/json",
        "api-key": apiKey,
      },
    });
    if (res.status === 404) return false;
    if (!res.ok) return null;

    const data = await res.json();
    return Array.isArray(data.listIds) && data.listIds.includes(listId);
  } catch {
    return null;
  }
}

/** Live subscriber count for the configured list, net of blacklisted
 * addresses. Returns null when Brevo isn't configured or the call fails —
 * callers fall back to a baseline rather than surfacing an error. */
export async function getBrevoListCount(): Promise<number | null> {
  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number.parseInt(process.env.BREVO_LIST_ID ?? "", 10);
  if (!apiKey || !listId) {
    console.warn("brevo: list count skipped — BREVO_API_KEY or BREVO_LIST_ID not set");
    return null;
  }

  try {
    const res = await fetch(`https://api.brevo.com/v3/contacts/lists/${listId}`, {
      headers: {
        accept: "application/json",
        "api-key": apiKey,
      },
    });
    if (!res.ok) {
      console.warn("brevo: list count failed", res.status, await res.text().catch(() => ""));
      return null;
    }

    const data = await res.json();
    if (typeof data.totalSubscribers !== "number") return null;
    return Math.max(data.totalSubscribers - (data.totalBlacklisted || 0), 0);
  } catch (err) {
    console.warn("brevo: list count errored", err);
    return null;
  }
}
