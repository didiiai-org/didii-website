"use client";

import { AnimatePresence, motion as fm, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import { ChatBubble, ChatText, DidiiAvatar, type Speaker } from "@/components/chat/ChatBubble";
import { TypingDots } from "@/components/chat/TypingDots";
import { useInViewOnce } from "@/components/motion/useInViewOnce";
import { clsx } from "@/lib/clsx";
import { motion } from "@/lib/tokens";

export interface Message {
  readonly from: Speaker;
  readonly text: string;
}

/** How long a bubble waits before it lands, by who is speaking. */
const PACE = {
  /** the user "types" — short */
  user: 700,
  /** didii thinks, then answers */
  didii: 1250,
} as const;

/**
 * A didii conversation that plays itself once the reader reaches it.
 *
 * Messages land in order; before every didii reply the thinking dots appear
 * (`motion.thinking`, <100ms after the preceding send). Under reduce-motion the
 * whole transcript is rendered at once — the information is the point, the
 * performance is the garnish.
 */
export function ChatThread({
  messages,
  tone = "light",
  avatars = false,
  className,
  loop = false,
  startDelay = 400,
}: {
  messages: readonly Message[];
  tone?: "light" | "dark";
  avatars?: boolean;
  className?: string;
  /** Restart the conversation after it finishes — used in the hero. */
  loop?: boolean;
  startDelay?: number;
}) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const [shown, setShown] = useState(0);
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    if (reduced || !inView) return;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const schedule = (fn: () => void, ms: number) => {
      timers.push(setTimeout(() => !cancelled && fn(), ms));
    };

    const run = (index: number, at: number) => {
      if (index >= messages.length) {
        if (loop) {
          schedule(() => {
            setShown(0);
            run(0, 0);
          }, at + 3200);
        }
        return;
      }

      const message = messages[index];
      const wait = PACE[message.from];

      if (message.from === "didii") {
        // dots appear immediately after the previous send, then clear on reply
        schedule(() => setThinking(true), at + motion.thinkingDelay * 1000);
        schedule(() => {
          setThinking(false);
          setShown(index + 1);
        }, at + wait);
      } else {
        schedule(() => setShown(index + 1), at + wait);
      }

      run(index + 1, at + wait);
    };

    run(0, startDelay);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [inView, reduced, messages, loop, startDelay]);

  const visible = reduced ? messages.length : shown;

  return (
    <div ref={ref} className={clsx("flex flex-col gap-2.5", className)} aria-live="polite">
      {messages.slice(0, visible).map((message, i) => (
        <fm.div
          key={`${i}-${message.text.slice(0, 12)}`}
          initial={reduced ? false : { opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: motion.duration.fast * 1.6, ease: motion.ease }}
        >
          <ChatBubble from={message.from} tone={tone} withAvatar={avatars}>
            <ChatText text={message.text} />
          </ChatBubble>
        </fm.div>
      ))}

      <AnimatePresence>
        {thinking && !reduced ? (
          <fm.div
            key="thinking"
            className="flex items-end gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: motion.duration.fast, ease: motion.ease }}
          >
            {avatars ? <DidiiAvatar /> : null}
            <TypingDots tone={tone === "dark" ? "dark" : "light"} />
          </fm.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
