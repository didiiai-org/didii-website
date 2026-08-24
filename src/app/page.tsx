import { BackToLife } from "@/components/sections/BackToLife";
import { Faq } from "@/components/sections/Faq";
import { Features } from "@/components/sections/Features";
import { FinalCta } from "@/components/sections/FinalCta";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Memory } from "@/components/sections/Memory";
import { Nav } from "@/components/sections/Nav";
import { Problem } from "@/components/sections/Problem";

export default function Home() {
  return (
    <div className="relative">
      {/*
        The hero wash is a decorative layer behind the nav and hero rather than a
        wrapper around them. A wrapper would have to clip its overflow, and a
        clipping ancestor traps `position: sticky` — the nav would stop following
        the page once the hero scrolled away. It ends on pure white, so it can
        overshoot the hero harmlessly.
      */}
      <div aria-hidden className="hero-wash pointer-events-none absolute inset-x-0 top-0 z-0 h-[1250px] lg:h-[1150px]" />

      <Nav />

      <main id="main" className="relative z-10">
        <Hero />
        <Problem />
        <Memory />
        <HowItWorks />
        <Features />
        <BackToLife />
        <Faq />
        <FinalCta />
      </main>

      <Footer />
    </div>
  );
}
