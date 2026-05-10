import { site } from "@/lib/site";

export function MapEmbed() {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 shadow-sm">
      <iframe
        src={site.mapsEmbedUrl}
        title={`${site.name} on Google Maps`}
        loading="lazy"
        className="h-72 w-full sm:h-96"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
