/**
 * didii — landing page copy.
 *
 * All wording lives here so marketing can edit without touching layout.
 * Copy transcribed from the Figma frame `DiidiAi · V1` (node 1222-3877).
 */

export const nav = {
  links: [
    { label: "How it works", href: "#how-it-works" },
    { label: "What didii remembers", href: "#memory" },
    { label: "Safety", href: "#safety" },
    { label: "About", href: "#about" },
  ],
  cta: { label: "Join the waitlist", href: "#waitlist" },
};

export const hero = {
  eyebrow: "Pre-launch in Nigeria",
  title: ["Banking that", "gets to know you."],
  body: "Send money. Pay bills. Buy airtime and data. Cash out supported crypto. Tell didii what you need; it handles the steps and waits for your approval. The more you use it, the less you have to explain again.",
  cta: { label: "Join the waitlist", href: "#waitlist" },
  assurance: "Money never moves without your Yes.",
  photo: {
    src: "/images/hero-cutout.png",
    alt: "A didii customer sending money by voice note from his phone",
  },
  /** The hero conversation, played in order. A voice note, not typing. */
  voice: { duration: "0:08", label: "Voice message", transcript: "Send 5k to mama" },
  confirmation: {
    lead: "Send",
    amount: "₦5,000",
    recipient: "to mama",
    rows: ["GTBank 1245382783", "Fee: ₦0", "Balance after: ₦12,000"] as const,
    question: "Does that look right?",
    decline: "Cancel",
    approve: "Yes send it",
  },
  reply: "Send it",
};

export const problem = {
  chip: "The problem",
  lead: "Banking got faster.",
  turn: "But making payments still feels repetitive",
  /** Each inner array is one visual line — the first two chores share a line. */
  steps: [
    [
      { text: "You remember the bill", icon: "receipt" },
      { text: "Find the recipient", icon: "user" },
    ],
    [{ text: "Enter the same details you've entered before", icon: "list" }],
    [{ text: "Double-check it went through", icon: "check" }],
  ] as const,
  closing: ["Then the next time, you do it all over again.", "Payments should be simple.", "So we built didii"],
};

export const memory = {
  chip: "With didii",
  headline: {
    before: "didii remembers the",
    highlights: ["People,", "Bill details"],
    join: "and",
    lastHighlight: "Preferences",
    after: "you choose,",
    tail: "so the same money life takes less explaining.",
  },
  cards: [
    {
      title: "First electricity payment",
      body: null,
      tone: "pale" as const,
      thread: [
        { from: "user", text: "Pay ₦8,500 for my electricity" },
        { from: "didii", text: "I don't have your meter number saved yet.  What is it? I'll remember it" },
        { from: "user", text: "it's 1234567890." },
        { from: "didii", text: "EKEDC · ₦8,500 Meter ••••7890\nPay it?" },
      ] as const,
    },
    {
      title: "The next month",
      body: "The setup does not repeat. The decision still does.",
      tone: "dark" as const,
      thread: [
        { from: "user", text: "Pay ₦8,500 for my electricity" },
        { from: "didii", text: "EKEDC · ₦8,500 Meter ••••7890\nPay it?" },
        { from: "user", text: "Yes Pay" },
      ] as const,
    },
  ],
};

export interface HowItWorksStep {
  title: string;
  body: string;
  thread?: readonly { readonly from: "user" | "didii"; readonly text: string }[];
  receipt?: {
    intro: string;
    rows: readonly (readonly [string, string])[];
    outro: string;
    confirm: string;
  };
  pin?: { label: string; length: number };
}

export const howItWorks: {
  chip: string;
  title: string;
  steps: readonly [HowItWorksStep, HowItWorksStep, HowItWorksStep];
} = {
  chip: "How it works",
  title: "Tell didii. Check the details. Give the Yes.",
  steps: [
    {
      title: "Tell didii what you need",
      body: "Type naturally in English or Pidgin. No special command to learn.",
      thread: [
        { from: "user", text: "45213908807 I need to buy light EKEDC" },
        {
          from: "didii",
          text: "EKEDC says that meter is registered to **TOLU ADENIYI** — Lekki Phase 1, Band A. Is that you?",
        },
        { from: "user", text: "yes that's me" },
        { from: "didii", text: "How much do you want to load?" },
        { from: "user", text: "12k" },
      ] as const,
    },
    {
      title: "Review what is ready",
      body: "See the person or biller, amount, destination, and any fee before outbound money moves.",
      receipt: {
        intro: "Please review your electricity purchase before I proceed:",
        rows: [
          ["Biller", "EKEDC"],
          ["Meter", "45213908807"],
          ["Name", "TOLU ADENIYI"],
          ["Location", "Lekki Phase 1 · Band A"],
          ["Amount", "₦12,000"],
          ["Fee", "₦0"],
          ["Total", "₦12,000"],
        ] as const,
        outro: "Everything looks correct?",
        confirm: "Confirm ₦12,000",
      },
    },
    {
      title: "Approve securely",
      body: "Your Yes and four-digit transaction PIN authorise the action. Without both, it does not happen.",
      pin: { label: "Enter 4-digit PIN", length: 4 },
    },
  ],
};

