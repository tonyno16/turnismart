import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOrganization } from "@/lib/auth";
import { getLocationWithStaffing, getLocations, getLocationRoleShiftTimes } from "@/lib/locations";
import { getRoleShiftTimesForOrganization } from "@/lib/roles";
import { getOnboardingData } from "@/app/actions/onboarding";
import { LocationStaffingGrid } from "./staffing-grid";
import { LocationRoleShiftTimesForm } from "./location-role-shift-times-form";
import { DeleteLocationButton } from "./delete-location-button";
import { CopyStaffingForm } from "./copy-staffing-form";

const DAY_LABELS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const PERIODS = [
  { id: "morning", label: "M" },
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
  const allLocations = await getLocations(organization.id);
  const otherLocations = allLocations.filter((loc) => loc.id !== id);
  const [roleShiftTimesMap, locationRoleShiftTimesMap] = await Promise.all([
    getRoleShiftTimesForOrganization(organization.id),
    getLocationRoleShiftTimes(id),
  ]);

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
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
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
          <DeleteLocationButton
            locationId={location.id}
            locationName={location.name}
          />
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Fabbisogno personale
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Persone richieste per ruolo e fascia oraria
        </p>
        {otherLocations.length > 0 && (
          <div className="mt-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Copia il modello standard da un&apos;altra sede (sovrascrive il modello corrente)
            </p>
            <CopyStaffingForm
              currentLocationId={location.id}
              otherLocations={otherLocations}
            />
          </div>
        )}
        <LocationStaffingGrid
          locationId={location.id}
          roles={roles}
          initialStaffing={location.staffing}
        />
      </div>

      <LocationRoleShiftTimesForm
        locationId={location.id}
        roles={roles}
        roleTimes={roleShiftTimesMap.default}
        locationTimes={locationRoleShiftTimesMap}
      />
    </div>
  );
}
