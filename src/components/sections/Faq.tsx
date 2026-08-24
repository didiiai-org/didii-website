"use client";

import { AnimatePresence, motion as fm, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { clsx } from "@/lib/clsx";
import { faq } from "@/lib/content";
import { motion } from "@/lib/tokens";
import { gutter, shell } from "@/lib/layout";

/**
 * Two-panel FAQ: the question list on the left, the answer on a cream sheet to
 * the right. On mobile it collapses to a plain accordion, because a persistent
 * answer panel on a narrow screen is just a second scroll region.
 */
export function Faq() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);

  return (
    <section id="faq" className={clsx(gutter, "bg-brand-green pb-24 sm:pb-28 lg:pb-32")}>
      <div className={shell}>
        <Reveal
          from="up"
          as="h2"
          className="text-center text-[clamp(2rem,4.6vw,3.4rem)] leading-tight font-bold tracking-[-0.035em] text-green-100"
        >
          {faq.title}
        </Reveal>

        <Reveal
          from="up"
          delay={0.1}
          scale
          className="mt-12 grid gap-4 rounded-panel bg-white/5 p-4 ring-1 ring-white/8 sm:p-6 lg:grid-cols-2 lg:gap-6 lg:p-7"
        >
          {/* questions */}
          <div className="flex flex-col gap-4">
            <h3 className="px-2 pt-2 text-[1.5rem] font-bold tracking-[-0.02em] text-green-100 lg:px-3">Questions</h3>
            <ul className="flex flex-col gap-3">
              {faq.items.map((item, i) => {
                const selected = i === active;
                return (
                  <li key={item.q}>
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      aria-expanded={selected}
                      aria-controls="faq-answer"
                      className={clsx(
                        "w-full rounded-sheet px-5 py-4 text-left text-body transition-colors duration-200",
                        "min-h-11 focus-visible:outline-2",
                        selected
                          ? "bg-green-900 font-semibold text-green-100 ring-1 ring-gold-200"
                          : "bg-black/15 text-green-100/60 hover:bg-black/25 hover:text-green-100/85",
                      )}
                    >
                      {item.q}
                    </button>

                    {/* mobile: the answer lives under its question */}
                    <AnimatePresence initial={false}>
                      {selected ? (
                        <fm.div
                          key="mobile-answer"
                          initial={reduced ? false : { height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: motion.duration.fast * 2, ease: motion.ease }}
                          className="overflow-hidden lg:hidden"
                        >
                          <p className="mt-3 rounded-sheet bg-gold-200 px-5 py-4 text-body leading-relaxed text-ink">
                            {item.a}
                          </p>
                        </fm.div>
                      ) : null}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* answer — desktop only */}
          <div className="hidden rounded-panel bg-gold-200 p-6 lg:flex lg:flex-col lg:gap-5 lg:p-8">
            <h3 className="text-[1.5rem] font-bold tracking-[-0.02em] text-ink">Answer</h3>
            <AnimatePresence mode="wait">
              <fm.p
                key={active}
                id="faq-answer"
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: motion.duration.fast * 2, ease: motion.ease }}
                className="rounded-sheet bg-brand-green px-6 py-5 text-[1.0625rem] leading-relaxed text-green-100"
              >
                {faq.items[active].a}
              </fm.p>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
