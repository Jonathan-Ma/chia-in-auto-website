import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getDict, isLocale, locales, type Locale } from "@/i18n/dictionaries";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({
  params: { locale },
}: { params: { locale: string } }): Metadata {
  const dict = getDict(locale);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      type: "website",
    },
  };
}

export const viewport = { width: "device-width", initialScale: 1 };

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(locale)) notFound();
  const typedLocale: Locale = locale;

  return (
    <html lang={typedLocale}>
      <body>
        <Header locale={typedLocale} />
        <main className="mx-auto max-w-6xl px-4">{children}</main>
        <Footer locale={typedLocale} />
      </body>
    </html>
  );
}
