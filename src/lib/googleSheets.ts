export type WaitlistRow = {
  name: string;
  phone: string;
  email: string;
  source: string;
  timestamp: string;
};

const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;

export async function appendWaitlistRow(row: WaitlistRow) {
  if (!APPS_SCRIPT_URL) {
    throw new Error("Missing GOOGLE_APPS_SCRIPT_URL env var.");
  }

  const response = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(row),
  });

  if (!response.ok) {
    throw new Error(`Apps Script request failed with status ${response.status}`);
  }

  const result = await response.json().catch(() => null);
  if (!result?.success) {
    throw new Error(`Apps Script did not confirm success: ${JSON.stringify(result)}`);
  }
}
