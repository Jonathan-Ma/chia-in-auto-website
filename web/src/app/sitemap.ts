import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { locales } from "@/i18n/dictionaries";

/**
 * Dynamic sitemap covering all locales.
 *
 * Living at src/app/sitemap.ts maps to https://<domain>/sitemap.xml
 * (outside the [locale] segment, so no middleware interference).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = site.url;

  // Static pages across all locales
  const staticPaths = ["", "/inventory"];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.flatMap(
    (path) =>
      locales.map((locale) => ({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: (path === "" ? "weekly" : "daily") as
          | "weekly"
          | "daily",
        priority: path === "" ? 1.0 : 0.8,
      }))
  );

  // Dynamic vehicle pages — fetch from the API
  let vehicleEntries: MetadataRoute.Sitemap = [];
  try {
    const API_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${API_URL}/vehicles`, {
      cache: "no-store",
    });
    if (res.ok) {
      const vehicles = (await res.json()) as Array<{
        id: number;
        updated_at: string;
      }>;
      vehicleEntries = vehicles.flatMap((v) =>
        locales.map((locale) => ({
          url: `${baseUrl}/${locale}/inventory/${v.id}`,
          lastModified: v.updated_at ? new Date(v.updated_at) : new Date(),
          changeFrequency: "daily" as const,
          priority: 0.7,
        }))
      );
    }
  } catch {
    // API unavailable — ship the sitemap without vehicle pages.
    // Google will pick them up via internal links and next crawl.
  }

  return [...staticEntries, ...vehicleEntries];
}
