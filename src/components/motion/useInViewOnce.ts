"use client";

import { useInView } from "framer-motion";
import { useRef } from "react";

/**
 * Fires once when the element scrolls into view. Chat threads use this so the
 * conversation starts playing when the reader actually reaches it, not while
 * it's still three screens below the fold.
 */
export function useInViewOnce<T extends HTMLElement = HTMLDivElement>(margin = "-20% 0px -20% 0px") {
  const ref = useRef<T>(null);
  // framer-motion types `margin` as a template-literal union; the runtime takes
  // any valid root-margin string.
  const inView = useInView(ref, { once: true, margin: margin as `${number}% ${number}px ${number}% ${number}px` });
  return { ref, inView };
}
