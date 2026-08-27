"use client";

import { motion as fm, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { finalCta } from "@/lib/content";
import { motion } from "@/lib/tokens";
import { clsx } from "@/lib/clsx";
import { gutter, shell } from "@/lib/layout";

/** Where each avatar sits on the arc, as a percentage of the panel width. */
const seats = [
  { left: "22%", top: "64%" },
  { left: "50%", top: "37%" },
  { left: "78%", top: "64%" },
];

export function FinalCta() {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(finalCta.bodyFallback);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/count")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && typeof data?.count === "number") setCount(data.count);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="waitlist" className={clsx(gutter, "bg-surface py-16 sm:py-20")}>
      <Reveal
        from="up"
        scale
        className={clsx(
          "flex flex-col items-center overflow-hidden rounded-panel bg-brand-green px-6 pt-16 pb-0 text-center sm:px-10 sm:pt-20",
          shell,
        )}
      >
        <h2 className="text-[clamp(2.25rem,5.4vw,4rem)] leading-tight font-bold tracking-[-0.035em] text-green-100">
          {finalCta.title}
        </h2>

        <p className="mt-5 max-w-[58ch] text-[1.0625rem] leading-relaxed text-green-100/65">
          {finalCta.bodyPrefix}
          {count.toLocaleString()}
          {finalCta.bodySuffix}
        </p>

        <Button href={finalCta.cta.href} variant="gold" className="mt-9 px-7 py-4 text-[1.0625rem]">
          {finalCta.cta.label}
        </Button>

        {/* the arc — three people already waiting */}
        <div className="relative mt-14 h-[190px] w-full max-w-[860px] sm:h-[230px]">
          <svg
            aria-hidden
            viewBox="0 0 860 230"
            fill="none"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
          >
            <fm.path
              d="M 190 148 Q 430 22 670 148"
              stroke="rgba(227,245,230,0.35)"
              strokeWidth="1.25"
              fill="none"
              initial={reduced ? false : { pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: motion.ease }}
            />
          </svg>

          {finalCta.avatars.map((avatar, i) => (
            <fm.div
              key={avatar.src}
              className="absolute size-[74px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full ring-2 ring-green-100/40 sm:size-[86px]"
              style={seats[i]}
              initial={reduced ? false : { opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: motion.duration.base, delay: 0.5 + i * 0.14, ease: motion.ease }}
            >
              <Image src={avatar.src} alt={avatar.alt} fill sizes="90px" className="object-cover" />
            </fm.div>
          ))}
        </div>

        <div className="pb-16 sm:pb-20">
          <Chip tone="onDark" className="px-5 py-3 text-body">
            {finalCta.note}
          </Chip>
        </div>
      </Reveal>
    </section>
  );
}
