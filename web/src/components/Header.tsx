import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { site } from "@/lib/site";
import { getDict, type Locale } from "@/i18n/dictionaries";
import { LanguageSwitcher } from "./LanguageSwitcher";

const wordmarkFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["500"],
  style: ["italic"],
});

export function Header({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const t = dict.nav;
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
        <Link href={`/${locale}`} className="flex flex-col items-center gap-0.5 leading-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="嘉音 / Chia-In Auto"
            className="h-14 w-auto sm:h-16"
          />
          <span className={`${wordmarkFont.className} text-sm sm:text-base tracking-wide text-neutral-800`}>
            Chia-In Auto
          </span>
        </Link>
        <nav className="flex items-center gap-3 text-sm sm:gap-4 sm:text-base">
          <Link href={`/${locale}#services`} className="hover:text-brand">{t.services}</Link>
          <Link href={`/${locale}/inventory`} className="hover:text-brand">{t.inventory}</Link>
          <Link href={`/${locale}#contact`} className="hover:text-brand">{t.contact}</Link>
          <a
            href={`tel:${site.phone.replace(/[^\d+]/g, "")}`}
            className="hidden sm:inline-block rounded-full bg-brand px-4 py-1.5 text-white hover:bg-brand-dark"
          >
            {t.call}
          </a>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
