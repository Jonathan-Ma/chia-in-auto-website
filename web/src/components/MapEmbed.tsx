import { site } from "@/lib/site";

export function MapEmbed() {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 shadow-sm">
      <iframe
        src={site.mapsEmbedUrl}
        title={`${site.name} on Google Maps`}
        loading="lazy"
        className="block h-full w-full border-0"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
