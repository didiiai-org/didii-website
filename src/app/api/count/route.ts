import { NextResponse } from "next/server";

import { getBrevoListCount, WAITLIST_BASELINE } from "@/lib/brevo";

/** Displayed waitlist size: baseline + Brevo subscribers. The same figure
 * `/api/waitlist` uses for a new signup's queue position. */
export async function GET() {
  const real = await getBrevoListCount();
  const count = WAITLIST_BASELINE + (real ?? 0);

  return NextResponse.json(
    { count },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
