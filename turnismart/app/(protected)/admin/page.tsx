import Link from "next/link";
import { getAdminKpis, getRecentOrganizations, getAdminAlerts } from "@/lib/admin";

export const dynamic = "force-dynamic";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Building2, Users, AlertTriangle, Calendar } from "lucide-react";

export default async function AdminDashboardPage() {
  const [kpis, recentOrgs, alerts] = await Promise.all([
    getAdminKpis(),
    getRecentOrganizations(10),
    getAdminAlerts(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Panoramica piattaforma e alert
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <Building2 className="size-5" />
            <span className="text-sm">Organizzazioni</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
            {kpis.totalOrganizations}
          </p>
          <p className="text-xs text-zinc-500">
            Trial: {kpis.trialOrgs} · Paid: {kpis.paidOrgs}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <Users className="size-5" />
            <span className="text-sm">Utenti totali</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
            {kpis.totalUsers}
          </p>
          <p className="text-xs text-zinc-500">
            +{kpis.recentSignups} ultimi 7 giorni
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <Calendar className="size-5" />
            <span className="text-sm">Trial attivi</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
            {kpis.trialOrgs}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <AlertTriangle className="size-5" />
            <span className="text-sm">Alert</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
            {alerts.length}
          </p>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
          <h2 className="font-semibold text-amber-800 dark:text-amber-200">Alert</h2>
          <ul className="mt-2 space-y-1">
            {alerts.slice(0, 5).map((a) => (
              <li key={`${a.organizationId}-${a.type}`} className="text-sm">
                <Link
                  href={`/admin/organizations?org=${a.organizationId}`}
                  className="text-amber-800 hover:underline dark:text-amber-200"
                >
                  {a.organizationName}
                </Link>
                {" — "}
                {a.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-white">
            Organizzazioni recenti
          </h2>
          <Link
            href="/admin/organizations"
            className="text-sm text-[hsl(var(--primary))] hover:underline"
          >
            Vedi tutte →
          </Link>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {recentOrgs.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-500">
              Nessuna organizzazione
            </div>
          ) : (
            recentOrgs.map((org) => (
              <Link
                key={org.id}
                href={`/admin/organizations?org=${org.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">{org.name}</p>
                  <p className="text-sm text-zinc-500">
                    {org.sector ?? "—"} · {org.userCount} utenti · {org.locationCount} sedi
                  </p>
                </div>
                <div className="text-right text-sm">
                  <span
                    className={`rounded-full px-2 py-0.5 ${
                      org.stripe_customer_id
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : org.trial_ends_at && new Date(org.trial_ends_at) > new Date()
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {org.stripe_customer_id ? "Paid" : org.onboarding_completed ? "Trial" : "Setup"}
                  </span>
                  <p className="mt-1 text-xs text-zinc-500">
                    {format(org.created_at, "d MMM yyyy", { locale: it })}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
