import Link from "next/link";
import { site } from "@/lib/site";
import { MapEmbed } from "@/components/MapEmbed";
import { VehicleCard } from "@/components/VehicleCard";
import { listVehicles } from "@/lib/api";
import { getDict, type Locale } from "@/i18n/dictionaries";

export default async function HomePage({ params: { locale } }: { params: { locale: Locale } }) {
  const dict = getDict(locale);
  const vehicles = (await listVehicles()).slice(0, 3);

  const hours = [
    { day: dict.hours.weekdays, time: dict.hours.weekdaysTime },
    { day: dict.hours.saturday, time: dict.hours.saturdayTime },
    { day: dict.hours.sunday, time: dict.hours.closed },
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-br from-brand to-brand-dark px-6 py-12 text-white sm:px-12 sm:py-20">
        <h1 className="text-3xl font-extrabold sm:text-5xl">{dict.home.tagline}</h1>
        <p className="mt-4 max-w-2xl text-base sm:text-lg opacity-90">{dict.home.intro}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={`tel:${site.phone}`} className="rounded-full bg-white px-5 py-2.5 font-semibold text-brand hover:bg-brand-light">
            📞 {site.phone}
          </a>
          <Link href={`/${locale}/inventory`} className="rounded-full border border-white/60 px-5 py-2.5 font-semibold hover:bg-white/10">
            {dict.home.viewInventory} →
          </Link>
        </div>
      </section>

      {/* Services */}
      <section id="services">
        <h2 className="text-2xl font-bold sm:text-3xl">{dict.home.servicesHeading}</h2>
        <p className="mt-2 text-neutral-600">{dict.home.servicesSubhead}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {site.serviceSlugs.map((slug) => (
            <div key={slug} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="text-3xl">{site.serviceIcons[slug]}</div>
              <h3 className="mt-3 font-semibold">{dict.services[slug].title}</h3>
              <p className="mt-1 text-sm text-neutral-600">{dict.services[slug].blurb}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured inventory */}
      <section>
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">{dict.home.featuredHeading}</h2>
            <p className="mt-2 text-neutral-600">{dict.home.featuredSubhead}</p>
          </div>
          <Link href={`/${locale}/inventory`} className="text-sm font-semibold text-brand hover:underline">
            {dict.home.seeAll} →
          </Link>
        </div>
        {vehicles.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
            {dict.home.noVehicles}
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v) => <VehicleCard key={v.id} v={v} locale={locale} />)}
          </div>
        )}
      </section>

      {/* Visit / contact / map */}
      <section id="contact" className="grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">{dict.home.visitHeading}</h2>
          <p className="mt-2 text-neutral-700">
            {site.address.line1}<br />
            {site.address.city}, {site.address.region} {site.address.postal}
          </p>
          <h3 className="mt-6 font-semibold">{dict.home.hoursHeading}</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {hours.map((h) => (
              <li key={h.day} className="flex justify-between border-b border-dashed border-neutral-200 py-1">
                <span>{h.day}</span><span className="text-neutral-600">{h.time}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`tel:${site.phone}`} className="rounded-full bg-brand px-5 py-2 font-semibold text-white hover:bg-brand-dark">
              📞 {site.phone}
            </a>
            <a href={site.mapsLink} target="_blank" rel="noreferrer"
               className="rounded-full border border-neutral-300 px-5 py-2 font-semibold hover:bg-neutral-100">
              {dict.home.directions}
            </a>
          </div>
        </div>
        <MapEmbed />
      </section>
    </div>
  );
}
