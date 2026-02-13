"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { addDays, subDays, format, parseISO } from "date-fns";
import { db } from "@/lib/db";
import {
  schedules,
  shifts,
  employees,
  employeeRoles,
  locations,
  roles,
} from "@/drizzle/schema";
import { requireOrganization } from "@/lib/auth";
import { getWeekSchedule, getWeekStart, PERIOD_TIMES } from "@/lib/schedules";
import { dispatchSchedulePublishedNotifications } from "@/lib/notifications";
import {
  validateShiftAssignment,
  type ValidationConflict,
} from "@/lib/schedule-validation";

export type ReplicateWeekResult = {
  replicated: number;
  skipped: number;
  total: number;
};

export type CreateShiftResult =
  | { ok: true }
  | { ok: false; conflict: ValidationConflict };

export async function createShift(
  scheduleId: string,
  locationId: string,
  roleId: string,
  date: string,
  shiftPeriod: string,
  employeeId: string,
  force = false
): Promise<CreateShiftResult> {
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
  if (!sched) throw new Error("Programmazione non trovata");

  const times = PERIOD_TIMES[shiftPeriod] ?? PERIOD_TIMES.morning;
  const startTime = times.start;
  const endTime = times.end;
  const weekStart = sched.week_start_date;

  if (!force) {
    const conflict = await validateShiftAssignment({
      employeeId,
      organizationId: organization.id,
      scheduleId,
      locationId,
      roleId,
      date,
      startTime,
      endTime,
      weekStart,
    });
    if (conflict) return { ok: false, conflict };
  }

  await db.insert(shifts).values({
    schedule_id: scheduleId,
    organization_id: organization.id,
    location_id: locationId,
    employee_id: employeeId,
    role_id: roleId,
    date,
    start_time: startTime,
    end_time: endTime,
    break_minutes: 0,
    is_auto_generated: false,
    status: "active",
  });
  revalidatePath("/schedule");
  return { ok: true };
}

export async function updateShift(
  shiftId: string,
  formData: FormData,
  force = false
) {
  const { organization } = await requireOrganization();
  const [shift] = await db
    .select()
    .from(shifts)
    .where(
      and(
        eq(shifts.id, shiftId),
        eq(shifts.organization_id, organization.id)
      )
    )
    .limit(1);
  if (!shift) throw new Error("Turno non trovato");

  const [sched] = await db
    .select()
    .from(schedules)
    .where(eq(schedules.id, shift.schedule_id))
    .limit(1);
  const weekStart = sched?.week_start_date ?? getWeekStart(shift.date);

  const employeeId = (formData.get("employeeId") as string) ?? shift.employee_id;
  const startTime = (formData.get("startTime") as string) ?? shift.start_time;
  const endTime = (formData.get("endTime") as string) ?? shift.end_time;

  if (!force) {
    const conflict = await validateShiftAssignment({
      employeeId,
      organizationId: organization.id,
      scheduleId: shift.schedule_id,
      locationId: shift.location_id,
      roleId: shift.role_id,
      date: shift.date,
      startTime,
      endTime,
      weekStart,
      excludeShiftId: shiftId,
    });
    if (conflict) return { ok: false, conflict };
  }

  await db
    .update(shifts)
    .set({
      employee_id: employeeId,
      start_time: startTime,
      end_time: endTime,
      updated_at: new Date(),
    })
    .where(eq(shifts.id, shiftId));
  revalidatePath("/schedule");
  return { ok: true };
}

export async function updateShiftNotes(
  shiftId: string,
  notes: string | null
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { organization } = await requireOrganization();
  const [shift] = await db
    .select()
    .from(shifts)
    .where(
      and(
        eq(shifts.id, shiftId),
        eq(shifts.organization_id, organization.id)
      )
    )
    .limit(1);
  if (!shift) return { ok: false, error: "Turno non trovato" };

  await db
    .update(shifts)
    .set({
      notes: notes?.trim() || null,
      updated_at: new Date(),
    })
    .where(eq(shifts.id, shiftId));
  revalidatePath("/schedule");
  return { ok: true };
}

export async function duplicateShift(
  shiftId: string,
  targetDate: string
): Promise<{ ok: true } | { ok: false; error: string; conflict?: ValidationConflict }> {
  const { organization } = await requireOrganization();
  const [shift] = await db
    .select()
    .from(shifts)
    .where(
      and(
        eq(shifts.id, shiftId),
        eq(shifts.organization_id, organization.id),
        eq(shifts.status, "active")
      )
    )
    .limit(1);
  if (!shift) return { ok: false, error: "Turno non trovato" };

  const [sched] = await db
    .select()
    .from(schedules)
    .where(eq(schedules.id, shift.schedule_id))
    .limit(1);
  if (!sched) return { ok: false, error: "Programmazione non trovata" };

  const conflict = await validateShiftAssignment({
    employeeId: shift.employee_id,
    organizationId: organization.id,
    scheduleId: shift.schedule_id,
    locationId: shift.location_id,
    roleId: shift.role_id,
    date: targetDate,
    startTime: shift.start_time,
    endTime: shift.end_time,
    weekStart: sched.week_start_date,
  });
  if (conflict) return { ok: false, error: conflict.message, conflict };

  await db.insert(shifts).values({
    schedule_id: shift.schedule_id,
    organization_id: organization.id,
    location_id: shift.location_id,
    employee_id: shift.employee_id,
    role_id: shift.role_id,
    date: targetDate,
    start_time: shift.start_time,
    end_time: shift.end_time,
    break_minutes: shift.break_minutes,
    is_auto_generated: false,
    status: "active",
    notes: shift.notes,
  });
  revalidatePath("/schedule");
  return { ok: true };
}

