export type Vehicle = {
  id: number;
  vin: string | null;
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  mileage: number | null;
  price: number | null;
  color: string | null;
  condition: string | null;
  description: string | null;
  image_urls: string[];
  engine: string | null;
  fuel_type: string | null;
  drivetrain: string | null;
  transmission: string | null;
  body_class: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function listVehicles(): Promise<Vehicle[]> {
  try {
    const res = await fetch(`${API_URL}/vehicles`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as Vehicle[];
  } catch {
    return [];
  }
}

export async function getVehicle(id: number): Promise<Vehicle | null> {
  try {
    const res = await fetch(`${API_URL}/vehicles/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as Vehicle;
  } catch {
    return null;
  }
}

export function formatMiles(miles: number | null): string {
  if (miles == null) return "—";
  return `${miles.toLocaleString()} mi`;
}

export function vehicleTitle(v: Vehicle): string {
  return [v.year, v.make, v.model, v.trim].filter(Boolean).join(" ") || "Vehicle";
}
