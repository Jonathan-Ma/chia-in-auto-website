import Link from "next/link";

// not-found.tsx can't read params, so the link falls back to the English route.
// The user can click "back to inventory" and the locale-aware Header above still works.
export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <h1 className="text-2xl font-bold">Vehicle not found</h1>
      <p className="mt-2 text-neutral-600">It may have already been sold.</p>
      <Link href="/en/inventory" className="mt-4 inline-block text-brand hover:underline">
        ← Back to inventory
      </Link>
    </div>
  );
}
