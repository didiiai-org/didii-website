import { clsx } from "@/lib/clsx";

/**
 * The didii wordmark. `type.display` — 800 weight, −4px tracking — and the dot
 * is always `color.brand.gold`. It is the only place `type.display` is allowed.
 */
export function Wordmark({
  className,
  dotClassName,
  size = "nav",
}: {
  className?: string;
  dotClassName?: string;
  size?: "nav" | "footer";
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-baseline font-extrabold tracking-[-0.05em] select-none",
        size === "nav" ? "text-[26px] leading-none" : "text-[56px] leading-[0.9]",
        className,
      )}
    >
      didii
      <span className={clsx("text-brand-gold", dotClassName)}>.</span>
    </span>
  );
}
