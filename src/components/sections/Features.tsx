import { Coins, ReceiptText, Send, Wallet, Wifi } from "lucide-react";
import type { ReactNode } from "react";

import { Drift } from "@/components/motion/Drift";
import { Reveal } from "@/components/motion/Reveal";
import { Chip } from "@/components/ui/Chip";
import { clsx } from "@/lib/clsx";
import { features } from "@/lib/content";
import { gutter, shell } from "@/lib/layout";

const icons: Record<string, ReactNode> = {
  send: <Send />,
  receipt: <ReceiptText />,
  coins: <Coins />,
  wifi: <Wifi />,
  wallet: <Wallet />,
};

/**
 * Desktop placement for the scattered cards. Percentages, so the constellation
 * holds its shape as the viewport widens. Below `lg` these are ignored and the
 * cards fall into a plain grid.
 */
const placement = [
  "lg:absolute lg:left-1/2 lg:top-0 lg:w-[21%] lg:-translate-x-1/2",
  "lg:absolute lg:left-[3%] lg:top-[38%] lg:w-[21%]",
  "lg:absolute lg:right-[3%] lg:top-[36%] lg:w-[21%]",
  "lg:absolute lg:left-[18%] lg:top-[70%] lg:w-[21%]",
  "lg:absolute lg:right-[15%] lg:top-[74%] lg:w-[21%]",
];

function FeatureCard({
  title,
  body,
  icon,
  className,
  delay,
}: {
  title: string;
  body: string;
  icon: ReactNode;
  className?: string;
  delay: number;
}) {
  return (
    <Reveal from="up" delay={delay} scale className={clsx("relative", className)}>
      <Drift distance={6} duration={10 + delay * 4} delay={delay * 2}>
        <div className="relative rounded-card bg-subtle p-6 pr-8">
          <span
            aria-hidden
            className="absolute -top-3 right-4 grid size-9 place-items-center rounded-[0.65rem] bg-brand-green text-green-100 [&>svg]:size-4.5 [&>svg]:stroke-[1.9]"
          >
            {icon}
          </span>
          <h3 className="text-[1.15rem] leading-tight font-bold tracking-[-0.015em] text-brand-green">{title}</h3>
          <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-[#4a6355]">{body}</p>
        </div>
      </Drift>
    </Reveal>
  );
}

export function Features() {
  return (
    <section id="features" className={clsx(gutter, "bg-surface py-24 sm:py-28 lg:py-32")}>
      <div className={clsx("relative lg:min-h-[700px]", shell)}>
        {/* the heading sits in the middle of the constellation */}
        <div className="flex flex-col items-center text-center lg:absolute lg:top-1/2 lg:left-1/2 lg:w-[38%] lg:-translate-x-1/2 lg:-translate-y-1/2">
          <Reveal from="up">
            <Chip tone="dark">{features.chip}</Chip>
          </Reveal>
          <Reveal
            from="up"
            delay={0.08}
            as="h2"
            className="mt-6 text-[clamp(1.9rem,4.2vw,3.1rem)] leading-[1.12] font-extrabold tracking-[-0.035em] text-ink"
          >
            {features.title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:mt-0 lg:block">
          {features.items.map((item, i) => (
            <FeatureCard
              key={item.title}
              title={item.title}
              body={item.body}
              icon={icons[item.icon]}
              delay={0.06 * i}
              className={placement[i]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
