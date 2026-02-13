import { requireOrganization } from "@/lib/auth";
import { getWeekSchedule, getWeekStart, getStaffingCoverage, getWeekStats } from "@/lib/schedules";
import { getLocations } from "@/lib/locations";
import { getEmployeesByOrganization, getEmployeeRoleIdsForOrganization } from "@/lib/employees";
import { getOnboardingData } from "@/app/actions/onboarding";
import { SchedulerClient } from "./scheduler-client";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const params = await searchParams;
  const { organization } = await requireOrganization();
  const weekStart = params.week ?? getWeekStart(new Date().toISOString().slice(0, 10));

  const [{ schedule, shifts }, locationsList, employeesList, { roles }, employeeRoleIds, stats] =
    await Promise.all([
      getWeekSchedule(organization.id, weekStart),
      getLocations(organization.id),
      getEmployeesByOrganization(organization.id, { isActive: true }),
      getOnboardingData(),
      getEmployeeRoleIdsForOrganization(organization.id),
      getWeekStats(organization.id, weekStart),
    ]);

  // coverage depends on schedule.id — must await separately
  const coverage = await getStaffingCoverage(organization.id, weekStart, schedule.id);

  return (
    <SchedulerClient
      schedule={schedule}
      shifts={shifts}
      locations={locationsList}
      employees={employeesList}
      roles={roles}
      coverage={coverage}
      stats={stats}
      weekStart={weekStart}
      employeeRoleIds={employeeRoleIds}
    />
  );
}
