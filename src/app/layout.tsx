import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import "./globals.css";

/**
 * type.* — DM Sans ✅, self-hosted.
 *
 * The variable `wght` cut covers the whole scale the tokens ask for (400 body,
 * 600 emphasis, 700 titles, 800 wordmark) in one ~37KB file. Self-hosted rather
 * than pulled from Google Fonts: one less third-party request on the critical
 * path, no cross-origin lookup, and no user data leaving the origin.
 */
const dmSans = localFont({
  src: [
    { path: "./fonts/dm-sans-latin-wght-normal.woff2", weight: "100 1000", style: "normal" },
    { path: "./fonts/dm-sans-latin-ext-wght-normal.woff2", weight: "100 1000", style: "normal" },
  ],
  variable: "--font-dm-sans",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://didiiai.com"),
  title: {
    default: "didii — Banking that gets to know you",
    template: "%s · didii",
  },
  description:
    "Send money, pay bills, buy airtime and data, and cash out supported crypto by telling didii what you need. Money never moves without your Yes. Pre-launch in Nigeria.",
  keywords: ["didii", "AI banking", "Nigeria fintech", "pay bills Nigeria", "send money", "AI money agent"],
  openGraph: {
    type: "website",
    siteName: "didii",
    title: "didii — Banking that gets to know you",
    description:
      "Tell didii what you need; it handles the steps and waits for your approval. Pre-launch in Nigeria.",
  },
  twitter: {
    card: "summary_large_image",
    title: "didii — Banking that gets to know you",
    description: "Tell didii what you need; it handles the steps and waits for your approval.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0C2B1A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-button focus:bg-brand-green focus:px-4 focus:py-2 focus:text-green-100"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
