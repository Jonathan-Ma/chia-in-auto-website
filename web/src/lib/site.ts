/**
 * Non-translatable shop info. All user-visible strings live in /messages/<locale>.json.
 *
 * Service slugs here MUST match keys under "services" in the message files.
 */
export const site = {
  name: "Chia-In Auto",
  phone: "(555) 123-4567",
  email: "info@chia-in-auto.example",
  address: {
    line1: "123 Main Street",
    line2: "",
    city: "Your City",
    region: "ST",
    postal: "00000",
    country: "USA",
  },
  // Paste from Google Maps → Share → Embed a map → copy the src=
  mapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.123!2d-74.0!3d40.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDM0JzU2LjAiTiA3NMKwMDAnMDAuMCJX!5e0!3m2!1sen!2sus!4v0",
  mapsLink: "https://maps.google.com/?q=Chia-In+Auto",
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
