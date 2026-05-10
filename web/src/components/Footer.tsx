import { site } from "@/lib/site";
import { getDict, type Locale } from "@/i18n/dictionaries";

export function Footer({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <h3 className="font-bold">{site.name}</h3>
          <p className="mt-2 text-sm text-neutral-600">{dict.home.tagline}</p>
        </div>
        <div>
          <h3 className="font-bold">{dict.footer.visitUs}</h3>
          <p className="mt-2 text-sm text-neutral-600">
            {site.address.line1}{site.address.line2 ? `, ${site.address.line2}` : ""}<br />
            {site.address.city}, {site.address.region} {site.address.postal}
          </p>
          <a href={site.mapsLink} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-brand hover:underline">
            {dict.home.directions} →
          </a>
        </div>
        <div>
          <h3 className="font-bold">{dict.footer.contact}</h3>
          <p className="mt-2 text-sm text-neutral-600">
            <a href={`tel:${site.phone}`} className="hover:underline">{site.phone}</a><br />
            <a href={`mailto:${site.email}`} className="hover:underline">{site.email}</a>
          </p>
        </div>
      </div>
      <div className="border-t border-neutral-200 py-4 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} {site.name}. {dict.footer.rights}
      </div>
    </footer>
  );
}
