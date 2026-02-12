import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOrganization } from "@/lib/auth";
import { getLocationWithStaffing } from "@/lib/locations";
import { getOnboardingData } from "@/app/actions/onboarding";
import { LocationStaffingGrid } from "./staffing-grid";

const DAY_LABELS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const PERIODS = [
  { id: "morning", label: "M" },
  { id: "afternoon", label: "P" },
  { id: "evening", label: "S" },
];

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organization } = await requireOrganization();
  const location = await getLocationWithStaffing(id);

  if (!location || location.organization_id !== organization.id) {
    notFound();
  }

  const { roles } = await getOnboardingData();

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
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          {location.name}
        </h1>
        {location.address && (
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            {location.address}
          </p>
        )}
        {location.phone && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Tel: {location.phone}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Fabbisogno personale
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Persone richieste per ruolo e fascia oraria
        </p>
        <LocationStaffingGrid
          locationId={location.id}
          roles={roles}
          staffing={location.staffing}
        />
      </div>
    </div>
  );
}
