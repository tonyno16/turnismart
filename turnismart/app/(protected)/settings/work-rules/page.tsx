import { requireOrganization } from "@/lib/auth";
import { db } from "@/lib/db";
import { organizationSettings } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { WorkRulesForm } from "./work-rules-form";

const DEFAULTS = {
  min_rest_between_shifts_hours: 11,
  max_consecutive_days: 6,
  overtime_threshold_hours: 40,
  shift_times: {
    morning: { start: "08:00", end: "14:00" },
    evening: { start: "14:00", end: "23:00" },
  },
};

export default async function WorkRulesPage() {
  const { organization } = await requireOrganization();
  const [settings] = await db
    .select()
    .from(organizationSettings)
    .where(eq(organizationSettings.organization_id, organization.id))
    .limit(1);

  const workRules = (settings?.work_rules as Record<string, unknown>) ?? {};
  const st = workRules.shift_times as { morning?: { start?: string; end?: string }; evening?: { start?: string; end?: string } } | undefined;
  const values = {
    min_rest_between_shifts_hours:
      (workRules.min_rest_between_shifts_hours as number) ?? DEFAULTS.min_rest_between_shifts_hours,
    max_consecutive_days: (workRules.max_consecutive_days as number) ?? DEFAULTS.max_consecutive_days,
    overtime_threshold_hours:
      (workRules.overtime_threshold_hours as number) ?? DEFAULTS.overtime_threshold_hours,
    shift_times: {
      morning: {
        start: st?.morning?.start ?? DEFAULTS.shift_times.morning.start,
        end: st?.morning?.end ?? DEFAULTS.shift_times.morning.end,
      },
      evening: {
        start: st?.evening?.start ?? DEFAULTS.shift_times.evening.start,
        end: st?.evening?.end ?? DEFAULTS.shift_times.evening.end,
      },
    },
  };

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/settings"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400"
        >
          ← Impostazioni
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
          Regole di lavoro
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Vincoli usati dalla validazione e dall&apos;AI per generare gli orari.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <WorkRulesForm initialValues={values} />
      </div>
    </div>
  );
}
