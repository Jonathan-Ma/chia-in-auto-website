import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getVehicle, formatMiles, vehicleTitle } from "@/lib/api";
import { site } from "@/lib/site";
import { getDict, locales, type Locale } from "@/i18n/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: Locale }>;
}): Promise<Metadata> {
  const { id: idStr, locale } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return {};
  const v = await getVehicle(id);
  if (!v) return {};

  const dict = getDict(locale);
  const title = vehicleTitle(v);
  const price =
    v.price == null
      ? dict.inventory.callForPrice
      : `$${Math.round(v.price).toLocaleString()}`;

  // Build a rich description from vehicle attributes
  const descParts: string[] = [];
  if (locale === "zh") {
    descParts.push(`${title} — ${price}`);
    if (v.mileage) descParts.push(`里程 ${formatMiles(v.mileage)}`);
    if (v.color) descParts.push(v.color);
    if (v.condition) descParts.push(v.condition);
    descParts.push("佳音汽车精选二手车，全面检测，诚信可靠。");
  } else {
    descParts.push(`${title} — ${price}`);
    if (v.mileage) descParts.push(`${formatMiles(v.mileage)}`);
    if (v.color) descParts.push(v.color);
    if (v.condition) descParts.push(v.condition);
    descParts.push(
      "Quality used vehicle, fully inspected by Chia-In Auto Repair in South El Monte, CA."
    );
  }
  const description = descParts.join(" · ");

  const path = `/${locale}/inventory/${id}`;

  return {
    title: `${title} — ${locale === "zh" ? site.nameZh : site.name}`,
    description,
    alternates: {
      canonical: `${site.url}${path}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${site.url}/${l}/inventory/${id}`])
      ),
    },
    openGraph: {
      title: `${title} — ${locale === "zh" ? site.nameZh : site.name}`,
      description,
      type: "article",
      images: v.image_urls.length > 0
        ? [{ url: v.image_urls[0], width: 1200, height: 630 }]
        : [{ url: `${site.url}/chia in full ai copy.jpeg`, width: 1200, height: 630 }],
    },
  };
}

export default async function VehiclePage({
  params,
}: { params: Promise<{ id: string; locale: Locale }> }) {
  const { id: idStr, locale } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) notFound();
  const v = await getVehicle(id);
  if (!v) notFound();

  const dict = getDict(locale);
  const title = vehicleTitle(v);
  const price = v.price == null
    ? dict.inventory.callForPrice
    : `$${Math.round(v.price).toLocaleString()}`;

  return (
    <div className="py-8">
      {/* Photo gallery */}
      <div className="grid gap-2 sm:grid-cols-2">
        {v.image_urls.length > 0 ? (
          v.image_urls.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt={`${title} — ${i + 1}`}
              className={`w-full rounded-xl object-cover ${i === 0 ? "sm:col-span-2 sm:h-[28rem]" : "h-56 sm:h-72"}`}
            />
          ))
        ) : (
          <div className="aspect-[4/3] rounded-xl bg-neutral-100" />
        )}
      </div>

      {/* Details */}
      <div className="mt-8 grid gap-8 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <h1 className="text-3xl font-bold">{title}</h1>
          <div className="mt-2 text-2xl font-bold text-brand">{price}</div>

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Spec label={dict.vehicle.specs.mileage} value={formatMiles(v.mileage)} />
            <Spec label={dict.vehicle.specs.color} value={v.color} />
            <Spec label={dict.vehicle.specs.condition} value={v.condition} />
            <Spec label={dict.vehicle.specs.engine} value={v.engine} />
            <Spec label={dict.vehicle.specs.transmission} value={v.transmission} />
            <Spec label={dict.vehicle.specs.drivetrain} value={v.drivetrain} />
            <Spec label={dict.vehicle.specs.fuel} value={v.fuel_type} />
            <Spec label={dict.vehicle.specs.vin} value={v.vin} />
          </dl>

          {v.description && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold">{dict.vehicle.about}</h2>
              <p className="mt-2 whitespace-pre-line text-neutral-700">{v.description}</p>
            </div>
          )}
        </div>

        <aside className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 h-fit">
          <h3 className="font-semibold">{dict.vehicle.interested}</h3>
          <p className="mt-1 text-sm text-neutral-600">{dict.vehicle.interestedBlurb}</p>
          <a href={`tel:${site.phone}`}
             className="mt-4 block rounded-full bg-brand px-5 py-2 text-center font-semibold text-white hover:bg-brand-dark">
            📞 {site.phone}
          </a>
          <a href={`mailto:${site.email}?subject=${encodeURIComponent(`${dict.vehicle.emailSubject} ${title}`)}`}
             className="mt-2 block rounded-full border border-neutral-300 bg-white px-5 py-2 text-center font-semibold hover:bg-neutral-100">
            ✉️ {dict.vehicle.emailUs}
          </a>
        </aside>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="border-b border-dashed border-neutral-200 pb-2">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="font-medium">{value || "—"}</dd>
    </div>
  );
}
