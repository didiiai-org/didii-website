"use client";

import { motion as fm, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { clsx } from "@/lib/clsx";
import { motion } from "@/lib/tokens";

type Variant = "onDark" | "onLight" | "gold";

const variants: Record<Variant, string> = {
  /** pale mint fill, used inside the dark hero panel */
  onDark: "bg-green-100 text-brand-green hover:bg-white",
  /** solid brand green, used on the light nav bar */
  onLight: "bg-brand-green text-green-100 hover:bg-green-700",
  /** the accent CTA */
  gold: "bg-gold-600 text-brand-green hover:bg-gold-500",
};

/**
 * Primary action. `radius.button` (12), ≥44px tall so the touch target is met
 * without a spacer. The arrow nudges on hover and the whole control settles
 * 1px on press — both suppressed under reduce-motion.
 */
export function Button({
  children,
  href = "#waitlist",
  variant = "onDark",
  className,
  withArrow = true,
  icon,
}: {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  className?: string;
  withArrow?: boolean;
  icon?: ReactNode;
}) {
  const reduced = useReducedMotion();

  return (
    <fm.a
      href={href}
      className={clsx(
        "group inline-flex min-h-11 items-center gap-3 rounded-button px-6 py-3.5",
        "text-body font-bold whitespace-nowrap transition-colors duration-200",
        variants[variant],
        className,
      )}
      whileHover={reduced ? undefined : { y: -1 }}
      whileTap={reduced ? undefined : { y: 1, scale: 0.99 }}
      transition={{ duration: motion.duration.fast, ease: motion.ease }}
    >
      {icon}
      {children}
      {withArrow ? (
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
          strokeWidth={2.25}
        />
      ) : null}
    </fm.a>
  );
}
