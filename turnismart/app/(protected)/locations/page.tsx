import Link from "next/link";
import { requireOrganization } from "@/lib/auth";
import { getLocations } from "@/lib/locations";

export default async function LocationsPage() {
  const { organization } = await requireOrganization();
  const locationsList = await getLocations(organization.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Sedi
        </h1>
        <Link
          href="/locations/new"
          className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + Nuova sede
        </Link>
      </div>

      {locationsList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <p className="text-zinc-600 dark:text-zinc-400">
            Nessuna sede ancora. Aggiungi la prima sede per gestire gli orari.
          </p>
          <Link
            href="/locations/new"
            className="mt-4 inline-block text-[hsl(var(--primary))] hover:underline"
          >
            Aggiungi sede
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locationsList.map((loc) => (
            <Link
              key={loc.id}
              href={`/locations/${loc.id}`}
              className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-[hsl(var(--primary))]/30 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <h3 className="font-semibold text-zinc-900 dark:text-white">
                {loc.name}
              </h3>
              {loc.address && (
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {loc.address}
                </p>
              )}
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                    loc.is_active
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {loc.is_active ? "Attiva" : "Inattiva"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
