"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  shifts,
  schedules,
  locations,
  roles,
  employees,
} from "@/drizzle/schema";
import { requireOrganization } from "@/lib/auth";
import { findBestSubstitutes, type SubstituteSuggestion } from "@/lib/substitute-suggestions";
import {
  validateShiftAssignment,
  type ValidationConflict,
} from "@/lib/schedule-validation";
import { dispatchSickLeaveReplacementNotification } from "@/lib/notifications";

export async function getSubstituteSuggestions(
  shiftId: string
): Promise<
  | { ok: true; suggestions: SubstituteSuggestion[]; shift: { date: string; locationName: string; roleName: string; employeeName: string } }
  | { ok: false; error: string }
> {
  try {
    const { organization } = await requireOrganization();
    const [shift] = await db
      .select({
        id: shifts.id,
        schedule_id: shifts.schedule_id,
        location_id: shifts.location_id,
        employee_id: shifts.employee_id,
        role_id: shifts.role_id,
        date: shifts.date,
        start_time: shifts.start_time,
        end_time: shifts.end_time,
      })
      .from(shifts)
      .where(
        and(
          eq(shifts.id, shiftId),
          eq(shifts.organization_id, organization.id)
        )
      )
      .limit(1);

    if (!shift) return { ok: false, error: "Turno non trovato" };

    const [schedRow] = await db
      .select({ week_start_date: schedules.week_start_date })
      .from(schedules)
      .where(eq(schedules.id, shift.schedule_id))
      .limit(1);

    const weekStart = schedRow?.week_start_date ?? shift.date;

    const suggestions = await findBestSubstitutes({
      organizationId: organization.id,
      scheduleId: shift.schedule_id,
      locationId: shift.location_id,
      roleId: shift.role_id,
      date: shift.date,
      startTime: shift.start_time,
      endTime: shift.end_time,
      weekStart,
      excludeEmployeeId: shift.employee_id,
      limit: 5,
    });

    const [loc] = await db
      .select({ name: locations.name })
      .from(locations)
      .where(eq(locations.id, shift.location_id))
      .limit(1);
    const [role] = await db
      .select({ name: roles.name })
      .from(roles)
      .where(eq(roles.id, shift.role_id))
      .limit(1);
    const [emp] = await db
      .select({
        first_name: employees.first_name,
        last_name: employees.last_name,
      })
      .from(employees)
      .where(eq(employees.id, shift.employee_id))
      .limit(1);

    return {
      ok: true,
      suggestions,
      shift: {
        date: shift.date,
        locationName: loc?.name ?? "-",
        roleName: role?.name ?? "-",
        employeeName: emp ? `${emp.first_name} ${emp.last_name}` : "-",
      },
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Errore",
    };
  }
}

export type ReplaceResult =
  | { ok: true }
  | { ok: false; conflict: ValidationConflict };

export async function replaceShiftWithSubstitute(
  shiftId: string,
  newEmployeeId: string
): Promise<ReplaceResult> {
  try {
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
      .select({ week_start_date: schedules.week_start_date })
      .from(schedules)
      .where(eq(schedules.id, shift.schedule_id))
      .limit(1);
    const weekStart = sched?.week_start_date ?? shift.date;

    const conflict = await validateShiftAssignment({
      employeeId: newEmployeeId,
      organizationId: organization.id,
      scheduleId: shift.schedule_id,
      locationId: shift.location_id,
      roleId: shift.role_id,
      date: shift.date,
      startTime: shift.start_time,
      endTime: shift.end_time,
      weekStart,
      excludeShiftId: shiftId,
    });
    if (conflict) return { ok: false, conflict };

    await db
      .update(shifts)
      .set({
        employee_id: newEmployeeId,
        status: "active",
        updated_at: new Date(),
      })
      .where(eq(shifts.id, shiftId));

    const [loc] = await db
      .select({ name: locations.name })
      .from(locations)
      .where(eq(locations.id, shift.location_id))
      .limit(1);
    const [role] = await db
      .select({ name: roles.name })
      .from(roles)
      .where(eq(roles.id, shift.role_id))
      .limit(1);
    const [newEmp] = await db
      .select({
        first_name: employees.first_name,
        last_name: employees.last_name,
      })
      .from(employees)
      .where(eq(employees.id, newEmployeeId))
      .limit(1);

    dispatchSickLeaveReplacementNotification({
      organizationId: organization.id,
      employeeId: newEmployeeId,
      employeeName: newEmp ? `${newEmp.first_name} ${newEmp.last_name}` : "Dipendente",
      date: shift.date,
      startTime: shift.start_time,
      endTime: shift.end_time,
      locationName: loc?.name ?? "-",
      roleName: role?.name ?? "-",
    }).catch((e) => console.error("Sick leave notification error:", e));

    revalidatePath("/schedule");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      conflict: {
        type: "overlap",
        message: e instanceof Error ? e.message : "Errore",
      },
    };
  }
}
