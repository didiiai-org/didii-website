"use client";

import { motion as fm, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Slow ambient float. Used on the scattered photo and feature cards so the
 * composition breathes without ever pulling focus. Amplitude stays under 12px —
 * anything larger reads as a toy, and this is a money product.
 */
export function Drift({
  children,
  className,
  distance = 8,
  duration = 9,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
  duration?: number;
  delay?: number;
}) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <fm.div
      className={className}
      animate={{ y: [0, -distance, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </fm.div>
  );
}