export const features = {
  chip: "For everyday use",
  title: ["The money jobs that", "keep coming back."],
  items: [
    {
      title: "Send money",
      body: "Send to Nigerian bank accounts, check what is left, and find the receipt in the same conversation",
      icon: "send",
    },
    {
      title: "Pay bills",
      body: "Pay supported electricity and television bills without setting up the same details again.",
      icon: "receipt",
    },
    {
      title: "Cash out supported crypto",
      body: "Send supported crypto to your deposit address and receive naira.",
      icon: "coins",
    },
    {
      title: "Buy airtime and data",
      body: "Top up for yourself or a saved person without searching through bundle menus",
      icon: "wifi",
    },
    {
      title: "Check your wallet",
      body: "Ask for your balance, recent activity, or what you spent on bills",
      icon: "wallet",
    },
  ] as const,
};

export const backToLife = {
  title: ["The best banking leaves you with", "less banking to do."],
  body: "The transfer gets handled. The bill details stop living in your head. You close the app and get back to why the money needed moving in the first place",
  footnote: "The point is not more time with didii. It is more life on the other side.",
  photos: [
    { label: "Back to dinner.", src: "/images/back-to-dinner.jpg", alt: "A woman at her dining table, phone face-down beside her plate" },
    { label: "Back to work.", src: "/images/back-to-work.jpg", alt: "A man working at his laptop in a home office" },
    { label: "Back to life.", src: "/images/back-to-life.jpg", alt: "Friends laughing together at an outdoor table" },
    { label: "Back to People.", src: "/images/back-to-people.jpg", alt: "A shop owner serving a customer at her counter" },
  ] as const,
};

export const faq = {
  title: "Frequently asked questions",
  items: [
    {
      q: "What is didii?",
      a: "didii is banking that gets to know you. You tell it what you need, it handles supported everyday money actions, and it remembers verified context so you do not keep starting over.",
    },
    {
      q: "Is didii a licensed bank?",
      a: "No. didii is a conversational financial platform, not a bank. Banking and payment services are provided through our financial partners.",
    },
    {
      q: "Does didii connect all my banking apps?",
      a: "No. didii does not need access to your existing banking apps. You use didii's wallet and supported financial services directly within the app.",
    },
    {
      q: "Can didii move money without asking me?",
      a: "No. didii will never move money without your confirmation. Before any money-moving action, didii shows you exactly what is about to happen. You confirm it and authorise the transaction with your Transaction PIN.",
    },
    {
      q: "What does didii remember?",
      a: "didii remembers relevant information and conversation context that helps make your experience more personalised and means you don’t have to repeat yourself unnecessarily.",
    },
    {
      q: "Is didii live?",
      a: "didii is currently being built and is not yet generally available to the public. We’re working towards launch.",
    },
  ] as const,
};

export const finalCta = {
  title: "Just tell didii",
  /** Body is split so the count can be swapped for the live figure from
   * `/api/count` without touching the surrounding copy. `bodyFallback` is
   * what renders before that fetch resolves (and if it fails). */
  bodyPrefix: "Join more than ",
  bodyFallback: 2900,
  bodySuffix: " people registered before launch and be among the first to experience banking that gets to know you",
  cta: { label: "Join the waitlist", href: "#waitlist" },
  note: "Pre-launch in Nigeria. We'll let you know when early access opens",
  avatars: [
    { src: "/images/avatar-1.png", alt: "" },
    { src: "/images/avatar-2.png", alt: "" },
    { src: "/images/avatar-3.png", alt: "" },
  ] as const,
};

export const footer = {
  tagline: "Banking that gets to know you.",
  columns: [
    {
      heading: "Company",
      links: [
        { label: "About", href: "#about" },
        { label: "Privacy", href: "#privacy" },
        { label: "Terms", href: "#terms" },
      ],
    },
    {
      heading: "What we do",
      links: [
        { label: "Features", href: "#features" },
        { label: "How it works", href: "#how-it-works" },
        { label: "FAQ", href: "#faq" },
      ],
    },
    {
      heading: "Need help?",
      links: [{ label: "Contact us", href: "#contact" }],
    },
  ],
  legal: "© 2026 DIDII AI TECHNOLOGY LIMITED. Pre-launch.",
};
