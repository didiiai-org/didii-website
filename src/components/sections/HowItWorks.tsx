import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatThread } from "@/components/chat/ChatThread";
import { PinPad } from "@/components/chat/PinPad";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Chip } from "@/components/ui/Chip";
import { howItWorks } from "@/lib/content";
import { clsx } from "@/lib/clsx";
import { gutter, shell } from "@/lib/layout";

/** The confirmation didii sends before any outbound money moves. */
function ReceiptBubble({ receipt }: { receipt: NonNullable<(typeof howItWorks.steps)[1]["receipt"]> }) {
  return (
    <ChatBubble from="didii" tone="dark" withAvatar className="max-w-full!">
      <span className="block max-w-[30ch]">
        {receipt.intro}
        <span className="mt-2 block">
          {receipt.rows.map(([label, value]) => (
            <span key={label} className="block">
              <span className="text-muted">{label}: </span>
              <span className="tabular font-medium">{value}</span>
            </span>
          ))}
        </span>
        <span className="mt-2 block">{receipt.outro}</span>
        <span className="tabular mt-1 block font-semibold">{receipt.confirm}</span>
      </span>
    </ChatBubble>
  );
}

export function HowItWorks() {
  const [tell, review, approve] = howItWorks.steps;

  return (
    <section id="how-it-works" className={clsx(gutter, "bg-brand-green py-24 sm:py-28 lg:py-32")}>
      <div className={shell}>
        <div className="flex flex-col items-center text-center">
          <Reveal from="up">
            <Chip tone="onDark">{howItWorks.chip}</Chip>
          </Reveal>
          <Reveal
            from="up"
            delay={0.08}
            as="h2"
            className="mt-8 max-w-[22ch] text-[clamp(1.85rem,4vw,3rem)] leading-[1.15] font-bold tracking-[-0.03em] text-green-100"
          >
            {howItWorks.title}
          </Reveal>
        </div>

        <RevealGroup className="mt-14 grid gap-5 lg:grid-cols-3" stagger={0.12}>
          {/* 1 — say it */}
          <RevealItem className="flex flex-col gap-6 rounded-panel bg-white/5 p-7 ring-1 ring-white/8 sm:p-8">
            <header className="flex flex-col gap-3">
              <h3 className="text-[1.5rem] leading-tight font-bold tracking-[-0.02em] text-green-100">{tell.title}</h3>
              <p className="max-w-[34ch] text-body text-green-100/70">{tell.body}</p>
            </header>
            <div className="mt-auto rounded-card bg-white/6 p-4 sm:p-5">
              <ChatThread messages={tell.thread!} tone="dark" avatars />
            </div>
          </RevealItem>

          {/* 2 — check it */}
          <RevealItem className="flex flex-col gap-6 rounded-panel bg-white/5 p-7 ring-1 ring-white/8 sm:p-8">
            <header className="flex flex-col gap-3">
              <h3 className="text-[1.5rem] leading-tight font-bold tracking-[-0.02em] text-green-100">
                {review.title}
              </h3>
              <p className="max-w-[34ch] text-body text-green-100/70">{review.body}</p>
            </header>
            <div className="mt-auto flex flex-col gap-3 rounded-card bg-white/6 p-4 sm:p-5">
              <ChatBubble from="user" tone="dark">
                12k
              </ChatBubble>
              <ReceiptBubble receipt={review.receipt!} />
              <ChatBubble from="user" tone="dark">
                Yes pay
              </ChatBubble>
            </div>
          </RevealItem>

          {/* 3 — authorise it */}
          <RevealItem className="flex flex-col gap-6 rounded-panel bg-white/5 p-7 ring-1 ring-white/8 sm:p-8">
            <header className="flex flex-col gap-3">
              <h3 className="text-[1.5rem] leading-tight font-bold tracking-[-0.02em] text-green-100">
                {approve.title}
              </h3>
              <p className="max-w-[34ch] text-body text-green-100/70">{approve.body}</p>
            </header>
            <div className="mt-auto flex flex-col gap-4 rounded-card bg-white/6 p-4 sm:p-5">
              <ChatBubble from="user" tone="dark">
                Yes pay
              </ChatBubble>
              <PinPad label={approve.pin!.label} length={approve.pin!.length} />
            </div>
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
}
