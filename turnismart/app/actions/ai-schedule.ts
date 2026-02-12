"use server";

import { revalidatePath } from "next/cache";
import { requireOrganization } from "@/lib/auth";
import { getWeekSchedule } from "@/lib/schedules";
import {
  collectSchedulingConstraints,
  generateScheduleWithAI,
  saveGeneratedShifts,
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

    const generated = await generateScheduleWithAI(constraints, weekStart);

    if (mode === "fill_gaps") {
      const existingCount = 0;
      if (existingCount > 0) {
        return {
          ok: false,
          error:
            "Modalità 'Riempi gap' non ancora supportata. Usa 'Genera tutto'.",
        };
      }
    }

    const result = await saveGeneratedShifts(
      organization.id,
      schedule.id,
      weekStart,
      generated
    );

    revalidatePath("/schedule");
    revalidatePath("/dashboard");

    return {
      ok: true,
      saved: result.saved,
      skipped: result.skipped,
      errors: result.errors,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Errore durante la generazione",
    };
  }
}
