import Link from "next/link";
import { requireOrganization } from "@/lib/auth";
import { getDashboardStats, getWeekOverview, getPendingAlerts } from "@/lib/dashboard";
import { getWeekStart, getWeekSchedule, getStaffingCoverage } from "@/lib/schedules";
import { format, parseISO, addDays } from "date-fns";
import { it } from "date-fns/locale";
import { DashboardActions } from "./dashboard-actions";

const DAY_LABELS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

export default async function DashboardPage() {
  const { user, organization } = await requireOrganization();
  const weekStart = getWeekStart(new Date().toISOString().slice(0, 10));

  // Compute coverage once and share with both stats and overview
  const [{ schedule }, coverage, alerts] = await Promise.all([
    getWeekSchedule(organization.id, weekStart),
    getStaffingCoverage(organization.id, weekStart),
    getPendingAlerts(organization.id, weekStart),
  ]);

  const [stats, overview] = await Promise.all([
    getDashboardStats(organization.id, weekStart, coverage),
    getWeekOverview(organization.id, weekStart, coverage),
  ]);


  const statusColors: Record<string, string> = {
    green: "bg-green-500",
    yellow: "bg-amber-500",
    red: "bg-red-500",
    empty: "bg-zinc-200 dark:bg-zinc-700",
  };

  const locationIds = [...new Set(overview.map((o) => o.locationId))];
  const locationNames = new Map(
    overview.map((o) => [o.locationId, o.locationName])
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Dashboard
        </h1>
        <DashboardActions
          scheduleId={schedule.id}
          weekStart={weekStart}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Dipendenti attivi
          </p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
            {stats.activeEmployees}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Turni scoperti
          </p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
            {stats.uncoveredShifts}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Ore pianificate
          </p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
            {stats.plannedHours}h
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Costo stimato
          </p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
            €{stats.estimatedCost.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Copertura settimanale
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Lun {format(parseISO(weekStart), "d MMM", { locale: it })} – Dom{" "}
          {format(addDays(parseISO(weekStart), 6), "d MMM yyyy", { locale: it })}
        </p>
        <div className="mt-4 overflow-x-auto">
          {locationIds.length === 0 ? (
            <p className="py-8 text-center text-zinc-500">
              Nessuna sede. Aggiungi una sede e il fabbisogno per vedere la
              copertura.
            </p>
          ) : (
            <table className="w-full min-w-[400px] text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="p-2 text-left font-medium">Sede</th>
                  {DAY_LABELS.map((d, i) => (
                    <th
                      key={i}
                      className="p-2 text-center text-xs text-zinc-500"
                    >
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {locationIds.map((locId) => (
                  <tr
                    key={locId}
                    className="border-b border-zinc-100 dark:border-zinc-800"
                  >
                    <td className="p-2 font-medium">
                      {locationNames.get(locId)}
                    </td>
                    {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                      const cell = overview.find(
                        (o) => o.locationId === locId && o.day === day
                      );
                      const status = cell?.status ?? "empty";
                      return (
                        <td key={day} className="p-2 text-center">
                          <div
                            className={`mx-auto h-6 w-6 rounded-full ${statusColors[status]}`}
                            title={
                              cell
                                ? `${cell.assigned}/${cell.required}`
                                : "—"
                            }
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-green-500" />
            Coperto
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-amber-500" />
            Parziale
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            Scoperto
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            Nessun fabbisogno
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Avvisi
        </h2>
          {alerts.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">
              Nessun avviso in sospeso.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {alerts.map((a, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
                >
                  <div>
                    <p className="font-medium">{a.title}</p>
                    {a.detail && (
                      <p className="text-sm text-zinc-500">{a.detail}</p>
                    )}
                  </div>
                  {a.type === "shift_request" && (
                    <Link
                      href={user.role === "owner" || user.role === "manager" ? "/requests" : "/my-requests"}
                      className="text-sm text-[hsl(var(--primary))] hover:underline"
                    >
                      Gestisci
                    </Link>
                  )}
                  {a.type === "no_shifts" && (
                    <Link
                      href="/schedule"
                      className="text-sm text-[hsl(var(--primary))] hover:underline"
                    >
                      Programmazione
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
    </div>
  );
}
