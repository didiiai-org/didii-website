import { Reveal } from "@/components/motion/Reveal";
import { Wordmark } from "@/components/ui/Wordmark";
import { footer } from "@/lib/content";
import { clsx } from "@/lib/clsx";
import { gutter, shell } from "@/lib/layout";

export function Footer() {
  return (
    <footer id="about" className={clsx(gutter, "bg-brand-green pt-20 pb-10 text-green-100 sm:pt-24")}>
      <div className={shell}>
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <Reveal from="up" className="flex flex-col gap-4">
            <Wordmark size="footer" className="text-green-100" />
            <p className="text-body text-green-100/60">{footer.tagline}</p>
          </Reveal>

          {footer.columns.map((column, i) => (
            <Reveal key={column.heading} from="up" delay={0.06 * (i + 1)} className="flex flex-col gap-4">
              <h3 className="text-body font-medium text-brand-gold">{column.heading}</h3>
              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="inline-block text-body text-green-100/90 transition-colors hover:text-brand-gold"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 border-t border-green-100/12 pt-8">
          <p className="text-center text-caption text-green-100/55">{footer.legal}</p>
        </div>
      </div>
    </footer>
  );
}
