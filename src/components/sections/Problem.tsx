import { CheckCircle2, ListOrdered, ReceiptText, RefreshCw, UserRound } from "lucide-react";
import type { ReactNode } from "react";

import { ScrollTint, TintFade, TintWords } from "@/components/motion/ScrollTint";
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

const wordCount = (text: string) => text.trim().split(/\s+/).length;

/**
 * Every word of the section numbered in reading order, so the scroll sweep can
 * be spread across the whole block: the copy darkens continuously from the first
 * line to the last instead of restarting inside each paragraph. `total` is the
 * denominator every tinted run shares.
 */
const tint = (() => {
  let next = 0;
  /** Claims a run of words and returns where it starts. */
  const take = (text: string) => {
    const at = next;
    next += wordCount(text);
    return at;
  };

  const lead = take(problem.lead);
  const turn = take(problem.turn);
  const steps = problem.steps.map((line) => line.map((step) => take(step.text)));
  const closing = problem.closing.map((line) => take(line));

  return { lead, turn, steps, closing, total: next };
})();

/** Index of a run's last word — what the glyph that follows it rides on. */
const endOf = (from: number, text: string) => from + wordCount(text) - 1;

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
      {/*
        The section reads as one long sentence, so it gets one sweep. Colours on
        the paragraphs below stay as the pre-hydration and reduce-motion floor —
        `ScrollTint` only ever paints over them.
      */}
      <ScrollTint className="mx-auto flex max-w-[52rem] flex-col items-center text-center">
        <Chip tone="pale" dotClassName="bg-ink">
          {problem.chip}
        </Chip>

        <div className="mt-10 text-[clamp(1.6rem,3.2vw,2.35rem)] leading-[1.35] font-bold tracking-[-0.02em] text-ink">
          <p>
            <TintWords text={problem.lead} tone="ink" from={tint.lead} total={tint.total} />
          </p>
        </div>

        <div className="mt-7 text-[clamp(1.6rem,3.2vw,2.35rem)] leading-[1.35] font-bold tracking-[-0.02em] text-ink">
          <p>
            <TintWords text={problem.turn} tone="ink" from={tint.turn} total={tint.total} />
            <TintFade index={endOf(tint.turn, problem.turn)} total={tint.total}>
              <InlineIcon tone="rust">
                <RefreshCw />
              </InlineIcon>
              .
            </TintFade>
          </p>
        </div>

        {/* The loop, spelled out. */}
        <div className="mt-8 flex flex-col gap-3 text-[clamp(1.3rem,2.7vw,1.95rem)] leading-[1.45] font-medium tracking-[-0.015em] text-[#6b8a77]">
          {problem.steps.map((line, lineIndex) => (
            <p key={lineIndex}>
              {line.map((step, i) => (
                <span key={step.text}>
                  {i > 0 ? " " : null}
                  <TintWords text={step.text} tone="sage" from={tint.steps[lineIndex][i]} total={tint.total} />
                  <TintFade index={endOf(tint.steps[lineIndex][i], step.text)} total={tint.total}>
                    <InlineIcon>{icons[step.icon]}</InlineIcon>.
                  </TintFade>
                </span>
              ))}
            </p>
          ))}
        </div>

        <div className="mt-9 flex flex-col gap-7 text-[clamp(1.3rem,2.7vw,1.95rem)] leading-[1.45] font-medium tracking-[-0.015em] text-[#6b8a77]">
          {problem.closing.map((line, lineIndex) => (
            <p key={line}>
              <TintWords text={line} tone="sage" from={tint.closing[lineIndex]} total={tint.total} />
            </p>
          ))}
        </div>
      </ScrollTint>
    </section>
  );
}
