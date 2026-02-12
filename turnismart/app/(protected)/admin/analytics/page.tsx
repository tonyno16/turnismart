import Link from "next/link";
import {
  getPlanDistribution,
  getCurrentMonthUsage,
  getSignupTrend,
} from "@/lib/admin-analytics";

export default async function AdminAnalyticsPage() {
  const [planDist, usage, signupTrend] = await Promise.all([
    getPlanDistribution(),
    getCurrentMonthUsage(),
    getSignupTrend(14),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin" className="text-sm text-zinc-500 hover:underline">
          ← Admin
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Distribuzione piani e utilizzo piattaforma
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="font-semibold text-zinc-900 dark:text-white">
            Distribuzione piani
          </h2>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Trial</span>
              <span className="font-medium">{planDist.trial}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">A pagamento</span>
              <span className="font-medium">{planDist.paid}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Free / Scaduto</span>
              <span className="font-medium">{planDist.free}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="font-semibold text-zinc-900 dark:text-white">
            Utilizzo {usage.month}
          </h2>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Org con dati</span>
              <span className="font-medium">{usage.totalOrgs}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Sedi totali</span>
              <span className="font-medium">{usage.totalLocations}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Dipendenti</span>
              <span className="font-medium">{usage.totalEmployees}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Gen. AI (mese)</span>
              <span className="font-medium">{usage.aiGenerations}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Report generati</span>
              <span className="font-medium">{usage.reportsGenerated}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="font-semibold text-zinc-900 dark:text-white">
            Iscrizioni (14 gg)
          </h2>
          <div className="mt-4 max-h-48 overflow-y-auto">
            {signupTrend.length === 0 ? (
              <p className="text-sm text-zinc-500">Nessun dato</p>
            ) : (
              <div className="space-y-1 text-sm">
                {signupTrend.map((s) => (
                  <div
                    key={s.date}
                    className="flex justify-between"
                  >
                    <span className="text-zinc-600 dark:text-zinc-400">{s.date}</span>
                    <span className="font-medium">{s.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
