"use server";

import { revalidatePath } from "next/cache";
import { requireOrganization } from "@/lib/auth";
import { getWeekSchedule } from "@/lib/schedules";
import { checkQuota, incrementUsage } from "@/lib/usage";
import {
  collectSchedulingConstraints,
  generateScheduleWithAI,
  saveGeneratedShifts,
  fillUncoveredSlots,
} from "@/lib/ai-schedule";

export type GenerateResult =
  | { ok: true; saved: number; skipped: number; errors: string[] }
  | { ok: false; error: string };

export async function generateScheduleWithAIAction(
  weekStart: string,
  mode: "full" | "fill_gaps" = "full",
  locationIds?: string[]
): Promise<GenerateResult> {
  try {
    const { organization } = await requireOrganization();
    const quota = await checkQuota(organization.id, "ai_generations");
    if (!quota.allowed) return { ok: false, error: quota.message ?? "Limite generazioni AI mensili raggiunto" };
    const { schedule } = await getWeekSchedule(organization.id, weekStart);

    const constraints = await collectSchedulingConstraints(
      organization.id,
      weekStart,
      locationIds
    );

    if (constraints.employees.length === 0) {
      return { ok: false, error: "Nessun dipendente attivo" };
    }
    if (constraints.locations.every((l) => l.requirements.length === 0)) {
      return { ok: false, error: "Nessun fabbisogno configurato per le sedi" };
    }

    const nameToId = new Map(
      constraints.employees.map((e) => [e.name.toLowerCase().trim(), e.id])
    );
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    let generated = await generateScheduleWithAI(organization.id, constraints, weekStart);
    generated = generated.map((s) => {
      if (!uuidRegex.test(s.employeeId)) {
        const resolved = nameToId.get(String(s.employeeId).toLowerCase().trim());
        if (resolved) return { ...s, employeeId: resolved };
      }
      return s;
    });

    const result = await saveGeneratedShifts(
      organization.id,
      schedule.id,
      weekStart,
      generated
    );

    const filler = await fillUncoveredSlots(
      organization.id,
      schedule.id,
      weekStart
    );

    await incrementUsage(organization.id, "ai_generations_count");

    revalidatePath("/schedule");
    revalidatePath("/dashboard");

    const allErrors = [...result.errors, ...filler.errors];
    return {
      ok: true,
      saved: result.saved + filler.filled,
      skipped: result.skipped,
      errors: allErrors,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Errore durante la generazione",
    };
  }
}
