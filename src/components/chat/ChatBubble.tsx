import type { ReactNode } from "react";

import { clsx } from "@/lib/clsx";

export type Speaker = "user" | "didii";

/** Renders `**bold**` runs — the transcript marks confirmed names that way. */
function renderText(text: string): ReactNode[] {
  return text.split("\n").flatMap((line, lineIndex, lines) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
    const nodes: ReactNode[] = parts.map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={`${lineIndex}-${i}`} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={`${lineIndex}-${i}`}>{part}</span>
      ),
    );
    if (lineIndex < lines.length - 1) nodes.push(<br key={`br-${lineIndex}`} />);
    return nodes;
  });
}

/** Small circular didii avatar that sits beside an assistant bubble. */
export function DidiiAvatar({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={clsx(
        "grid size-7 shrink-0 place-items-center self-end rounded-full bg-brand-green",
        "text-[13px] font-extrabold text-green-100",
        className,
      )}
    >
      d
    </span>
  );
}

/**
 * One chat bubble. `type.body` for content; the sheet radius is squared off on
 * the corner nearest the speaker so the thread reads directionally.
 */
export function ChatBubble({
  from,
  children,
  tone = "light",
  withAvatar = false,
  className,
}: {
  from: Speaker;
  children: ReactNode;
  /** `light` = white/grey didii bubble. `dark` = the bubble sits on a dark panel. */
  tone?: "light" | "dark";
  withAvatar?: boolean;
  className?: string;
}) {
  const isUser = from === "user";

  const bubble = (
    <span
      className={clsx(
        "inline-block max-w-[85%] rounded-sheet px-3.5 py-2.5 text-caption leading-snug",
        isUser
          ? "rounded-br-md bg-brand-green text-green-100"
          : tone === "light"
            ? "rounded-bl-md bg-subtle text-ink"
            : "rounded-bl-md bg-surface text-ink shadow-bubble",
        className,
      )}
    >
      {children}
    </span>
  );

  return (
    <div className={clsx("flex items-end gap-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser && withAvatar ? <DidiiAvatar /> : null}
      {bubble}
    </div>
  );
}

export function ChatText({ text }: { text: string }) {
  return <>{renderText(text)}</>;
}
