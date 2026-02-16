"use server";

import { revalidatePath } from "next/cache";
import { requireOrganization } from "@/lib/auth";
import { getWeekSchedule, getExistingShiftsForWeek, getPeriodTimesForOrganization } from "@/lib/schedules";
import { checkQuota, incrementUsage } from "@/lib/usage";
import {
  collectSchedulingConstraints,
  generateScheduleWithAI,
  saveGeneratedShifts,
  fillUncoveredSlots,
  existingShiftsToFixed,
} from "@/lib/ai-schedule";
import { generateScheduleWithORTools, type OrtoolsResult } from "@/lib/schedule-ortools";

export type GenerateResult =
  | { ok: true; saved: number; skipped: number; errors: string[]; method?: "ortools" | "ai" }
  | { ok: false; error: string };

const USE_ORTOOLS = process.env.USE_ORTOOLS !== "false";

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

    const periodTimes = await getPeriodTimesForOrganization(organization.id);
    const fixedAssignments =
      mode === "fill_gaps"
        ? existingShiftsToFixed(
            await getExistingShiftsForWeek(schedule.id, weekStart),
            weekStart
          )
        : [];

    let generated: { employeeId: string; locationId: string; roleId: string; dayOfWeek: number; period: string }[] = [];
    let method: "ortools" | "ai" = "ai";

    if (USE_ORTOOLS) {
      const ortoolsResult: OrtoolsResult = await generateScheduleWithORTools({
        constraints,
        weekStart,
        periodTimes,
        fixedAssignments,
      });

      if (ortoolsResult.status === "optimal" || ortoolsResult.status === "feasible") {
        generated = ortoolsResult.shifts;
        method = "ortools";
      } else if (ortoolsResult.status === "infeasible") {
        return { ok: false, error: ortoolsResult.infeasibleReason };
      }
      /* status === "error": fallback silenzioso ad AI (solver non raggiungibile, timeout, ecc.) */
    }

    if (generated.length === 0) {
      generated = await generateScheduleWithAI(organization.id, constraints, weekStart);
    }

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
      method,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Errore durante la generazione",
    };
  }
}
