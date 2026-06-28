/**
 * Non-translatable shop info. All user-visible strings live in /messages/<locale>.json.
 *
 * Service slugs here MUST match keys under "services" in the message files.
 */
export const site = {
  name: "Chia-In Auto Repair",
  legalName: "Chia-In Auto Repair Corp.",
  /** Chinese business name used in structured data / hreflang. */
  nameZh: "佳音汽车",
  /** Public URL of the live site — no trailing slash. Set NEXT_PUBLIC_SITE_URL in production. */
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://chiainauto.com",
  phone: "+1(626)-448-4829",
  email: "info@chia-in-auto.example",
  address: {
    line1: "9549 Garvey Ave",
    line2: "",
    city: "South El Monte",
    region: "CA",
    postal: "91733",
    country: "USA",
  },
  // Embed the actual shop location from Google Maps.
  mapsEmbedUrl:
    "https://www.google.com/maps?q=Chia-In+Auto+Repair+9549+Garvey+Ave+South+El+Monte+CA+91733&z=17&output=embed",
  mapsLink:
    "https://www.google.com/maps/search/?api=1&query=Chia-In+Auto+Repair+9549+Garvey+Ave+South+El+Monte+CA+91733",
  serviceSlugs: [
    "oil-change",
    "brakes",
    "tires",
    "diagnostics",
    "ac",
    "used-vehicles",
  ] as const,
  serviceIcons: {
    "oil-change": "🛢️",
    brakes: "🛑",
    tires: "🛞",
    diagnostics: "🔧",
    ac: "❄️",
    "used-vehicles": "🚗",
  } as const,
} as const;

export type ServiceSlug = (typeof site.serviceSlugs)[number];
