import { CheckCircle2, ListOrdered, ReceiptText, RefreshCw, UserRound } from "lucide-react";
import type { ReactNode } from "react";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Chip } from "@/components/ui/Chip";
import { clsx } from "@/lib/clsx";
import { problem } from "@/lib/content";
import { gutter } from "@/lib/layout";

const icons: Record<string, ReactNode> = {
  receipt: <ReceiptText />,
  user: <UserRound />,
  list: <ListOrdered />,
  check: <CheckCircle2 />,
};

/** Small rounded glyph tile that sits inline in the sentence. */
function InlineIcon({ children, tone = "sage" }: { children: ReactNode; tone?: "sage" | "rust" }) {
  return (
    <span
      aria-hidden
      className={clsx(
        "mx-1 inline-grid size-[0.85em] min-h-6 min-w-6 translate-y-[0.08em] place-items-center rounded-[0.28em]",
        "[&>svg]:size-[62%] [&>svg]:stroke-[2.2]",
        tone === "sage" ? "bg-[#7fa189] text-white" : "bg-[#b8551d] text-white",
      )}
    >
      {children}
    </span>
  );
}

export function Problem() {
  return (
    <section id="problem" className={clsx(gutter, "bg-surface py-24 sm:py-32 lg:py-40")}>
      <div className="mx-auto flex max-w-[52rem] flex-col items-center text-center">
        <Reveal from="up">
          <Chip tone="pale" dotClassName="bg-ink">
            {problem.chip}
          </Chip>
        </Reveal>

        <Reveal
          from="up"
          delay={0.08}
          className="mt-10 text-[clamp(1.6rem,3.2vw,2.35rem)] leading-[1.35] font-bold tracking-[-0.02em] text-ink"
        >
          <p>{problem.lead}</p>
        </Reveal>

        <Reveal
          from="up"
          delay={0.14}
          className="mt-7 text-[clamp(1.6rem,3.2vw,2.35rem)] leading-[1.35] font-bold tracking-[-0.02em] text-ink"
        >
          <p>
            {problem.turn}
            <InlineIcon tone="rust">
              <RefreshCw />
            </InlineIcon>
            .
          </p>
        </Reveal>

        {/* The loop, spelled out. Staggered so each chore lands separately. */}
        <RevealGroup
          className="mt-8 flex flex-col gap-3 text-[clamp(1.3rem,2.7vw,1.95rem)] leading-[1.45] font-medium tracking-[-0.015em] text-[#6b8a77]"
          delay={0.1}
          stagger={0.11}
        >
          {problem.steps.map((line, lineIndex) => (
            <RevealItem key={lineIndex} as="p">
              {line.map((step, i) => (
                <span key={step.text}>
                  {i > 0 ? " " : null}
                  {step.text}
                  <InlineIcon>{icons[step.icon]}</InlineIcon>.
                </span>
              ))}
            </RevealItem>
          ))}
        </RevealGroup>

        <RevealGroup
          className="mt-9 flex flex-col gap-7 text-[clamp(1.3rem,2.7vw,1.95rem)] leading-[1.45] font-medium tracking-[-0.015em] text-[#6b8a77]"
          stagger={0.12}
        >
          {problem.closing.map((line) => (
            <RevealItem key={line} as="p">
              {line}
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
