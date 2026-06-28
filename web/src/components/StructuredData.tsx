import { site } from "@/lib/site";
import { type Locale } from "@/i18n/dictionaries";

/**
 * JSON-LD structured data for Google rich results.
 *
 * Uses @type [AutoRepair, AutoDealer] because the business does both repair
 * and used-vehicle sales from the same physical location.
 *
 * Google's preferred schema for local auto businesses:
 * https://developers.google.com/search/docs/appearance/structured-data/local-business
 */

type Props = {
  locale: Locale;
  /** Path AFTER the locale, e.g. "/" or "/inventory/42". */
  path: string;
};

export function StructuredData({ locale, path }: Props) {
  const isZh = locale === "zh";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["AutoRepair", "AutoDealer"] as string[],
    "@id": `${site.url}/#business`,
    name: isZh ? site.nameZh : site.name,
    alternateName: isZh ? site.name : site.nameZh,
    description: isZh
      ? "全方位汽车维修服务与精选二手车。家族经营，资深技师，价格公道。"
      : "Family-owned full-service auto repair shop and quality used vehicles. Expert technicians, fair prices.",
    url: `${site.url}${path}`,
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.line1,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postal,
      addressCountry: site.address.country,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday"] as string[],
        opens: "08:30",
        closes: "12:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday"] as string[],
        opens: "13:30",
        closes: "16:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "08:30",
        closes: "12:30",
      },
    ],
    priceRange: "$$",
    image: `${site.url}/chia in full ai copy.jpeg`,
    geo: {
      "@type": "GeoCoordinates",
      latitude: 34.0598,
      longitude: -118.0434,
    },
    areaServed: {
      "@type": "City",
      name: "South El Monte",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
