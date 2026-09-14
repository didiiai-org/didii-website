import Image from "next/image";

import { Drift } from "@/components/motion/Drift";
import { Reveal } from "@/components/motion/Reveal";
import { Chip } from "@/components/ui/Chip";
import { clsx } from "@/lib/clsx";
import { backToLife } from "@/lib/content";
import { gutter, shell } from "@/lib/layout";

/** Desktop constellation — the four moments people go back to. */
const placement = [
  "lg:absolute lg:left-[24%] lg:top-0 lg:w-[17%]",
  "lg:absolute lg:left-[59%] lg:top-[2%] lg:w-[17%]",
  "lg:absolute lg:left-[5%] lg:top-[45%] lg:w-[17%]",
  "lg:absolute lg:right-[4%] lg:top-[49%] lg:w-[17%]",
];

export function BackToLife() {
  return (
    <section id="safety" className={clsx(gutter, "bg-brand-green py-24 sm:py-28 lg:py-32")}>
      <div className={clsx("relative lg:min-h-[760px]", shell)}>
        {/* centred claim */}
        <div className="flex flex-col items-center text-center lg:absolute lg:top-[46%] lg:left-1/2 lg:w-[60%] lg:-translate-x-1/2 lg:-translate-y-1/2">
          <Reveal
            from="up"
            as="h2"
            className="text-[clamp(1.9rem,3.6vw,2.85rem)] leading-[1.12] font-bold tracking-[-0.03em] text-green-100"
          >
            {backToLife.title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </Reveal>
          <Reveal
            from="up"
            delay={0.1}
            as="p"
            className="mt-6 max-w-[60ch] text-[1.0625rem] leading-relaxed text-green-100/70"
          >
            {backToLife.body}
          </Reveal>
        </div>

        {/* the four moments */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:mt-0 lg:block">
          {backToLife.photos.map((photo, i) => (
            <Reveal
              key={photo.label}
              from="up"
              delay={0.08 * i}
              scale
              as="figure"
              className={clsx("relative", placement[i])}
            >
              <Drift distance={7} duration={11 + i} delay={i * 0.7}>
                {/* Frame follows the source ratio — the shipped shots are 16:9,
                    and a 4:3 frame cropped a quarter of each one off the sides. */}
                <div className="relative aspect-video overflow-hidden rounded-card">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 1024px) 50vw, 18vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="absolute -bottom-3 left-0 rounded-chip bg-gold-200 px-4 py-2 text-caption font-medium text-ink lg:-left-3">
                  {photo.label}
                </figcaption>
              </Drift>
            </Reveal>
          ))}
        </div>

        {/* the thesis, one line */}
        <div className="mt-20 flex justify-center lg:absolute lg:inset-x-0 lg:bottom-0 lg:mt-0">
          <Reveal from="up" delay={0.2}>
            <Chip tone="onDark" className="px-5 py-3 text-body">
              {backToLife.footnote}
            </Chip>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
