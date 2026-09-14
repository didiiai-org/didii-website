"use client";

import {
  motion as fm,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { createContext, Fragment, useContext, useRef, type ReactNode } from "react";

/**
 * Scroll-linked tint.
 *
 * Words start washed out and darken to their final colour as the block travels
 * up the viewport, so reading the section and scrolling it are the same gesture.
 * Purely presentational: the copy is in the DOM at full size from first paint,
 * it never moves, and under `prefers-reduced-motion` every word renders in its
 * final colour with no scroll listener attached at all (a11y §02).
 */

/** Sweep progress for the enclosing block, 0 → 1. `null` under reduce-motion. */
const TintProgress = createContext<MotionValue<number> | null>(null);

/**
 * Tiers of the sweep. `to` mirrors the section's own palette — `--color-ink` for
 * the headline voice, the sage of the loop copy for the body — and `from` is
 * that same colour washed toward the white surface. The washed end is kept dark
 * enough to stay readable at this type size for anyone who lands mid-sweep.
 */
const tones = {
  ink: { from: "#9aa39d", to: "#0b1f14" },
  sage: { from: "#a9bcb0", to: "#0b1f14" },
} as const;

export type TintTone = keyof typeof tones;

/**
 * Each word gets its own slice of the sweep, but the slices overlap heavily so
 * the leading edge reads as a soft wipe across the line rather than a row of
 * switches flipping one at a time.
 */
function wordRange(index: number, total: number): [number, number] {
  const span = Math.min(0.3, Math.max(0.12, 6 / Math.max(total, 1)));
  const start = total > 1 ? (index / (total - 1)) * (1 - span) : 0;
  return [start, start + span];
}

/** Reads the sweep, falling back to "finished" when there is no provider. */
function useSweep() {
  const progress = useContext(TintProgress);
  // Always called so the hook order stays fixed; only used when the sweep is
  // off (reduce-motion, or a tinted word rendered outside a `ScrollTint`).
  const settled = useMotionValue(1);
  return progress ?? settled;
}

/**
 * Wraps the block whose words are tinted and drives the sweep from its position.
 *
 * The offsets run from "the block's top edge has risen to 85% of the viewport"
 * to "its bottom edge has risen to 55%", so the last line lands fully dark while
 * it is still in the comfortable reading band, not as it leaves the screen.
 */
export function ScrollTint({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.55"] });

  return (
    <div ref={ref} className={className}>
      <TintProgress.Provider value={reduced ? null : scrollYProgress}>{children}</TintProgress.Provider>
    </div>
  );
}

/**
 * One run of copy, split into words that darken in sequence.
 *
 * `from` is the word's position in the whole block and `total` the block's word
 * count — passing both keeps the sweep continuous across paragraphs instead of
 * restarting inside each one.
 */
export function TintWords({
  text,
  tone,
  from,
  total,
}: {
  text: string;
  tone: TintTone;
  from: number;
  total: number;
}) {
  const words = text.trim().split(/\s+/);

  return (
    <>
      {words.map((word, i) => (
        <Fragment key={`${i}-${word}`}>
          {/* Separator sits outside the span so lines break as normal text. */}
          {i > 0 ? " " : null}
          <TintWord tone={tone} index={from + i} total={total}>
            {word}
          </TintWord>
        </Fragment>
      ))}
    </>
  );
}

function TintWord({
  children,
  tone,
  index,
  total,
}: {
  children: ReactNode;
  tone: TintTone;
  index: number;
  total: number;
}) {
  const sweep = useSweep();
  const [start, end] = wordRange(index, total);
  const color = useTransform(sweep, [start, end], [tones[tone].from, tones[tone].to]);

  return <fm.span style={{ color }}>{children}</fm.span>;
}

/**
 * Non-text passengers — the glyph tiles and the punctuation hanging off them.
 * They carry their own fill, so they ride the sweep on opacity instead of colour
 * and arrive in step with the word they follow.
 */
export function TintFade({ children, index, total }: { children: ReactNode; index: number; total: number }) {
  const sweep = useSweep();
  const [start, end] = wordRange(index, total);
  const opacity = useTransform(sweep, [start, end], [0.35, 1]);

  return <fm.span style={{ opacity }}>{children}</fm.span>;
}