export async function deleteShift(shiftId: string) {
  const { organization } = await requireOrganization();
  const [shift] = await db
    .select()
    .from(shifts)
    .where(
      and(
        eq(shifts.id, shiftId),
        eq(shifts.organization_id, organization.id)
      )
    )
    .limit(1);
  if (!shift) throw new Error("Turno non trovato");

  await db.delete(shifts).where(eq(shifts.id, shiftId));
  revalidatePath("/schedule");
}

export async function cancelShift(shiftId: string, reason?: string) {
  const { organization } = await requireOrganization();
  const [shift] = await db
    .select()
    .from(shifts)
    .where(
      and(
        eq(shifts.id, shiftId),
        eq(shifts.organization_id, organization.id)
      )
    )
    .limit(1);
  if (!shift) throw new Error("Turno non trovato");

  await db
    .update(shifts)
    .set({
      status: "cancelled",
      cancelled_reason: reason ?? null,
      updated_at: new Date(),
    })
    .where(eq(shifts.id, shiftId));
  revalidatePath("/schedule");
}

export async function markSickLeave(shiftId: string) {
  const { organization } = await requireOrganization();
  const [shift] = await db
    .select()
    .from(shifts)
    .where(
      and(
        eq(shifts.id, shiftId),
        eq(shifts.organization_id, organization.id)
      )
    )
    .limit(1);
  if (!shift) throw new Error("Turno non trovato");

  await db
    .update(shifts)
    .set({ status: "sick_leave", updated_at: new Date() })
    .where(eq(shifts.id, shiftId));
  revalidatePath("/schedule");
}

export async function replicatePreviousWeek(
  scheduleId: string,
  targetWeekStart: string
): Promise<ReplicateWeekResult> {
  const { organization } = await requireOrganization();
  const [targetSched] = await db
    .select()
    .from(schedules)
    .where(
      and(
        eq(schedules.id, scheduleId),
        eq(schedules.organization_id, organization.id)
      )
    )
    .limit(1);
  if (!targetSched) throw new Error("Programmazione non trovata");

  const prevWeekStart = format(
    subDays(parseISO(targetWeekStart), 7),
    "yyyy-MM-dd"
  );
  const [prevSched] = await db
    .select()
    .from(schedules)
    .where(
      and(
        eq(schedules.organization_id, organization.id),
        eq(schedules.week_start_date, prevWeekStart)
      )
    )
    .limit(1);
  if (!prevSched) throw new Error("Nessuna settimana precedente trovata");

  const prevShifts = await db
    .select()
    .from(shifts)
    .where(
      and(
        eq(shifts.schedule_id, prevSched.id),
        eq(shifts.status, "active")
      )
    );

  const activeEmployeeIds = new Set(
    (
      await db
        .select({ id: employees.id })
        .from(employees)
        .where(
          and(
            eq(employees.organization_id, organization.id),
            eq(employees.is_active, true)
          )
        )
    ).map((e) => e.id)
  );

  let replicated = 0;
  let skipped = 0;

  const targetStart = parseISO(targetWeekStart);
  for (const s of prevShifts) {
    if (!activeEmployeeIds.has(s.employee_id)) {
      skipped++;
      continue;
    }
    const dayOffset =
      (parseISO(s.date).getTime() - parseISO(prevWeekStart).getTime()) /
      (24 * 60 * 60 * 1000);
    const newDate = format(addDays(targetStart, dayOffset), "yyyy-MM-dd");

    const conflict = await validateShiftAssignment({
      employeeId: s.employee_id,
      organizationId: organization.id,
      scheduleId,
      locationId: s.location_id,
      roleId: s.role_id,
      date: newDate,
      startTime: s.start_time,
      endTime: s.end_time,
      weekStart: targetWeekStart,
    });
    if (conflict) {
      skipped++;
      continue;
    }

    await db.insert(shifts).values({
      schedule_id: scheduleId,
      organization_id: organization.id,
      location_id: s.location_id,
      employee_id: s.employee_id,
      role_id: s.role_id,
      date: newDate,
      start_time: s.start_time,
      end_time: s.end_time,
      break_minutes: s.break_minutes,
      is_auto_generated: false,
      status: "active",
    });
    replicated++;
  }

  revalidatePath("/schedule");
  return { replicated, skipped, total: prevShifts.length };
}

export async function publishSchedule(scheduleId: string) {
  const { user, organization } = await requireOrganization();
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
  if (!sched) throw new Error("Programmazione non trovata");

  const newStatus =
    sched.status === "published" ? "modified_after_publish" : "published";

  await db
    .update(schedules)
    .set({
      status: newStatus,
      published_at: new Date(),
      published_by_user_id: user.id,
      updated_at: new Date(),
    })
    .where(eq(schedules.id, scheduleId));

  dispatchSchedulePublishedNotifications({
    organizationId: organization.id,
    scheduleId,
    weekStart: sched.week_start_date,
  }).catch((e) => console.error("Notification dispatch error:", e));

  revalidatePath("/schedule");
  revalidatePath("/dashboard");
}
