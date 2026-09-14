export type WaitlistRow = {
  name: string;
  phone: string;
  email: string;
  source: string;
  timestamp: string;
};

const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;

/** First few hundred chars of a response with HTML stripped — Apps Script
 * failures come back as a Google error page (e.g. "TypeError: … (line 12,
 * file Code)"), not JSON, so this is what makes the log line useful. */
const snippet = (text: string) =>
  text
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);

export async function appendWaitlistRow(row: WaitlistRow) {
  if (!APPS_SCRIPT_URL) {
    throw new Error("Missing GOOGLE_APPS_SCRIPT_URL env var.");
  }

  const response = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(row),
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Apps Script request failed with status ${response.status}: ${snippet(text)}`);
  }

  let result: { success?: unknown } | null = null;
  try {
    result = JSON.parse(text);
  } catch {
    // Not JSON — almost always a Google error page; reported below.
  }
  if (!result?.success) {
    throw new Error(`Apps Script did not confirm success: ${snippet(text)}`);
  }
}
