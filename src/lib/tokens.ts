/**
 * didii — design tokens (TypeScript mirror)
 *
 * The CSS side of the contract lives in `src/app/globals.css` under `@theme`.
 * This module mirrors the values that JavaScript needs — motion durations and
 * curves, mostly — so a Framer Motion transition and a Flutter `Curve` stay in
 * step. Colour/space/radius are consumed as Tailwind classes, not from here.
 *
 * Rule from the token spec: a token added on one side without a counterpart on
 * the other is a review fail.
 */

/** motion.* — Duration + Curve constants (§5) */
export const motion = {
  /** shared didii easing — calm deceleration, never bouncy */
  ease: [0.22, 1, 0.36, 1] as const,
  easeOut: [0.16, 1, 0.3, 1] as const,

  duration: {
    /** micro-interactions: hover, press, chip select */
    fast: 0.18,
    /** the default — reveals, fades, bubble entry */
    base: 0.55,
    /** long, deliberate: section panels, hero */
    slow: 0.8,
  },

  /** motion.thinking — "didii is thinking" dots appear <100ms after send ✅ */
  thinkingDelay: 0.09,

  /** stagger between siblings in a revealed group */
  stagger: 0.08,
} as const;

/**
 * Scroll-reveal viewport config — reveal once, a little before fully in view.
 *
 * The bottom inset is deliberately small. A large negative bottom margin shrinks
 * the detection band so far that anything sitting in the last stretch of the
 * document (the footer, most obviously) can never satisfy it and stays stuck at
 * `opacity: 0` forever. Trim generously from the top, barely from the bottom.
 */
export const revealViewport = { once: true, margin: "-10% 0px -2% 0px" } as const;

/** radius.* (§4) — for the rare inline style that cannot be a class */
export const radius = {
  chip: 9999,
  input: 12,
  button: 12,
  card: 16,
  sheet: 20,
  panel: 32,
} as const;

/** space.* — 4px base grid (§3) */
export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  6: 24,
  8: 32,
  12: 48,
} as const;

/** Money state (§1) — colour NEVER carries meaning alone; always icon + label. */
export type MoneyStatus = "success" | "pending" | "failed" | "reversed";

export const statusMeta: Record<MoneyStatus, { label: string; className: string }> = {
  success: { label: "Successful", className: "text-status-success" },
  pending: { label: "Pending", className: "text-status-pending" },
  failed: { label: "Failed", className: "text-status-failed" },
  reversed: { label: "Reversed", className: "text-status-reversed" },
};
