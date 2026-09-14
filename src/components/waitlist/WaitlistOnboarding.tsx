"use client";

import { AnimatePresence, motion as fm, useReducedMotion } from "framer-motion";
import { ArrowLeft, BriefcaseBusiness, Copy, User } from "lucide-react";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";

import { Wordmark } from "@/components/ui/Wordmark";
import { clsx } from "@/lib/clsx";
import { motion } from "@/lib/tokens";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

type Persona = "personal" | "business";

type StoredWaitlistEntry = { name: string; queuePosition: number };

const WAITLIST_STORAGE_KEY = "didii:waitlist";

function readStoredWaitlist(): StoredWaitlistEntry | null {
  try {
    const raw = window.localStorage.getItem(WAITLIST_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.name === "string" && typeof parsed?.queuePosition === "number") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

const useCaseOptions = [
  "Bills",
  "Transfers",
  "Crypto cash-out",
  "Data & Airtime",
  "Photo input",
  "Voice input",
];

const emailLooksValid = (value: string) => {
  const input = value.trim();
  const at = input.indexOf("@");
  const dot = input.lastIndexOf(".");
  return at > 0 && dot > at + 1 && dot < input.length - 1;
};
const phoneLooksValid = (value: string) =>
  value.replace(/\D/g, "").length >= 10;

const secureQueuePosition = () => {
  const randomValue = crypto.getRandomValues(new Uint32Array(1))[0] % 500;
  return 2700 + randomValue;
};

const dotMap = {
  2: ["active", "muted", "muted"],
  3: ["done", "active", "muted"],
} as const;

export function WaitlistOnboarding() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [useCases, setUseCases] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [queuePosition, setQueuePosition] = useState(secureQueuePosition());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReady, setTurnstileReady] = useState(false);
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);

  useEffect(() => {
    const openFlow = () => {
      const stored = readStoredWaitlist();

      setOpen(true);
      setPersona(null);
      setPhone("");
      setEmail("");
      setUseCases([]);
      setCopied(false);
      setSubmitting(false);
      setSubmitError(null);
      setTurnstileToken(null);

      if (stored) {
        setAlreadyJoined(true);
        setName(stored.name);
        setQueuePosition(stored.queuePosition);
        setStep(4);
      } else {
        setAlreadyJoined(false);
        setName("");
        setQueuePosition(secureQueuePosition());
        setStep(1);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("didii:open-waitlist", openFlow as EventListener);
    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener(
        "didii:open-waitlist",
        openFlow as EventListener,
      );
      window.removeEventListener("keydown", onEscape);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    /* `open` is a dep so closing the modal on step 3 tears the widget down —
       otherwise its iframe is ripped out of the DOM mid-challenge. */
    if (!open || step !== 3) return;
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) {
      console.error("turnstile: NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set (restart `next dev` after editing .env)");
      return;
    }
    if (!turnstileReady || !window.turnstile || !turnstileContainerRef.current) return;

    setTurnstileError(null);
    const widgetId = window.turnstile.render(turnstileContainerRef.current, {
      sitekey: siteKey,
      action: "waitlist",
      theme: "light",
      callback: (token: string) => {
        setTurnstileToken(token);
        setTurnstileError(null);
      },
      "expired-callback": () => setTurnstileToken(null),
      "error-callback": (code: string) => {
        /* 1102xx = hostname not in the widget's allowed domains,
           4000x0 = invalid/disabled sitekey. See Cloudflare's error-code docs. */
        console.warn("turnstile: error-callback", code);
        setTurnstileToken(null);
        setTurnstileError(code);
      },
    });
    turnstileWidgetId.current = widgetId;

    return () => {
      if (turnstileWidgetId.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetId.current);
        turnstileWidgetId.current = null;
      }
    };
  }, [open, step, turnstileReady]);

  const dots = step === 2 || step === 3 ? dotMap[step] : null;

  const canContinueStep2 = name.trim().length > 1;
  const canContinueStep3 = phoneLooksValid(phone) && emailLooksValid(email) && Boolean(turnstileToken);

  const whatsappHref = useMemo(() => {
    const message = encodeURIComponent(
      "Just joined the didii waitlist — Nigeria's first AI money assistant. Transfers, bills, data, crypto cash-out. All by voice or text. Join me: https://didiiai.com",
    );
    return `https://wa.me/?text=${message}`;
  }, []);

  const submitWaitlist = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: `+234${phone.replace(/\D/g, "")}`,
          email,
          turnstileToken,
        }),
      });
      if (!response.ok) throw new Error("Request failed");

      try {
        const entry: StoredWaitlistEntry = { name, queuePosition };
        window.localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(entry));
      } catch {
        // localStorage unavailable (private mode, etc.) — not fatal, just
        // means "already on the waitlist" won't be detected next visit.
      }

      setAlreadyJoined(false);
      setStep(4);
    } catch {
      setSubmitError("Couldn't join the waitlist. Please try again.");
      /* Tokens are single-use — the server's siteverify call already spent
         this one, so a retry with it would fail with timeout-or-duplicate. */
      setTurnstileToken(null);
      if (turnstileWidgetId.current && window.turnstile) {
        window.turnstile.reset(turnstileWidgetId.current);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUseCase = (value: string) => {
    setUseCases((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText("https://didiiai.com");
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const transition = {
    initial: reduced ? false : { opacity: 0, y: 14, scale: 0.985 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: reduced ? undefined : { opacity: 0, y: -10, scale: 0.985 },
    transition: { duration: motion.duration.base, ease: motion.ease },
  };

  return (
    <>
      {open ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="lazyOnload"
          onLoad={() => setTurnstileReady(true)}
        />
      ) : null}

      <AnimatePresence>
        {open ? (
          <fm.section
          aria-label="didii waitlist onboarding"
          className="fixed inset-0 z-[100] overflow-hidden"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          transition={{ duration: motion.duration.fast * 2, ease: motion.ease }}
        >
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(100% 120% at 15% 10%, rgba(33,91,58,0.34) 0%, rgba(12,43,26,0) 55%), radial-gradient(95% 80% at 85% 0%, rgba(67,114,83,0.38) 0%, rgba(12,43,26,0) 68%), linear-gradient(180deg, #123b25 0%, #0c2b1a 65%, #0b2618 100%)",
            }}
          />

          <div className="relative mx-auto flex h-[100dvh] w-full max-w-[1520px] flex-col px-4 pb-3 pt-3 sm:px-8 sm:pb-8 sm:pt-6">
            <header className="flex items-center justify-between text-green-100/75">
              <span aria-label="didii" className="text-surface">
                <Wordmark className="text-[34px] leading-none sm:text-[56px]" />
              </span>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-10 items-center gap-2 rounded-chip px-2 py-1.5 text-xs font-medium text-green-100/70 transition-colors hover:text-green-100 sm:min-h-11 sm:px-2.5 sm:py-2 sm:text-sm"
              >
                <ArrowLeft aria-hidden className="size-4" />
                Back to didii
              </button>
            </header>

            <main className="flex min-h-0 flex-1 flex-col items-center justify-center py-3 sm:py-10">
              {step === 1 ? (
                <fm.div
                  key="step-1"
                  {...transition}
                  className="w-full max-w-3xl text-center"
                >
                  <h2 className="text-3xl font-extrabold tracking-[-0.03em] text-surface sm:text-6xl">
                    Just tell didii.
                  </h2>
                  <p className="mt-2 text-sm text-green-100/65 sm:mt-4 sm:text-2xl">
                    Who are we setting up a wallet for?
                  </p>

                  <div className="mt-6 grid gap-3 sm:mt-12 sm:gap-4 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPersona("personal");
                        setStep(2);
                      }}
                      className="rounded-panel border border-white/20 bg-white/7 p-4 text-left backdrop-blur-sm transition-colors hover:bg-white/12 sm:p-8"
                    >
                      <span className="inline-grid size-12 place-items-center rounded-input bg-[#2a6d48] text-[#5fdfa2] sm:size-16">
                        <User aria-hidden className="size-5 sm:size-6" />
                      </span>
                      <p className="mt-3 text-xl font-semibold text-surface sm:mt-4 sm:text-2xl">
                        For me
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-green-100/60 sm:mt-2 sm:text-sm">
                        Personal transfers, bills, data, crypto cash-out
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPersona("business");
                        setStep(2);
                      }}
                      className="rounded-panel border border-gold-500/40 bg-[#f4be5d1a] p-4 text-left backdrop-blur-sm transition-colors hover:bg-[#f4be5d24] sm:p-8"
                    >
                      <span className="inline-grid size-12 place-items-center rounded-input bg-[#9b7730] text-gold-200 sm:size-16">
                        <BriefcaseBusiness
                          aria-hidden
                          className="size-5 sm:size-6"
                        />
                      </span>
                      <p className="mt-3 text-xl font-semibold text-surface sm:mt-4 sm:text-2xl">
                        For my business
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-green-100/60 sm:mt-2 sm:text-sm">
                        Vendor payments, payroll, expenses
                      </p>
                    </button>
                  </div>
                </fm.div>
              ) : null}

              {step === 2 ? (
                <fm.div
                  key="step-2"
                  {...transition}
                  className="w-full max-w-[640px]"
                >
                  {dots ? (
                    <div className="mb-5 flex justify-center gap-2">
                      {dots.map((state, i) => (
                        <span
                          key={`${state}-${i}`}
                          className={clsx(
                            "size-2.5 rounded-full",
                            state === "active" && "bg-brand-gold",
                            state === "done" && "bg-[#55d4a0]",
                            state === "muted" && "bg-white/30",
                          )}
                        />
                      ))}
                    </div>
                  ) : null}

                  <div className="rounded-[24px] border border-white/65 bg-surface px-4 py-4 shadow-sheet sm:px-8 sm:py-6">
                    <div className="flex gap-3 sm:gap-4">
                      <span className="inline-grid size-10 shrink-0 place-items-center rounded-input bg-brand-green text-xl font-bold text-surface sm:size-12 sm:text-2xl">
                        d
                      </span>
                      <div>
                        {persona === "personal" ? (
                          <p className="text-base leading-relaxed text-ink/85 sm:text-xl">
                            Hey. I&apos;m didii - I handle your transfers,
                            bills, data, crypto cash-out.
                          </p>
                        ) : (
                          <p className="text-base leading-relaxed text-ink/85 sm:text-xl">
                            Hey. Let&apos;s get your business wallet set up.
                          </p>
                        )}
                        <p className="mt-1 text-xl font-medium text-ink sm:mt-2 sm:text-2xl">
                          What&apos;s your name?
                        </p>
                      </div>
                    </div>

                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder={
                        persona === "business" ? "Business name" : "Your name"
                      }
                      className="mt-4 min-h-11 w-full rounded-input border-2 border-[#7fddb8] px-4 py-2.5 text-lg text-ink outline-none transition-colors placeholder:text-ink/45 focus:border-[#31b37a] sm:mt-7 sm:min-h-12 sm:py-3 sm:text-xl"
                    />

                    <button
                      type="button"
                      disabled={!canContinueStep2}
                      onClick={() => setStep(3)}
                      className="mt-3 min-h-11 w-full rounded-chip bg-brand-green px-5 py-2.5 text-lg font-semibold text-green-100 transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-900/65 sm:mt-4 sm:min-h-12 sm:py-3 sm:text-xl"
                    >
                      Continue
                    </button>
                  </div>
                </fm.div>
              ) : null}

              {step === 3 ? (
                <fm.div
                  key="step-3"
                  {...transition}
                  className="w-full max-w-[640px]"
                >
                  {dots ? (
                    <div className="mb-5 flex justify-center gap-2">
                      {dots.map((state, i) => (
                        <span
                          key={`${state}-${i}`}
                          className={clsx(
                            "size-2.5 rounded-full",
                            state === "active" && "bg-brand-gold",
                            state === "done" && "bg-[#55d4a0]",
                            state === "muted" && "bg-white/30",
                          )}
                        />
                      ))}
                    </div>
                  ) : null}

                  <div className="rounded-[24px] border border-white/65 bg-surface px-4 py-4 shadow-sheet sm:px-8 sm:py-6">
                    <div className="flex gap-3 sm:gap-4">
                      <span className="inline-grid size-10 shrink-0 place-items-center rounded-input bg-brand-green text-xl font-bold text-surface sm:size-12 sm:text-2xl">
                        d
                      </span>
                      <div>
                        <p className="text-base leading-relaxed text-ink/85 sm:text-xl">
                          Good to meet you, {name || "friend"}. Almost there.
                        </p>
                        <p className="mt-1 text-xl font-medium text-ink sm:mt-2 sm:text-2xl">
                          What&apos;s your phone number and email?
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2.5 sm:mt-5 sm:gap-3">
                      <div className="grid grid-cols-[auto_1fr] overflow-hidden rounded-input border border-border bg-subtle">
                        <span className="grid min-h-11 place-items-center border-r border-border px-3 text-base font-semibold text-ink/75 sm:min-h-12 sm:text-lg">
                          +234
                        </span>
                        <input
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          inputMode="numeric"
                          placeholder="8061234567"
                          className="min-h-11 w-full bg-transparent px-4 text-base text-ink outline-none placeholder:text-ink/45 sm:min-h-12 sm:text-lg"
                        />
                      </div>

                      <input
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        type="email"
                        placeholder="you@email.com"
                        className="min-h-11 w-full rounded-input border-2 border-[#7fddb8] px-4 py-2.5 text-base text-ink outline-none transition-colors placeholder:text-ink/45 focus:border-[#31b37a] sm:min-h-12 sm:py-3 sm:text-lg"
                      />
                    </div>

                    <p className="mt-3 text-xs text-ink/60 sm:mt-5 sm:text-sm">
                      What will you use didii for? (optional)
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 sm:mt-3 sm:gap-2.5">
                      {useCaseOptions.map((item) => {
                        const active = useCases.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleUseCase(item)}
                            className={clsx(
                              "rounded-chip border px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 sm:py-2 sm:text-base",
                              active
                                ? "border-brand-green bg-green-100 text-brand-green"
                                : "border-border bg-subtle text-ink/80 hover:bg-green-50",
                            )}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>

                    <div ref={turnstileContainerRef} className="mt-4 flex justify-center sm:mt-5" />

                    {turnstileError ? (
                      <p className="mt-2 text-center text-sm text-red-600">
                        Verification couldn&apos;t load (error {turnstileError}). Refresh and try again.
                      </p>
                    ) : null}

                    {submitError ? (
                      <p className="mt-3 text-sm text-red-600">{submitError}</p>
                    ) : null}

                    <button
                      type="button"
                      disabled={!canContinueStep3 || submitting}
                      onClick={submitWaitlist}
                      className="mt-4 min-h-11 w-full rounded-chip bg-brand-green px-5 py-2.5 text-lg font-semibold text-green-100 transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-900/65 sm:mt-5 sm:min-h-12 sm:py-3 sm:text-xl"
                    >
                      {submitting ? "Joining..." : "Almost done"}
                    </button>
                  </div>
                </fm.div>
              ) : null}

              {step === 4 ? (
                <fm.div
                  key="step-4"
                  {...transition}
                  className="w-full max-w-[760px]"
                >
                  <div className="rounded-[30px] border border-white/20 bg-white/8 p-4 text-green-100 shadow-sheet backdrop-blur-md sm:p-8">
                    <div className="mx-auto inline-grid size-12 place-items-center rounded-input bg-brand-green text-3xl font-bold text-surface sm:size-16 sm:text-4xl">
                      d
                    </div>

                    <h2 className="mt-3 text-center text-[clamp(1.65rem,7vw,3.2rem)] font-extrabold tracking-[-0.03em] text-surface sm:mt-5">
                      You&apos;re{" "}
                      <span className="text-brand-gold">
                        #{queuePosition.toLocaleString()}
                      </span>{" "}
                      on the list
                    </h2>
                    <p className="mx-auto mt-2 max-w-[46ch] text-center text-sm text-green-100/70 sm:mt-3 sm:text-lg">
                      {alreadyJoined ? (
                        <>
                          Welcome back{name ? `, ${name}` : ""}. You&apos;re already on the
                          list — we&apos;ll reach out when didii launches.
                        </>
                      ) : (
                        <>
                          {name || "You"}, you&apos;re in. We&apos;ll reach out when
                          didii launches - you&apos;ll be one of the first.
                        </>
                      )}
                    </p>

                    <div className="mt-4 rounded-sheet border border-white/20 bg-white/7 p-3 sm:mt-7 sm:p-5">
                      <p className="text-center text-[11px] font-semibold tracking-[0.06em] text-green-100/55 uppercase sm:text-sm">
                        Move up the list - share with friends
                      </p>
                      <div className="mt-2 grid gap-2 sm:mt-3 sm:gap-2.5 sm:grid-cols-2">
                        <a
                          href={whatsappHref}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-10 items-center justify-center rounded-chip bg-gold-600 px-4 py-2.5 text-base font-semibold text-brand-green transition-colors hover:bg-gold-500 sm:min-h-12 sm:py-3 sm:text-lg"
                        >
                          Share on WhatsApp
                        </a>
                        <button
                          type="button"
                          onClick={copyLink}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-chip border border-white/30 bg-white/10 px-4 py-2.5 text-base font-medium text-green-100 transition-colors hover:bg-white/18 sm:min-h-12 sm:py-3 sm:text-lg"
                        >
                          <Copy aria-hidden className="size-4" />
                          {copied ? "Copied" : "Copy link"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-7">
                      <p className="text-[11px] font-semibold tracking-[0.08em] text-green-100/55 uppercase sm:text-sm">
                        What happens next
                      </p>
                      <ol className="mt-2 space-y-2 text-sm text-green-100/75 sm:mt-4 sm:space-y-3 sm:text-lg">
                        {(alreadyJoined
                          ? [
                              "We'll notify you the moment didii launches",
                              "Download the app, complete BVN verification, and you're live",
                            ]
                          : [
                              "You'll get an email confirmation shortly",
                              "We'll notify you the moment didii launches",
                              "Download the app, complete BVN verification, and you're live",
                            ]
                        ).map((text, i) => (
                          <li key={text} className="flex items-start gap-3">
                            <span className="mt-0.5 inline-grid size-5 shrink-0 place-items-center rounded-full bg-white/12 text-[11px] font-semibold sm:size-6 sm:text-sm">
                              {i + 1}
                            </span>
                            <span>{text}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </fm.div>
              ) : null}
            </main>

            <footer className="hidden text-center text-sm text-green-100/35 sm:block">
              Anchor partner bank · CBN-regulated · NDIC-insured deposits
            </footer>
          </div>
        </fm.section>
        ) : null}
      </AnimatePresence>
    </>
  );
}
