import Link from "next/link";
import { requireOrganization } from "@/lib/auth";
import { getEmployeesByOrganization } from "@/lib/employees";
import { getOnboardingData } from "@/app/actions/onboarding";

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; active?: string }>;
}) {
  const params = await searchParams;
  const { organization } = await requireOrganization();
  const { roles } = await getOnboardingData();

  const employeesList = await getEmployeesByOrganization(organization.id, {
    search: params.search,
    isActive: params.active === "false" ? false : params.active === "true" ? true : undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Dipendenti
        </h1>
        <Link
          href="/employees/new"
          className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + Nuovo dipendente
        </Link>
      </div>

      <div className="flex flex-wrap gap-4">
        <form method="get" className="flex gap-2">
          <input
            name="search"
            type="search"
            placeholder="Cerca nome, email, telefono..."
            defaultValue={params.search}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
          <select
            name="active"
            defaultValue={params.active ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          >
            <option value="">Tutti</option>
            <option value="true">Attivi</option>
            <option value="false">Inattivi</option>
          </select>
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600 dark:hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Filtra
          </button>
        </form>
      </div>

      {employeesList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <p className="text-zinc-600 dark:text-zinc-400">
            Nessun dipendente trovato.
          </p>
          <Link
            href="/employees/new"
            className="mt-4 inline-block text-[hsl(var(--primary))] hover:underline"
          >
            Aggiungi il primo
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
                <th className="p-3 text-left font-medium">Nome</th>
                <th className="p-3 text-left font-medium">Contatti</th>
                <th className="p-3 text-left font-medium">Ore/sett</th>
                <th className="p-3 text-left font-medium">Stato</th>
                <th className="p-3 text-right font-medium">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {employeesList.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-b border-zinc-100 dark:border-zinc-800"
                >
                  <td className="p-3">
                    <Link
                      href={`/employees/${emp.id}`}
                      className="font-medium text-[hsl(var(--primary))] hover:underline"
                    >
                      {emp.first_name} {emp.last_name}
                    </Link>
                  </td>
                  <td className="p-3 text-zinc-600 dark:text-zinc-400">
                    {emp.email || emp.phone || "—"}
                  </td>
                  <td className="p-3">{emp.weekly_hours}h</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        emp.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {emp.is_active ? "Attivo" : "Inattivo"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/employees/${emp.id}`}
                      className="text-[hsl(var(--primary))] hover:underline"
                    >
                      Modifica
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
