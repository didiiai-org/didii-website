"use client";

import { motion as fm, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

import { motion, revealViewport } from "@/lib/tokens";

/** Semantic elements the reveal wrappers can render as. */
export type RevealTag = "div" | "section" | "ul" | "li" | "p" | "h2" | "h3" | "span" | "figure";

const tags = {
  div: fm.div,
  section: fm.section,
  ul: fm.ul,
  li: fm.li,
  p: fm.p,
  h2: fm.h2,
  h3: fm.h3,
  span: fm.span,
  figure: fm.figure,
} as const;

type Direction = "up" | "down" | "left" | "right" | "none";

const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 22 },
  down: { x: 0, y: -22 },
  left: { x: 22, y: 0 },
  right: { x: -22, y: 0 },
  none: { x: 0, y: 0 },
};

interface RevealProps {
  children: ReactNode;
  /** Which way the element travels in from. */
  from?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  as?: RevealTag;
  /** Adds a small scale-in — good for cards and media, wrong for body copy. */
  scale?: boolean;
}

/**
 * Scroll-reveal wrapper. Fades and travels a short distance once, on entry.
 *
 * Under `prefers-reduced-motion` the element renders in its final state with no
 * transform and no transition (a11y §02) — content is never gated on motion.
 */
export function Reveal({
  children,
  from = "up",
  delay = 0,
  duration = motion.duration.base,
  className,
  as = "div",
  scale = false,
}: RevealProps) {
  const reduced = useReducedMotion();
  const Component = tags[as];
  const offset = offsets[from];

  return (
    <Component
      className={className}
      initial={reduced ? false : { opacity: 0, x: offset.x, y: offset.y, scale: scale ? 0.97 : 1 }}
      whileInView={reduced ? undefined : { opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={revealViewport}
      transition={{ duration, delay, ease: motion.ease }}
    >
      {children}
    </Component>
  );
}

/** Parent that staggers its `<RevealItem>` children as the group enters view. */
export function RevealGroup({
  children,
  className,
  delay = 0,
  stagger = motion.stagger,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: RevealTag;
}) {
  const reduced = useReducedMotion();
  const Component = tags[as];

  return (
    <Component
      className={className}
      initial={reduced ? false : "hidden"}
      whileInView={reduced ? undefined : "shown"}
      viewport={revealViewport}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {children}
    </Component>
  );
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  shown: {
    opacity: 1,
    y: 0,
    transition: { duration: motion.duration.base, ease: motion.ease },
  },
};

export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: RevealTag;
}) {
  const reduced = useReducedMotion();
  const Component = tags[as];

  if (reduced) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component className={className} variants={itemVariants}>
      {children}
    </Component>
  );
}
