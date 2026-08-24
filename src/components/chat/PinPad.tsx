"use client";

import { motion as fm, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

import { useInViewOnce } from "@/components/motion/useInViewOnce";
import { clsx } from "@/lib/clsx";
import { motion } from "@/lib/tokens";

/**
 * The four-digit transaction PIN, filling itself once in view.
 *
 * The dots fill, then the panel confirms. `motion.shake` is wired for the error
 * state the app uses but is never triggered here — the landing page should not
 * rehearse a failure.
 */
export function PinPad({ label, length = 4 }: { label: string; length?: number }) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const [filled, setFilled] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (reduced || !inView) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= length; i += 1) {
      timers.push(setTimeout(() => setFilled(i), 500 + i * 280));
    }
    timers.push(setTimeout(() => setDone(true), 500 + length * 280 + 420));
    return () => timers.forEach(clearTimeout);
  }, [inView, reduced, length]);

  const complete = reduced ? true : done;
  const shown = reduced ? length : filled;

  return (
    <div ref={ref} className="flex flex-col items-center gap-4 rounded-card bg-green-100 px-6 py-7">
      <p className="text-caption font-semibold text-brand-green">{label}</p>

      <div className="flex items-center gap-3">
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              "grid size-11 place-items-center rounded-input border transition-colors duration-200",
              i < shown ? "border-brand-green bg-white" : "border-brand-green/35 bg-white/60",
            )}
          >
            {i < shown ? (
              <fm.span
                initial={reduced ? false : { scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: motion.duration.fast, ease: motion.ease }}
                className="size-2.5 rounded-full bg-brand-green"
              />
            ) : null}
          </div>
        ))}
      </div>

      {/* success reads as icon + label, never colour alone (§1) */}
      <fm.p
        initial={reduced ? false : { opacity: 0, y: 6 }}
        animate={complete ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
        transition={{ duration: motion.duration.fast * 2, ease: motion.ease }}
        className="flex items-center gap-1.5 text-caption font-semibold text-status-success"
      >
        <Check aria-hidden className="size-4" strokeWidth={3} />
        Approved
      </fm.p>
    </div>
  );
}
