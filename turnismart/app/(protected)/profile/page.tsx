import Link from "next/link";
import { requireOrganization } from "@/lib/auth";
import { getOrCreateMonthlyUsage, hasUnlimitedAi } from "@/lib/usage";
import { getOrganizationPlan } from "@/lib/stripe";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { ProfileStripeButton } from "./profile-client";

const PLAN_LABELS: Record<string, string> = {
  trial: "Prova gratuita",
  starter: "Starter",
  pro: "Pro",
  business: "Business",
};

function QuotaBar({ used, limit, label }: { used: number; limit: number; label: string }) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const isOver = used >= limit && limit < 999;
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
        <span className={isOver ? "text-red-600 dark:text-red-400" : "text-zinc-700 dark:text-zinc-300"}>
          {used} / {limit >= 999 ? "∞" : limit}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className={`h-full rounded-full transition-all ${
            isOver ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-[hsl(var(--primary))]"
          }`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}

export default async function ProfilePage() {
  const { user, organization } = await requireOrganization();
  const [usage, planInfo] = await Promise.all([
    getOrCreateMonthlyUsage(organization.id),
    getOrganizationPlan(organization.id),
  ]);

  const baseAiLimit = planInfo.plan === "trial" ? 10 : planInfo.plan === "starter" ? 5 : planInfo.plan === "pro" ? 20 : 50;
  const limits = {
    locations: planInfo.plan === "trial" ? 3 : planInfo.plan === "starter" ? 2 : planInfo.plan === "pro" ? 5 : 20,
    employees: planInfo.plan === "trial" ? 15 : planInfo.plan === "starter" ? 10 : planInfo.plan === "pro" ? 25 : 100,
    aiGenerations: hasUnlimitedAi(organization.id) ? 999999 : baseAiLimit,
    reports: planInfo.plan === "trial" ? 5 : planInfo.plan === "starter" ? 3 : planInfo.plan === "pro" ? 10 : 999,
  };

  const canManageBilling = user.role === "owner";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Profilo</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Informazioni account, abbonamento e utilizzo.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Account</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-zinc-500 dark:text-zinc-400">Organizzazione</dt>
              <dd className="font-medium text-zinc-900 dark:text-white">{organization.name}</dd>
            </div>
            <div>
              <dt className="text-zinc-500 dark:text-zinc-400">La tua email</dt>
              <dd className="font-medium text-zinc-900 dark:text-white">{user.email}</dd>
            </div>
            <div>
              <dt className="text-zinc-500 dark:text-zinc-400">Ruolo</dt>
              <dd className="font-medium text-zinc-900 dark:text-white">
                {user.role === "owner" ? "Titolare" : user.role === "manager" ? "Manager" : user.role === "employee" ? "Dipendente" : user.role === "accountant" ? "Commercialista" : "Admin"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Subscription */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Abbonamento</h2>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-medium text-zinc-900 dark:text-white">
                {PLAN_LABELS[planInfo.plan] ?? planInfo.plan}
              </p>
              {planInfo.isTrial && planInfo.trialEndsAt && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Prova fino al {format(planInfo.trialEndsAt, "d MMMM yyyy", { locale: it })}
                </p>
              )}
            </div>
            {canManageBilling && organization.stripe_customer_id && (
              <ProfileStripeButton />
            )}
          </div>
          {canManageBilling && !organization.stripe_customer_id && (
            <p className="mt-2 text-sm text-zinc-500">
              Nessun abbonamento attivo. Sei in periodo di prova.
            </p>
          )}
        </div>
      </div>

      {/* Usage */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Utilizzo {usage.month}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Limiti del piano {PLAN_LABELS[planInfo.plan] ?? planInfo.plan}
        </p>
        <div className="mt-4 space-y-4">
          {process.env.NODE_ENV === "development" && (
            <p className=" rounded bg-amber-100 px-2 py-1 text-xs text-amber-800 dark:bg-zinc-700 dark:text-amber-200">
              Org ID: {organization.id} | Unlimited: {hasUnlimitedAi(organization.id) ? "✅ sì" : "❌ no"}
            </p>
          )}
          <QuotaBar used={usage.locations_count} limit={limits.locations} label="Sedi" />
          <QuotaBar used={usage.employees_count} limit={limits.employees} label="Dipendenti" />
          <QuotaBar used={usage.ai_generations_count} limit={limits.aiGenerations} label="Generazioni AI (mese)" />
          <QuotaBar used={usage.reports_generated_count} limit={limits.reports} label="Report (mese)" />
        </div>
      </div>

      <div>
        <Link
          href="/settings"
          className="text-sm font-medium text-[hsl(var(--primary))] hover:underline"
        >
          → Impostazioni organizzazione (regole lavoro, notifiche)
        </Link>
      </div>
    </div>
  );
}
