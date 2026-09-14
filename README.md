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

## The product

**didii is conversational banking for Nigeria** — you tell it what you need in
plain English or Pidgin, it fills in the details from what it already knows
about you, and it waits for an explicit **Yes** (plus a 4-digit transaction
PIN) before any money moves. It is pre-launch; this repo is the waitlist
landing page, not the app itself.

didii is not a licensed bank — it is a conversational layer over banking and
payment services provided through financial partners, and it does not connect
to or read your existing banking apps (see the FAQ answers in
`src/lib/content.ts`).

Supported money jobs, all inside one chat (`content.ts` → `features`):

- **Send money** to Nigerian bank accounts
- **Pay bills** — electricity and TV, currently
- **Cash out supported crypto** to naira
- **Buy airtime and data** for yourself or a saved contact
- **Check your wallet** — balance, recent activity, bill spend

The product's whole pitch is memory with consent: the first time you pay a
biller, didii asks for the meter number and remembers it; every time after
that it skips straight to "here's what I'm about to do — confirm?". The
decline button is never visually demoted below approve — see [The
hero](#the-hero) for why that matters enough to be load-bearing UI, not just
copy.

## User journey

The page is one long argument, told in the same order `page.tsx` renders the
sections, and every section's copy lives in `src/lib/content.ts`:

1. **Hero** — the pitch and a live demo. A voice note ("Send 5k to mama")
   plays into a confirmation card with an approve/decline row, unprompted, so
   the core loop is understood before any copy is read.
2. **Problem** (`problem`) — names the actual pain: not that banking is slow,
   but that it's *repetitive* — the same recipient, the same bill, re-entered
   every time.
3. **Memory** (`memory`) — the answer to the problem, shown as two chat
   threads: "first electricity payment" (didii asks for the meter number) vs.
   "the next month" (it doesn't ask again). Setup happens once; the approval
   decision still happens every time.
4. **How it works** (`howItWorks`) — the three-step mental model, generalised
   from the hero demo: **tell didii → review what's ready → approve with Yes
   + PIN**. Each step renders a different real UI (chat thread, itemised
   receipt, PIN pad).
5. **Features** (`features`) — the money jobs above, once the reader already
   trusts the confirm-before-send pattern.
6. **Back to life** (`backToLife`) — the emotional payoff: the point of the
   product isn't more time spent in didii, it's less banking admin bleeding
   into the rest of your day.
7. **FAQ** (`faq`) — objection handling: is this a bank, does it read my
   other apps, can it move money without me, is it live yet.
8. **Final CTA** (`finalCta`) — the ask, with live-feeling social proof (a
   waitlist count).
9. **Footer** — sitemap plus the tagline as a closing line.

Every CTA on the page — nav, hero, final CTA — dispatches the same
`didii:open-waitlist` window event (`Button.tsx`) rather than linking out, so
they all land the visitor in one place:

**The waitlist flow** (`components/waitlist/WaitlistOnboarding.tsx`), a
4-step modal:

1. Persona — personal or business use
2. Contact — name, phone, email
3. Use cases — which of the six chips (bills, transfers, crypto cash-out,
   data & airtime, photo input, voice input) apply
4. Confirmation — a queue position and a copy-to-share link

Submissions are rate-limited per IP via Upstash (no bot check). A completed entry is cached in
`localStorage` (`didii:waitlist:v2`) so a returning visitor who reopens the modal
lands straight on step 4 instead of re-submitting. The server enforces one
signup per email (checked against the Brevo list) and returns the queue
position: 800 + Brevo subscribers, the same figure `/api/count` shows.

## File structure

One file per concern: page order lives in `page.tsx`, section order mirrors
the [user journey](#user-journey) above, and every section is one component
in `components/sections/` reading its copy from `content.ts`.

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
