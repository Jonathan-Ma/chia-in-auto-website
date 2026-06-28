import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Robots.txt — allow all crawlers, point to the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
