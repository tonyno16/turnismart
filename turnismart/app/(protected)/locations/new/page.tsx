import Link from "next/link";
import { createLocation } from "@/app/actions/locations";
import { LocationForm } from "./location-form";

export default function NewLocationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/locations"
          className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          ← Sedi
        </Link>
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
          Nuova sede
        </h1>
        <LocationForm action={createLocation} />
      </div>
    </div>
  );
}
