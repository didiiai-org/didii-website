"use client";

import { AnimatePresence, motion as fm, useReducedMotion } from "framer-motion";
import { Mic } from "lucide-react";
import { useEffect, useState } from "react";

import { TypingDots } from "@/components/chat/TypingDots";
import { useInViewOnce } from "@/components/motion/useInViewOnce";
import { hero } from "@/lib/content";
import { motion } from "@/lib/tokens";

/**
 * The hero conversation: a voice note in, a confirmation back, an approval out.
 *
 * It plays once when it reaches the viewport, then holds. The approve/decline
 * row is rendered as real buttons — a landing page mock-up of a money control
 * should still be reachable by keyboard and readable by a screen reader, even
 * though nothing here submits anything.
 *
 * Under reduce-motion the whole exchange is present on first paint.
 */

/** Beat timings, in ms from the moment the thread enters view. */
const BEATS = { voice: 500, thinking: 1000, card: 2100, reply: 3400 } as const;

export function HeroThread({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLDivElement>("-15% 0px -15% 0px");
  const [step, setStep] = useState(0);
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    if (reduced || !inView) return;
    const t = [
      setTimeout(() => setStep(1), BEATS.voice),
      setTimeout(() => setThinking(true), BEATS.thinking),
      setTimeout(() => {
        setThinking(false);
        setStep(2);
      }, BEATS.card),
      setTimeout(() => setStep(3), BEATS.reply),
    ];
    return () => t.forEach(clearTimeout);
  }, [inView, reduced]);

  const at = reduced ? 3 : step;

  const enter = (delay = 0) => ({
    initial: reduced ? false : { opacity: 0, y: 12, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: motion.duration.fast * 2, delay, ease: motion.ease },
  });

  return (
    <div
      ref={ref}
      aria-live="polite"
      className={`flex flex-col gap-2.5 rounded-sheet border border-white/45 bg-white/25 p-3 backdrop-blur-lg ${className ?? ""}`}
    >
      {/* 1 — the voice note */}
      {at >= 1 ? (
        <fm.div {...enter()} className="flex justify-end">
          <span className="rounded-input rounded-br-md bg-brand-green px-3.5 py-2 text-caption text-green-100">
            <span className="flex items-center gap-1.5 font-medium">
              <Mic aria-hidden className="size-3.5" strokeWidth={2.25} />
              {hero.voice.duration} Voice message
            </span>
            <span className="mt-1 block text-green-100/85">&ldquo;{hero.voice.transcript}&rdquo;</span>
          </span>
        </fm.div>
      ) : null}

      {/* didii is thinking — appears <100ms after the send */}
      <AnimatePresence>
        {thinking ? (
          <fm.div
            key="thinking"
            className="flex justify-start"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: motion.duration.fast, ease: motion.ease }}
          >
            <TypingDots tone="dark" />
          </fm.div>
        ) : null}
      </AnimatePresence>

      {/* 2 — what didii is about to do, and the two ways out of it */}
      {at >= 2 ? (
        <fm.div {...enter()} className="flex flex-col gap-2">
          <div className="rounded-input rounded-bl-md bg-white/85 px-3.5 py-2.5 text-caption leading-[1.5] text-ink">
            <p>
              {hero.confirmation.lead} <span className="tabular font-semibold">{hero.confirmation.amount}</span>{" "}
              {hero.confirmation.recipient}
            </p>
            {hero.confirmation.rows.map((row) => (
              <p key={row} className="tabular">
                {row}
              </p>
            ))}
            <p className="mt-1">{hero.confirmation.question}</p>
          </div>

          {/* outbound money always offers a decline as prominent as the approve */}
          <div className="flex gap-2">
            <button
              type="button"
              className="min-h-11 flex-1 rounded-input bg-green-200/80 px-4 py-2 text-caption font-medium text-brand-green/70 transition-colors hover:bg-green-200"
            >
              {hero.confirmation.decline}
            </button>
            <button
              type="button"
              className="min-h-11 flex-1 rounded-input bg-brand-green px-4 py-2 text-caption font-semibold text-green-100 transition-colors hover:bg-green-700"
            >
              {hero.confirmation.approve}
            </button>
          </div>
        </fm.div>
      ) : null}

      {/* 3 — the Yes */}
      {at >= 3 ? (
        <fm.div {...enter()} className="flex justify-end">
          <span className="rounded-input rounded-br-md bg-brand-green px-3.5 py-2 text-caption text-green-100">
            {hero.reply}
          </span>
        </fm.div>
      ) : null}
    </div>
  );
}
