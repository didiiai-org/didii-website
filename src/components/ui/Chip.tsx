import type { ReactNode } from "react";

import { clsx } from "@/lib/clsx";

type Tone = "onDark" | "onLight" | "pale" | "dark";

const tones: Record<Tone, string> = {
  /** sits on a dark green panel */
  onDark: "bg-white/8 text-green-100 ring-1 ring-white/10",
  /** sits on white, pale green fill */
  onLight: "bg-green-100 text-brand-green",
  /** pale, for section eyebrows on white */
  pale: "bg-green-50 text-brand-green ring-1 ring-green-100",
  /** solid brand green pill on a white section */
  dark: "bg-brand-green text-green-100",
};

/**
 * `radius.chip` pill. The leading dot is decorative only — every chip that
 * carries meaning also carries its label in text, never colour alone (§1).
 */
export function Chip({
  children,
  tone = "onDark",
  dot = true,
  dotClassName = "bg-brand-gold",
  icon,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  dotClassName?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-chip px-4 py-2 text-caption font-medium",
        tones[tone],
        className,
      )}
    >
      {icon ?? (dot ? <span aria-hidden className={clsx("size-1.5 shrink-0 rounded-full", dotClassName)} /> : null)}
      {children}
    </span>
  );
}
