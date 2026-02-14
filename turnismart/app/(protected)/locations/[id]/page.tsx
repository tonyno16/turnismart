import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { requireOrganization } from "@/lib/auth";
import { getLocationWithStaffing, getLocations, getLocationRoleShiftTimes } from "@/lib/locations";
import { getRoleShiftTimesForOrganization } from "@/lib/roles";
import { getOnboardingData } from "@/app/actions/onboarding";
import { getDailyStaffingForMonth } from "@/app/actions/locations";
import { LocationStaffingGrid } from "./staffing-grid";
import { MonthlyStaffingGrid } from "./monthly-staffing-grid";
import { StaffingTabs } from "./staffing-tabs";
import { LocationRoleShiftTimesForm } from "./location-role-shift-times-form";
import { DeleteLocationButton } from "./delete-location-button";
import { CopyStaffingForm } from "./copy-staffing-form";

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
  const currentMonth = format(new Date(), "yyyy-MM");
  const [roleShiftTimesMap, locationRoleShiftTimesMap, monthlyOverrides] =
    await Promise.all([
      getRoleShiftTimesForOrganization(organization.id),
      getLocationRoleShiftTimes(id),
      getDailyStaffingForMonth(id, currentMonth),
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
              Copia il fabbisogno da un&apos;altra sede (sovrascrive il corrente)
            </p>
            <CopyStaffingForm
              currentLocationId={location.id}
              otherLocations={otherLocations}
            />
          </div>
        )}
        <StaffingTabs
          weeklyTab={
            <LocationStaffingGrid
              locationId={location.id}
              roles={roles}
              staffing={location.staffing}
            />
          }
          monthlyTab={
            <MonthlyStaffingGrid
              locationId={location.id}
              roles={roles}
              weeklyStaffing={location.staffing}
              initialOverrides={monthlyOverrides}
              initialMonth={currentMonth}
            />
          }
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
