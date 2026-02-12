import { getOrganizationsForAdmin } from "@/lib/admin";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import Link from "next/link";
import { ExtendTrialButton } from "./extend-trial-button";

export default async function AdminOrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; paid?: string; org?: string }>;
}) {
  const params = await searchParams;
  const filters = {
    search: params.search,
    hasStripe: params.paid === "true" ? true : params.paid === "false" ? false : undefined,
  };

  const orgs = await getOrganizationsForAdmin(filters);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-zinc-500 hover:underline">
          ← Admin
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
          Organizzazioni
        </h1>
      </div>

      <form method="get" className="flex flex-wrap gap-2">
        <input
          name="search"
          type="search"
          placeholder="Cerca nome o settore..."
          defaultValue={params.search}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
        />
        <select
          name="paid"
          defaultValue={params.paid ?? ""}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
        >
          <option value="">Tutti</option>
          <option value="true">A pagamento</option>
          <option value="false">Trial / Free</option>
        </select>
        <button
          type="submit"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
        >
          Filtra
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
              <th className="p-3 text-left font-medium">Organizzazione</th>
              <th className="p-3 text-left font-medium">Settore</th>
              <th className="p-3 text-left font-medium">Utenti</th>
              <th className="p-3 text-left font-medium">Sedi</th>
              <th className="p-3 text-left font-medium">Dipendenti</th>
              <th className="p-3 text-left font-medium">Stato</th>
              <th className="p-3 text-left font-medium">Data</th>
              <th className="p-3 text-right font-medium">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((org) => (
              <tr
                key={org.id}
                className={`border-b border-zinc-100 dark:border-zinc-800 ${
                  params.org === org.id ? "bg-[hsl(var(--primary))]/5" : ""
                }`}
              >
                <td className="p-3">
                  <Link
                    href={`/admin/organizations?org=${org.id}`}
                    className="font-medium text-[hsl(var(--primary))] hover:underline"
                  >
                    {org.name}
                  </Link>
                </td>
                <td className="p-3 text-zinc-600 dark:text-zinc-400">{org.sector ?? "—"}</td>
                <td className="p-3">{org.userCount}</td>
                <td className="p-3">{org.locationCount}</td>
                <td className="p-3">{org.employeeCount}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      org.stripe_customer_id
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : org.onboarding_completed
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {org.stripe_customer_id ? "Paid" : org.onboarding_completed ? "Trial" : "Setup"}
                  </span>
                </td>
                <td className="p-3 text-zinc-500">
                  {format(org.created_at, "d MMM yyyy", { locale: it })}
                </td>
                <td className="p-3 text-right">
                  {!org.stripe_customer_id && (
                    <ExtendTrialButton organizationId={org.id} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
