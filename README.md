# didii — landing page

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Framer Motion.

Built from the Figma frame `DiidiAi · V1` (node `1222-3877`) against
**didii — Design Tokens v0.9**.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run start   # serve the build
```

---

## The token contract

The whole point of the token spec is that **no screen uses a raw value**. That
rule is enforced here the same way it is in Flutter:

- `src/app/globals.css` → the `@theme` block. Every colour, type step, radius,
  shadow and motion curve is a named CSS variable. Tailwind generates its
  utilities *from* these, so `bg-brand-green` and `rounded-card` resolve to the
  token, not to a hex someone typed.
- `src/lib/tokens.ts` → the JavaScript mirror. Only what JS actually needs:
  motion durations, easing curves, the reveal viewport config, and the money
  status map. A token added on one side without a counterpart on the other is a
  review fail — same rule as the Figma ↔ Flutter contract.

Rename a token in `globals.css` and it changes everywhere. There is one
deliberate exception: a handful of muted greens in section copy are written as
arbitrary values (`text-[#5f7768]`) because they are mid-ramp steps the spec
still marks ⚠️. **Promote them to real tokens once
`didii-brand-guidelines.pdf` is extracted** — search the codebase for `text-[#`
to find every one.

### Still open (spec §7)

1. Exact green ramp, neutral greys and status hues — the ramp here is derived
   from `#0C2B1A` and needs confirming against the brand PDF.
2. Shadow values — `--shadow-card` / `--shadow-sheet` / `--shadow-bubble` are
   soft and low as the spec asks, but the numbers are a proposal.
3. Dark mode — out of MVP, so not implemented. The tokens are structured to take
   a second `@theme` block when it lands.
4. Icon set — currently **lucide-react**. Swap it if design wants custom glyphs;
   icons are referenced by string key in `src/lib/content.ts` and mapped in each
   section, so a swap touches the map, not the markup.

---

## The hero

Two details worth knowing before you touch it:

- **The wash is a decorative layer, not a wrapper.** `page.tsx` paints
  `hero-wash` as an absolutely-positioned div behind the nav and hero. Wrapping
  them instead would need `overflow-hidden` to clip the cutout, and a clipping
  ancestor traps `position: sticky` — the nav would stop following the page once
  the hero scrolled away. The wash ends on pure white, so its height can
  overshoot harmlessly; the clipping lives on the hero's right column only.
- **The subject is a transparent cutout**, not a framed photo. It is anchored to
  the section floor and cropped by it. A JPEG here will paint an opaque box over
  the gradient — keep the alpha channel.

The hero conversation (`components/chat/HeroThread.tsx`) plays once on entry.
Its approve/decline row is built from real `<button>` elements: a mock-up of a
money control should still be keyboard-reachable and announced properly, even
though nothing submits. The decline is given the same visual weight as the
approve — that is the product's whole promise, so the landing page should not
quietly de-emphasise it.

## Alignment

`src/lib/layout.ts` exports one `gutter` + `shell` pair, used by the nav and
every section. That is why the wordmark, the hero headline and every card below
share a left rule. Change the gutter there and the whole page moves together.

The gutter is a percentage on the *outer* element and the width cap sits on the
*inner* one. Putting both on one element (`max-w-… px-[5%]`) drifts out of
alignment as the viewport grows, because percentage padding resolves against the
parent's width rather than the capped element's.

## Structure

```
src/
  app/
    globals.css        the @theme token block + base + keyframes
    layout.tsx         self-hosted DM Sans, metadata, skip link
    page.tsx           section order, nothing else
    fonts/             DM Sans variable woff2 (vendored, see below)
    icon.svg           favicon
  lib/
    tokens.ts          motion + status tokens for JS
    content.ts         every string on the page
    clsx.ts
  components/
    motion/            Reveal / RevealGroup / RevealItem / Drift / useInViewOnce
    ui/                Button, Chip, Wordmark
    chat/              ChatBubble, ChatThread, TypingDots, PinPad
    sections/          Nav, Hero, Problem, Memory, HowItWorks,
                       Features, BackToLife, Faq, FinalCta, Footer
```

**All copy lives in `src/lib/content.ts`.** Marketing can rewrite the page
without opening a component. Alt text lives there too.

---

## Motion

Everything is subtle and purposeful — the design brief calls for trust reading
as *calm, not flashy*, so nothing bounces, overshoots or parallaxes.

| Where                  | What                                                                      |
| ---------------------- | ------------------------------------------------------------------------- |
| Hero                   | headline lines rise in sequence; subject and glass transcript follow        |
| Hero transcript        | voice note → thinking dots → confirmation + actions → the Yes              |
| Every section          | `Reveal` — fade + ~22px travel, once, on entry                             |
| Card groups            | `RevealGroup` / `RevealItem` — 80ms stagger                                |
| Chat threads           | play themselves when scrolled to; `motion.thinking` dots before each reply |
| PIN pad                | digits fill, then an **icon + label** confirmation                         |
| Feature / photo cards  | `Drift` — 6–8px ambient float, ~10s                                        |
| Buttons                | 1px lift on hover, settle on press, arrow nudge                            |
| Nav                    | shadow and a 1.5% scale as you leave the top                               |
| Waitlist arc           | the curve draws itself, avatars pop in along it                            |

### Reduced motion

`prefers-reduced-motion: reduce` is honoured everywhere, and honoured *properly*
— components render their **final state**, they don't just skip the transition.
Chat threads print the whole transcript immediately, the PIN pad shows filled and
approved, drift stops, reveals start visible. No information is ever gated behind
an animation. There is also a global CSS backstop in `globals.css`.

Check it with `npm run shots` (see below) or DevTools → Rendering → Emulate
`prefers-reduced-motion`.

---

## Accessibility

- Skip link, one `<h1>`, sections labelled, semantic `figure`/`figcaption`.
- Touch targets ≥44px on every control (`min-h-11` on buttons, the FAQ list, the
  nav toggle).
- **Money state never travels as colour alone** — every status carries an icon
  and a text label, per §1 of the token spec.
- Focus rings are gold at 2px with a 3px offset, visible on both grounds.
- Chat threads are `aria-live="polite"`; the thinking dots announce as
  "didii is thinking".
- The three waitlist avatars are decorative and carry empty `alt` deliberately.

Still to do: run the whole palette through the contrast bar in
`02-accessibility.md`. The mid-ramp greens on white are the ones to watch.

---

## Images

`public/images/` currently holds **generated placeholders** — warm gradient
washes, so the layout renders before the real photography lands. Replace them
in place, same filenames, no code change. Shot list and ratios are in
[`public/images/IMAGES.md`](public/images/IMAGES.md).

`npm run placeholders` regenerates them (needs Python + Pillow).

## Fonts

DM Sans is **self-hosted** from `src/app/fonts/` rather than fetched from Google
Fonts: one less third-party request on the critical path and no user data leaving
the origin. The variable `wght` cut covers 400→800 in ~37KB. The files came from
`@fontsource-variable/dm-sans` (OFL); update them from that package.

## Visual checks

```bash
npm run build && npm run start &
npm run shots -- http://localhost:3000 ./shots
```

Captures full-page desktop, wide, mobile and reduced-motion screenshots, and
reports any console errors. Set `CHROMIUM_PATH` if Playwright's bundled browser
does not match your machine's.

---

## Before launch

- [ ] Replace every image in `public/images/`
- [ ] Point `#waitlist` at a real form (all CTAs share `finalCta.cta.href`)
- [ ] Confirm the green/neutral/status ramps against the brand PDF and promote
      the remaining `text-[#…]` arbitrary values to tokens
- [ ] Add an OG image (`opengraph-image.tsx` in `src/app/`)
- [ ] Set the real domain in `metadata.metadataBase`
- [ ] Fill in the `#privacy`, `#terms`, `#contact` and `#about` destinations
- [ ] Run the palette against the contrast bar in `02-accessibility.md`
