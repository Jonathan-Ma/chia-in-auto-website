import { listVehicles } from "@/lib/api";
import { VehicleCard } from "@/components/VehicleCard";
import { getDict, type Locale } from "@/i18n/dictionaries";

export default async function InventoryPage({ params: { locale } }: { params: { locale: Locale } }) {
  const dict = getDict(locale);
  const vehicles = await listVehicles();

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold sm:text-4xl">{dict.inventory.title}</h1>
      <p className="mt-2 text-neutral-600">{dict.inventory.subtitle}</p>

      {vehicles.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-neutral-300 p-12 text-center">
          <p className="text-neutral-600">{dict.inventory.empty}</p>
          <p className="mt-2 text-sm text-neutral-500">{dict.inventory.emptySub}</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => <VehicleCard key={v.id} v={v} locale={locale} />)}
        </div>
      )}
    </div>
  );
}
