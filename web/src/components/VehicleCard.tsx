import Link from "next/link";
import { Vehicle, formatMiles, vehicleTitle } from "@/lib/api";
import { getDict, type Locale } from "@/i18n/dictionaries";

export function VehicleCard({ v, locale }: { v: Vehicle; locale: Locale }) {
  const dict = getDict(locale);
  const cover = v.image_urls[0];
  const price = v.price == null
    ? dict.inventory.callForPrice
    : `$${Math.round(v.price).toLocaleString()}`;

  return (
    <Link
      href={`/${locale}/inventory/${v.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={vehicleTitle(v)}
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400">
            {dict.inventory.noPhoto}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="font-semibold">{vehicleTitle(v)}</div>
        <div className="text-sm text-neutral-600">
          {formatMiles(v.mileage)}{v.color ? ` · ${v.color}` : ""}
        </div>
        <div className="mt-2 text-lg font-bold text-brand">{price}</div>
      </div>
    </Link>
  );
}
