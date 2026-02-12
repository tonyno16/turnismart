"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
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
