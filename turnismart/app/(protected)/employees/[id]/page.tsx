import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOrganization } from "@/lib/auth";
import { getEmployeeDetail } from "@/lib/employees";
import { getLocations } from "@/lib/locations";
import { getOnboardingData } from "@/app/actions/onboarding";
import { EmployeeProfileForm } from "./profile-form";
import { EmployeeAvailabilityGrid } from "./availability-grid";

const TIME_OFF_LABELS: Record<string, string> = {
  vacation: "Ferie",
  personal_leave: "Permesso",
  sick_leave: "Malattia",
  other: "Altro",
};

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organization } = await requireOrganization();
  const employee = await getEmployeeDetail(id);

  if (!employee || employee.organization_id !== organization.id) {
    notFound();
  }

  const { roles } = await getOnboardingData();
  const locationsList = await getLocations(organization.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/employees"
          className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          ← Dipendenti
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          {employee.first_name} {employee.last_name}
        </h1>
        <EmployeeProfileForm
          employee={employee}
          roles={roles}
          locations={locationsList}
        />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Disponibilità settimanale
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Quando può lavorare (ricorrente)
        </p>
        <EmployeeAvailabilityGrid
          employeeId={employee.id}
          availability={employee.availability}
        />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Assenze e permessi
        </h2>
        {employee.timeOff.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">Nessuna assenza registrata</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {employee.timeOff.map((to) => (
              <li
                key={to.id}
                className="flex items-center justify-between rounded border border-zinc-200 p-2 dark:border-zinc-700"
              >
                <span>
                  {TIME_OFF_LABELS[to.type] || to.type}: {to.start_date} - {to.end_date}
                  {to.notes && ` (${to.notes})`}
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-xs ${
                    to.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : to.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {to.status === "approved"
                    ? "Approvato"
                    : to.status === "rejected"
                    ? "Rifiutato"
                    : "In attesa"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Incompatibilità
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Dipendenti che non preferiscono lavorare insieme
        </p>
        {employee.incompatibilities.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">Nessuna incompatibilità</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {employee.incompatibilities.map((inc) => (
              <li key={inc.id} className="text-sm text-zinc-600 dark:text-zinc-400">
                Con {inc.other_employee_name ?? "altro dipendente"}
                {inc.reason && ` — ${inc.reason}`}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
