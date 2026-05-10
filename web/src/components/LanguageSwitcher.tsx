"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { locales, localeLabels, isLocale, type Locale } from "@/i18n/dictionaries";

export function LanguageSwitcher() {
  const pathname = usePathname() || "/en";
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // First path segment is the locale (e.g. /en/inventory → "en")
  const segments = pathname.split("/").filter(Boolean);
  const currentLocale: Locale = isLocale(segments[0] ?? "") ? (segments[0] as Locale) : "en";
  const restPath = "/" + segments.slice(1).join("/");

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        aria-expanded={open}
        className="flex items-center gap-1 rounded-full p-1.5 text-neutral-700 hover:bg-neutral-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
             className="h-5 w-5">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="hidden text-xs font-semibold uppercase sm:inline">{currentLocale}</span>
      </button>

      {open && (
        <ul className="absolute right-0 z-50 mt-2 w-36 overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
          {locales.map((l) => {
            const target = restPath === "/" ? `/${l}` : `/${l}${restPath}`;
            return (
              <li key={l}>
                <Link
                  href={target}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 text-sm hover:bg-neutral-50 ${
                    l === currentLocale ? "font-semibold text-brand" : ""
                  }`}
                >
                  <span>{localeLabels[l]}</span>
                  {l === currentLocale && <span aria-hidden>✓</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
