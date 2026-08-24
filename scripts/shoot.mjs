/**
 * Visual check harness. Loads the running site, waits out the entry animations
 * and the self-playing chat threads, then captures full-page desktop + mobile
 * shots and a reduced-motion desktop shot.
 *
 *   node scripts/shoot.mjs [baseUrl] [outDir]
 */
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3111";
const out = process.argv[3] ?? "/tmp/shots";

await mkdir(out, { recursive: true });

// Allow pinning a system Chromium (CI images often ship one that does not match
// the Playwright build this package expects).
const executablePath = process.env.CHROMIUM_PATH || undefined;
const browser = await chromium.launch({ executablePath });

async function shoot(name, { width, height, reducedMotion = "no-preference", settle = 9000 }) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    reducedMotion,
  });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: "networkidle" });

  // walk the page so every scroll-reveal and in-view chat thread fires
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const full = () => Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    const step = window.innerHeight * 0.6;
    for (let y = 0; y <= full(); y += step) {
      window.scrollTo(0, y);
      await sleep(280);
    }
    // land squarely on the true bottom so page-end reveals fire
    window.scrollTo(0, full());
    await sleep(900);
    window.scrollTo(0, 0);
  });

  await page.waitForTimeout(settle);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });

  const errors = await page.evaluate(() => window.__errors ?? []);
  await context.close();
  return errors;
}

const pageErrors = [];
const context = await browser.newContext();
const probe = await context.newPage();
probe.on("pageerror", (e) => pageErrors.push(String(e)));
probe.on("console", (m) => m.type() === "error" && pageErrors.push(m.text()));
await probe.goto(base, { waitUntil: "networkidle" });
await probe.waitForTimeout(4000);
await context.close();

await shoot("desktop", { width: 1440, height: 900 });
await shoot("desktop-wide", { width: 1728, height: 1000 });
await shoot("mobile", { width: 390, height: 844, settle: 8000 });
await shoot("desktop-reduced-motion", { width: 1440, height: 900, reducedMotion: "reduce", settle: 2500 });

await browser.close();

console.log(pageErrors.length ? `CONSOLE ERRORS:\n${pageErrors.join("\n")}` : "no console errors");
