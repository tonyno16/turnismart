"use server";

import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { format, addDays, parseISO } from "date-fns";
import { db } from "@/lib/db";
import {
  scheduleTemplates,
  schedules,
  shifts,
  staffingRequirements,
  locations,
  employees,
} from "@/drizzle/schema";
import { requireOrganization } from "@/lib/auth";
import type { ScheduleTemplateWeekData } from "@/drizzle/schema";

export async function createScheduleTemplate(
  name: string,
  scheduleId: string
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const { organization } = await requireOrganization();

  const [sched] = await db
    .select()
    .from(schedules)
    .where(
      and(
        eq(schedules.id, scheduleId),
        eq(schedules.organization_id, organization.id)
      )
    )
    .limit(1);

  if (!sched) {
    return { ok: false, error: "Programmazione non trovata" };
  }

  const shiftRows = await db
    .select({
      location_id: shifts.location_id,
      role_id: shifts.role_id,
      employee_id: shifts.employee_id,
      date: shifts.date,
      start_time: shifts.start_time,
      end_time: shifts.end_time,
    })
    .from(shifts)
    .where(
      and(
        eq(shifts.schedule_id, scheduleId),
        eq(shifts.status, "active")
      )
    );

  const locationIds = [...new Set(shiftRows.map((s) => s.location_id))];
  const staffingRows =
    locationIds.length > 0
      ? await db
          .select({
            location_id: staffingRequirements.location_id,
            role_id: staffingRequirements.role_id,
            day_of_week: staffingRequirements.day_of_week,
            shift_period: staffingRequirements.shift_period,
            required_count: staffingRequirements.required_count,
          })
          .from(staffingRequirements)
          .where(inArray(staffingRequirements.location_id, locationIds))
      : [];


  const templateShifts = shiftRows.map((s) => {
    const d = parseISO(s.date);
    const dayOfWeek = (d.getDay() + 6) % 7;
    return {
      location_id: s.location_id,
      role_id: s.role_id,
      employee_id: s.employee_id,
      day_of_week: dayOfWeek,
      start_time: s.start_time,
      end_time: s.end_time,
    };
  });

  const templateStaffing = staffingRows.map((s) => ({
    location_id: s.location_id,
    role_id: s.role_id,
    day_of_week: s.day_of_week,
    shift_period: s.shift_period,
    required_count: s.required_count,
  }));

  const weekData: ScheduleTemplateWeekData = {
    staffing: templateStaffing,
    shifts: templateShifts,
  };

  const [inserted] = await db
    .insert(scheduleTemplates)
    .values({
      organization_id: organization.id,
      name: name.trim() || "Settimana tipo",
      week_data: weekData,
    })
    .returning({ id: scheduleTemplates.id });

  if (!inserted) {
    return { ok: false, error: "Errore nel salvataggio" };
  }

  revalidatePath("/schedule");
  return { ok: true, id: inserted.id };
}

export async function listScheduleTemplates(): Promise<
  Array<{ id: string; name: string }>
> {
  const { organization } = await requireOrganization();

  return db
    .select({ id: scheduleTemplates.id, name: scheduleTemplates.name })
    .from(scheduleTemplates)
    .where(eq(scheduleTemplates.organization_id, organization.id))
    .orderBy(scheduleTemplates.name);
}

export async function applyScheduleTemplate(
  templateId: string,
  targetWeekStart: string
): Promise<{
  ok: true;
  scheduleId: string;
  staffingCount: number;
  shiftsCount: number;
} | { ok: false; error: string }> {
  const { organization } = await requireOrganization();

  const [tpl] = await db
    .select()
    .from(scheduleTemplates)
    .where(
      and(
        eq(scheduleTemplates.id, templateId),
        eq(scheduleTemplates.organization_id, organization.id)
      )
    )
    .limit(1);

  if (!tpl) {
    return { ok: false, error: "Template non trovato" };
  }

  const weekData = tpl.week_data as ScheduleTemplateWeekData;

  const validLocationIds = new Set(
    (
      await db
        .select({ id: locations.id })
        .from(locations)
        .where(eq(locations.organization_id, organization.id))
    ).map((l) => l.id)
  );

  const empRows = await db
    .select({ id: employees.id })
    .from(employees)
    .where(eq(employees.organization_id, organization.id));
  const validEmpIds = new Set(empRows.map((e) => e.id));

  const weekStart = parseISO(targetWeekStart);

  try {
    const result = await db.transaction(async (tx) => {
      const [existing] = await tx
        .select({ id: schedules.id })
        .from(schedules)
        .where(
          and(
            eq(schedules.organization_id, organization.id),
            eq(schedules.week_start_date, targetWeekStart)
          )
        )
        .limit(1);

      if (existing) {
        await tx.delete(shifts).where(eq(shifts.schedule_id, existing.id));
        await tx.delete(schedules).where(eq(schedules.id, existing.id));
      }

      for (const s of weekData.staffing) {
        if (validLocationIds.has(s.location_id)) {
          await tx
            .insert(staffingRequirements)
            .values({
              location_id: s.location_id,
              role_id: s.role_id,
              day_of_week: s.day_of_week,
              shift_period: s.shift_period as "morning" | "evening",
              required_count: s.required_count,
            })
            .onConflictDoUpdate({
              target: [
                staffingRequirements.location_id,
                staffingRequirements.role_id,
                staffingRequirements.day_of_week,
                staffingRequirements.shift_period,
              ],
              set: {
                required_count: s.required_count,
                updated_at: new Date(),
              },
            });
        }
      }

      const [sched] = await tx
        .insert(schedules)
        .values({
          organization_id: organization.id,
          week_start_date: targetWeekStart,
          status: "draft",
        })
        .returning();

      if (!sched) {
        throw new Error("Errore nella creazione della programmazione");
      }

      let shiftsCount = 0;
      for (const sh of weekData.shifts) {
        if (
          !validLocationIds.has(sh.location_id) ||
          !validEmpIds.has(sh.employee_id)
        ) {
          continue;
        }

        const shiftDate = format(addDays(weekStart, sh.day_of_week), "yyyy-MM-dd");

        await tx.insert(shifts).values({
          schedule_id: sched.id,
          organization_id: organization.id,
          location_id: sh.location_id,
          role_id: sh.role_id,
          employee_id: sh.employee_id,
          date: shiftDate,
          start_time: sh.start_time,
          end_time: sh.end_time,
          break_minutes: 0,
          status: "active",
        });
        shiftsCount++;
      }

      return {
        scheduleId: sched.id,
        staffingCount: weekData.staffing.filter((s) =>
          validLocationIds.has(s.location_id)
        ).length,
        shiftsCount,
      };
    });

    revalidatePath("/schedule");
    revalidatePath("/locations");

    return {
      ok: true,
      scheduleId: result.scheduleId,
      staffingCount: result.staffingCount,
      shiftsCount: result.shiftsCount,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Errore nell'applicazione del template",
    };
  }
}

export async function deleteScheduleTemplate(
  templateId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { organization } = await requireOrganization();

  const [tpl] = await db
    .select()
    .from(scheduleTemplates)
    .where(
      and(
        eq(scheduleTemplates.id, templateId),
        eq(scheduleTemplates.organization_id, organization.id)
      )
    )
    .limit(1);

  if (!tpl) {
    return { ok: false, error: "Template non trovato" };
  }

  await db.delete(scheduleTemplates).where(eq(scheduleTemplates.id, templateId));
  revalidatePath("/schedule");
  return { ok: true };
}
