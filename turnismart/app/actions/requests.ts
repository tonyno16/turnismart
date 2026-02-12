"use server";

import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  shiftRequests,
  employeeTimeOff,
  shifts,
  locations,
  roles,
  employees,
} from "@/drizzle/schema";
import { requireEmployee, requireOrganization } from "@/lib/auth";

/** Get employee's shift requests and time-off for My Requests page */
export async function getMyRequests() {
  const { employee } = await requireEmployee();

  const [requestsWithLocation, timeOffList] = await Promise.all([
    db
      .select({
        id: shiftRequests.id,
        type: shiftRequests.type,
        status: shiftRequests.status,
        shift_id: shiftRequests.shift_id,
        start_date: shiftRequests.start_date,
        end_date: shiftRequests.end_date,
        reason: shiftRequests.reason,
        created_at: shiftRequests.created_at,
        location_name: locations.name,
        shift_date: shifts.date,
        shift_start: shifts.start_time,
        shift_end: shifts.end_time,
        role_name: roles.name,
      })
      .from(shiftRequests)
      .leftJoin(shifts, eq(shiftRequests.shift_id, shifts.id))
      .leftJoin(locations, eq(shifts.location_id, locations.id))
      .leftJoin(roles, eq(shifts.role_id, roles.id))
      .where(eq(shiftRequests.employee_id, employee.id))
      .orderBy(desc(shiftRequests.created_at)),
    db
      .select()
      .from(employeeTimeOff)
      .where(eq(employeeTimeOff.employee_id, employee.id))
      .orderBy(desc(employeeTimeOff.created_at)),
  ]);

  return {
    shiftRequests: requestsWithLocation,
    timeOff: timeOffList,
  };
}

/** Employee: create shift swap request */
export async function createShiftSwapRequest(
  shiftId: string,
  swapWithEmployeeId: string,
  reason?: string
) {
  const { employee } = await requireEmployee();

  const [shift] = await db
    .select({ organization_id: shifts.organization_id })
    .from(shifts)
    .where(
      and(
        eq(shifts.id, shiftId),
        eq(shifts.employee_id, employee.id)
      )
    )
    .limit(1);
  if (!shift) throw new Error("Turno non trovato");

  const [existing] = await db
    .select()
    .from(shiftRequests)
    .where(
      and(
        eq(shiftRequests.shift_id, shiftId),
        eq(shiftRequests.employee_id, employee.id),
        eq(shiftRequests.status, "pending")
      )
    )
    .limit(1);
  if (existing) throw new Error("Richiesta già inviata per questo turno");

  await db.insert(shiftRequests).values({
    organization_id: shift.organization_id,
    employee_id: employee.id,
    type: "shift_swap",
    shift_id: shiftId,
    swap_with_employee_id: swapWithEmployeeId,
    reason: reason?.trim() || null,
  });

  revalidatePath("/my-requests");
  revalidatePath("/requests");
}

/** Manager: get all pending shift requests and time-off for approval */
export async function getPendingRequests() {
  const { user, organization } = await requireOrganization();
  if (user.role !== "owner" && user.role !== "manager") {
    throw new Error("Solo titolare o manager può approvare le richieste");
  }

  const [shiftReqs, timeOffList] = await Promise.all([
    db
      .select({
        id: shiftRequests.id,
        type: shiftRequests.type,
        status: shiftRequests.status,
        shift_id: shiftRequests.shift_id,
        start_date: shiftRequests.start_date,
        end_date: shiftRequests.end_date,
        reason: shiftRequests.reason,
        created_at: shiftRequests.created_at,
        employee_first: employees.first_name,
        employee_last: employees.last_name,
        location_name: locations.name,
        shift_date: shifts.date,
        shift_start: shifts.start_time,
        shift_end: shifts.end_time,
      })
      .from(shiftRequests)
      .innerJoin(employees, eq(shiftRequests.employee_id, employees.id))
      .leftJoin(shifts, eq(shiftRequests.shift_id, shifts.id))
      .leftJoin(locations, eq(shifts.location_id, locations.id))
      .where(
        and(
          eq(shiftRequests.organization_id, organization.id),
          eq(shiftRequests.status, "pending")
        )
      )
      .orderBy(desc(shiftRequests.created_at)),
    db
      .select({
        id: employeeTimeOff.id,
        type: employeeTimeOff.type,
        start_date: employeeTimeOff.start_date,
        end_date: employeeTimeOff.end_date,
        notes: employeeTimeOff.notes,
        created_at: employeeTimeOff.created_at,
        employee_first: employees.first_name,
        employee_last: employees.last_name,
      })
      .from(employeeTimeOff)
      .innerJoin(employees, eq(employeeTimeOff.employee_id, employees.id))
      .where(
        and(
          eq(employees.organization_id, organization.id),
          eq(employeeTimeOff.status, "pending")
        )
      )
      .orderBy(desc(employeeTimeOff.created_at)),
  ]);

  return {
    shiftRequests: shiftReqs,
    timeOff: timeOffList,
  };
}

/** Manager: approve shift request */
export async function approveShiftRequest(requestId: string, notes?: string) {
  const { user, organization } = await requireOrganization();
  if (user.role !== "owner" && user.role !== "manager") {
    throw new Error("Non autorizzato");
  }

  await db
    .update(shiftRequests)
    .set({
      status: "approved",
      reviewed_by_user_id: user.id,
      reviewed_at: new Date(),
      review_notes: notes?.trim() || null,
    })
    .where(
      and(
        eq(shiftRequests.id, requestId),
        eq(shiftRequests.organization_id, organization.id)
      )
    );

  revalidatePath("/requests");
  revalidatePath("/my-requests");
}

/** Manager: reject shift request */
export async function rejectShiftRequest(requestId: string, notes?: string) {
  const { user, organization } = await requireOrganization();
  if (user.role !== "owner" && user.role !== "manager") {
    throw new Error("Non autorizzato");
  }

  await db
    .update(shiftRequests)
    .set({
      status: "rejected",
      reviewed_by_user_id: user.id,
      reviewed_at: new Date(),
      review_notes: notes?.trim() || null,
    })
    .where(
      and(
        eq(shiftRequests.id, requestId),
        eq(shiftRequests.organization_id, organization.id)
      )
    );

  revalidatePath("/requests");
  revalidatePath("/my-requests");
}
