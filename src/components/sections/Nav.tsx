"use client";

import { motion as fm, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";
import { clsx } from "@/lib/clsx";
import { nav } from "@/lib/content";
import { gutter, shell } from "@/lib/layout";
import { motion } from "@/lib/tokens";

/**
 * Floating white pill navigation. It deepens its shadow and tightens very
 * slightly on scroll — enough to register as "you have moved down the page",
 * not enough to read as an animation.
 */
export function Nav() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  const shadow = useTransform(
    scrollY,
    [0, 140],
    ["0 2px 10px -6px rgba(11,31,20,0.10)", "0 16px 40px -22px rgba(11,31,20,0.40)"],
  );
  const scale = useTransform(scrollY, [0, 160], [1, 0.985]);

  return (
    <div className={clsx("sticky top-4 z-40 sm:top-8", gutter)}>
      <fm.nav
        aria-label="Primary"
        style={reduced ? undefined : { boxShadow: shadow, scale }}
        initial={reduced ? false : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: motion.duration.slow, ease: motion.ease }}
        className={clsx(
          "flex items-center gap-6 rounded-[1.5rem] bg-surface px-6 py-3.5 shadow-card sm:px-7",
          shell,
        )}
      >
        <a href="#main" className="text-brand-green" aria-label="didii — home">
          <Wordmark />
        </a>

        <div className="hidden flex-1 items-center justify-center gap-8 lg:flex">
          {nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative py-1 text-body text-ink/85 transition-colors hover:text-ink"
            >
              {link.label}
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-brand-gold transition-transform duration-200 ease-out group-hover:scale-x-100 motion-reduce:transition-none"
              />
            </a>
          ))}
        </div>

        <div className="ml-auto hidden lg:block">
          <Button href={nav.cta.href} variant="onLight" withArrow={false} className="rounded-chip px-6 py-3">
            {nav.cta.label}
          </Button>
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="ml-auto grid size-11 place-items-center rounded-button text-brand-green lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </fm.nav>

      {open ? (
        <fm.div
          id="mobile-nav"
          initial={reduced ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: motion.duration.fast * 2, ease: motion.ease }}
          className={clsx("mt-2 flex flex-col gap-1 rounded-sheet bg-surface p-3 shadow-sheet lg:hidden", shell)}
        >
          {nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-button px-4 py-3 text-body text-ink hover:bg-green-50"
            >
              {link.label}
            </a>
          ))}
          <Button href={nav.cta.href} variant="onLight" withArrow={false} className="mt-1 justify-center rounded-chip">
            {nav.cta.label}
          </Button>
        </fm.div>
      ) : null}
    </div>
  );
}
