import { notFound } from "next/navigation";
import { getVehicle, formatMiles, vehicleTitle } from "@/lib/api";
import { site } from "@/lib/site";
import { getDict, type Locale } from "@/i18n/dictionaries";

export default async function VehiclePage({
  params,
}: { params: { id: string; locale: Locale } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();
  const v = await getVehicle(id);
  if (!v) notFound();

  const dict = getDict(params.locale);
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
