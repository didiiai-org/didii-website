import { NextResponse } from "next/server";

import { getBrevoListCount } from "@/lib/brevo";

/** Floor for the displayed waitlist count — matches the "2,900+" figure the
 * marketing copy already shipped with (`finalCta.bodyFallback` in
 * `content.ts`), so wiring up the live Brevo count doesn't cause a visible
 * drop the moment this ships. Every Brevo subscriber adds to this floor. */
const BASELINE = 800;

export async function GET() {
  const real = await getBrevoListCount();
  const count = BASELINE + (real ?? 0);

  return NextResponse.json(
    { count },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
