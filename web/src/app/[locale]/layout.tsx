import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import "../globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StructuredData } from "@/components/StructuredData";
import { site } from "@/lib/site";
import { getDict, isLocale, locales, type Locale } from "@/i18n/dictionaries";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDict(locale);

  const ogLocale =
    locale === "zh" ? "zh_CN" : locale === "es" ? "es_US" : "en_US";

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    metadataBase: new URL(site.url),
    alternates: {
      languages: {
        en: `/en`,
        zh: `/zh`,
        es: `/es`,
      },
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      type: "website",
      locale: ogLocale,
      siteName: locale === "zh" ? site.nameZh : site.name,
      images: [
        {
          url: "/chia in full ai copy.jpeg",
          width: 1200,
          height: 630,
          alt: locale === "zh" ? "佳音汽车" : "Chia-In Auto Repair",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
      images: ["/chia in full ai copy.jpeg"],
    },
    // Help Chinese-language search engines categorize the site
    keywords: locale === "zh"
      ? ["汽车维修", "二手车", "佳音汽车", "修车", "南艾尔蒙地", "汽车保养"]
      : ["auto repair", "used cars", "mechanic", "South El Monte", "car maintenance"],
    authors: [{ name: site.name }],
    // Tell Google (and Baidu) the geo target
    other: {
      "geo.region": "US-CA",
      "geo.placename": "South El Monte",
    },
  };
}

export const viewport = { width: "device-width", initialScale: 1 };

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale: Locale = locale;

  return (
    <html lang={typedLocale}>
      <body>
        <StructuredData locale={typedLocale} path={`/${typedLocale}`} />
        <Header locale={typedLocale} />
        <main className="mx-auto max-w-6xl px-4">{children}</main>
        <Footer locale={typedLocale} />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TK030J6K90"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TK030J6K90');
          `}
        </Script>
      </body>
    </html>
  );
}
