import { clsx } from "@/lib/clsx";

/**
 * `motion.thinking` — the "didii is thinking" dots. Spec: they appear less than
 * 100ms after send, which is why the thread schedules them immediately rather
 * than waiting on the reply timer.
 */
export function TypingDots({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    <span
      role="status"
      aria-label="didii is thinking"
      className={clsx(
        "inline-flex items-center gap-1 rounded-sheet px-4 py-3",
        tone === "light" ? "bg-subtle" : "bg-white/10",
        className,
      )}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden
          className={clsx("size-1.5 rounded-full", tone === "light" ? "bg-muted" : "bg-green-100")}
          style={{ animation: "thinking 1.2s cubic-bezier(0.22,1,0.36,1) infinite", animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
