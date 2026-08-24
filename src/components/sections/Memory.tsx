import { ChatThread } from "@/components/chat/ChatThread";
import { Reveal } from "@/components/motion/Reveal";
import { Chip } from "@/components/ui/Chip";
import { clsx } from "@/lib/clsx";
import { memory } from "@/lib/content";
import { gutter, shell } from "@/lib/layout";

/** A word the design lifts out of the sentence on a solid brand-green tile. */
function Marked({ children }: { children: string }) {
  return (
    <span className="mx-1 inline-block rounded-[0.3em] bg-brand-green px-2.5 py-0.5 text-green-100">{children}</span>
  );
}

export function Memory() {
  const h = memory.headline;

  return (
    <section id="memory" className={clsx(gutter, "bg-surface pb-24 sm:pb-32 lg:pb-40")}>
      <div className={shell}>
        <div className="flex flex-col items-center text-center">
          <Reveal from="up">
            <Chip tone="dark">{memory.chip}</Chip>
          </Reveal>

          <Reveal
            from="up"
            delay={0.08}
            as="h2"
            className="mt-9 max-w-[46ch] text-[clamp(1.5rem,3.1vw,2.3rem)] leading-[1.5] font-medium tracking-[-0.02em] text-[#5f7768]"
          >
            {h.before}
            {h.highlights.map((word) => (
              <Marked key={word}>{word}</Marked>
            ))}
            {h.join}
            <Marked>{h.lastHighlight}</Marked>
            {h.after}
            <span className="block">{h.tail}</span>
          </Reveal>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Before / after — same request, one month apart                      */}
        {/* ------------------------------------------------------------------ */}
        <div className="mt-16 grid gap-5 lg:grid-cols-2">
          {memory.cards.map((card, i) => (
            <Reveal
              key={card.title}
              from={i === 0 ? "right" : "left"}
              delay={i * 0.1}
              scale
              className="grid overflow-hidden rounded-panel bg-subtle sm:grid-cols-[1fr_1.1fr]"
            >
              <div className="flex flex-col gap-3 p-7 sm:p-9">
                <h3 className="text-[1.35rem] leading-tight font-bold tracking-[-0.02em] text-ink">{card.title}</h3>
                {card.body ? <p className="max-w-[28ch] text-body text-muted">{card.body}</p> : null}
              </div>

              <div
                className={clsx(
                  "flex items-center p-5 sm:p-7",
                  card.tone === "pale" ? "bg-green-200" : "bg-brand-green",
                )}
              >
                <div className="w-full rounded-card bg-surface p-4 shadow-bubble">
                  <ChatThread messages={card.thread} tone="light" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
