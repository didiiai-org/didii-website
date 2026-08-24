"use client";

import { motion as fm, useReducedMotion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";

import { HeroThread } from "@/components/chat/HeroThread";
import { Button } from "@/components/ui/Button";
import { clsx } from "@/lib/clsx";
import { hero } from "@/lib/content";
import { gutter, shell } from "@/lib/layout";
import { motion } from "@/lib/tokens";

/**
 * The hero sits on the light sage wash rather than in a card.
 *
 * Geometry is measured from the Figma frame at 1440×900 and expressed as
 * percentages of the shell, so the composition holds its proportions as the
 * viewport grows:
 *
 *   subject   left 39.2%, width 40.5% of the shell, anchored to the section floor
 *   transcript  154px below the content top, inset 48px from the shell's right edge
 *
 * The subject is a transparent cutout with **no surrounding margin** — see
 * `public/images/IMAGES.md`. Transparent padding in the export is not neutral
 * here: `object-contain` fits the whole canvas, so padding shrinks the figure
 * and pushes it down the frame.
 */
export function Hero() {
  const reduced = useReducedMotion();

  const line = {
    hidden: { opacity: 0, y: 30 },
    shown: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: motion.duration.slow, delay: 0.18 + i * 0.1, ease: motion.ease },
    }),
  };

  const rise = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: motion.duration.base, delay, ease: motion.ease },
  });

  return (
    <section aria-labelledby="hero-title" className={clsx("relative", gutter)}>
      <div className={clsx("relative", shell)}>
        {/* ---------------------------------------------------------------- */}
        {/* The subject — anchored to the section floor, behind everything     */}
        {/* ---------------------------------------------------------------- */}
        <fm.div
          initial={reduced ? false : { opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: motion.ease }}
          className="pointer-events-none absolute bottom-0 left-1/2 z-0 aspect-1037/1118 w-[92%] max-w-107.5 -translate-x-1/2 sm:max-w-125 lg:left-[39.2%] lg:w-[40.5%] lg:max-w-none lg:translate-x-0"
        >
          <Image
            src={hero.photo.src}
            alt={hero.photo.alt}
            fill
            priority
            sizes="(max-width: 1024px) 92vw, 41vw"
            className="object-contain object-bottom"
          />
        </fm.div>

        <div className="relative grid pt-20 sm:pt-28 lg:grid-cols-2 lg:pt-24.5">
          {/* -------------------------------------------------------------- */}
          {/* The promise                                                     */}
          {/* -------------------------------------------------------------- */}
          <div className="relative z-10 flex flex-col items-start">
            <fm.span
              {...rise(0.08)}
              className="inline-flex items-center gap-2.5 rounded-chip bg-surface px-5 py-3 text-caption font-medium text-ink shadow-card"
            >
              <span aria-hidden className="size-1.5 rounded-full bg-brand-gold" />
              {hero.eyebrow}
            </fm.span>

            <h1
              id="hero-title"
              className="mt-8 text-[clamp(2.6rem,5.4vw,4.75rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-ink"
            >
              {hero.title.map((text, i) => (
                <fm.span
                  key={text}
                  custom={i}
                  variants={line}
                  initial={reduced ? false : "hidden"}
                  animate="shown"
                  className="block"
                >
                  {text}
                </fm.span>
              ))}
            </h1>

            {/* measure tuned to the frame's four-line break, not an arbitrary ch count */}
            <fm.p {...rise(0.46)} className="mt-7 max-w-140 font-semibold text-[1.125rem] leading-[1.6] text-ink/75">
              {hero.body}
            </fm.p>

            <fm.div {...rise(0.58)} className="mt-9">
              <Button href={hero.cta.href} variant="onLight" className="rounded-input px-7 py-4 text-[1.0625rem]">
                {hero.cta.label}
              </Button>
            </fm.div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* The product, mid-conversation                                   */}
          {/* -------------------------------------------------------------- */}
          <div className="relative z-20 mt-14 min-h-105 sm:min-h-130 lg:mt-0 lg:min-h-156.5">
            {/* Transcript and assurance travel together, right-aligned. The
                pill follows the card in flow rather than pinning to the section
                floor, so it stays tucked under the conversation at any width. */}
            <div className="absolute top-0 right-0 flex max-w-full flex-col items-end lg:top-38.5 lg:right-12">
              <fm.div
                initial={reduced ? false : { opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: motion.duration.slow, delay: 0.6, ease: motion.ease }}
                className="w-[320px] max-w-full lg:w-75"
              >
                <HeroThread />
              </fm.div>

              <fm.span
                initial={reduced ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: motion.duration.base, delay: 0.95, ease: motion.ease }}
                className="mt-5 inline-flex items-center gap-2.5 rounded-chip bg-brand-green px-5 py-3 text-caption text-green-100 shadow-sheet sm:text-body sm:whitespace-nowrap"
              >
                <CheckCircle2 aria-hidden className="size-4 shrink-0 text-brand-gold" strokeWidth={2.4} />
                {hero.assurance}
              </fm.span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
