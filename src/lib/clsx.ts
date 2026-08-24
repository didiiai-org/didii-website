/** Minimal class joiner — no need for a dependency to filter falsy values. */
export function clsx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
