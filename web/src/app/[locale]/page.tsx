import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { MapEmbed } from "@/components/MapEmbed";
import { VehicleCard } from "@/components/VehicleCard";
import { listVehicles } from "@/lib/api";
import { getDict, locales, type Locale } from "@/i18n/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDict(locale);
  const path = `/${locale}`;

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: `${site.url}${path}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${site.url}/${l}`])
      ),
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      type: "website",
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = getDict(locale);
  const vehicles = (await listVehicles()).slice(0, 3);

  const hours = [
    { day: dict.hours.monday, time: dict.hours.closed },
    { day: dict.hours.tuesday, time: dict.hours.weekdaySplitTime },
    { day: dict.hours.wednesday, time: dict.hours.weekdaySplitTime },
    { day: dict.hours.thursday, time: dict.hours.weekdaySplitTime },
    { day: dict.hours.friday, time: dict.hours.weekdaySplitTime },
    { day: dict.hours.saturday, time: dict.hours.saturdayTime },
    { day: dict.hours.sunday, time: dict.hours.closed },
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl px-6 py-12 text-white sm:px-12 sm:py-20">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat filter"
          style={{ backgroundImage: "url('/chia in full ai copy.jpeg')" }}
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative mx-auto max-w-5xl rounded-[32px] p-8 sm:p-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {dict.home.tagline}
          </h1>
          <p className="mt-4 max-w-3xl text-base font-medium text-white/90 sm:text-lg">
            {dict.home.intro}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`tel:${site.phone}`} className="rounded-full bg-white px-5 py-2.5 font-semibold text-brand hover:bg-brand-light">
              📞 {site.phone}
            </a>
            <Link href={`/${locale}/inventory`} className="rounded-full border border-white/60 px-5 py-2.5 font-semibold hover:bg-white/10">
              {dict.home.viewInventory} →
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services">
        <div className="sm:flex sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">{dict.home.servicesHeading}</h2>
            <p className="mt-2 max-w-2xl text-neutral-600">{dict.home.servicesSubhead}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {dict.home.servicesCards.map((service) => (
            <div key={service.title} className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <h3 className="font-semibold text-lg text-neutral-900">{service.title}</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{service.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-neutral-700">
              {dict.home.servicesFallback}
            </p>
            <Link
              href={`/${locale}#contact`}
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
            >
              {dict.home.servicesFallbackCta}
            </Link>
          </div>
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
                <span>{h.day}</span>
                <span className="text-right text-neutral-600 whitespace-pre-line">{h.time}</span>
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
