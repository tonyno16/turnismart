"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  employees,
  employeeRoles,
  employeeAvailability,
  employeeIncompatibilities,
  employeeTimeOff,
  contractTypes,
  availabilityStatuses,
  timeOffTypes,
  type ContractType,
  type AvailabilityStatus,
  type TimeOffType,
} from "@/drizzle/schema";
import { requireOrganization } from "@/lib/auth";

export async function createEmployee(formData: FormData) {
  const { organization } = await requireOrganization();
  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  if (!firstName || !lastName) throw new Error("Nome e cognome obbligatori");

  const [emp] = await db
    .insert(employees)
    .values({
      organization_id: organization.id,
      first_name: firstName,
      last_name: lastName,
      email: (formData.get("email") as string)?.trim() || null,
      phone: (formData.get("phone") as string)?.trim() || null,
      weekly_hours: parseInt((formData.get("weeklyHours") as string) || "40", 10),
      contract_type: (() => {
        const v = (formData.get("contractType") as string) || "full_time";
        return (contractTypes as readonly string[]).includes(v)
          ? (v as ContractType)
          : "full_time";
      })(),
    })
    .returning();
  const roleId = formData.get("roleId") as string;
  if (emp && roleId) {
    await db.insert(employeeRoles).values({
      employee_id: emp.id,
      role_id: roleId,
      is_primary: true,
    });
  }
  revalidatePath("/employees");
  return emp;
}

export async function updateEmployee(employeeId: string, formData: FormData) {
  const { organization } = await requireOrganization();
  const [emp] = await db
    .select()
    .from(employees)
    .where(
      and(
        eq(employees.id, employeeId),
        eq(employees.organization_id, organization.id)
      )
    )
    .limit(1);
  if (!emp) throw new Error("Dipendente non trovato");

  await db
    .update(employees)
    .set({
      first_name: (formData.get("firstName") as string)?.trim() ?? emp.first_name,
      last_name: (formData.get("lastName") as string)?.trim() ?? emp.last_name,
      email: (formData.get("email") as string)?.trim() || null,
      phone: (formData.get("phone") as string)?.trim() || null,
      weekly_hours: parseInt((formData.get("weeklyHours") as string) || String(emp.weekly_hours), 10),
      contract_type: (() => {
        const v = (formData.get("contractType") as string) || emp.contract_type;
        return (contractTypes as readonly string[]).includes(v)
          ? (v as ContractType)
          : emp.contract_type;
      })(),
      preferred_location_id: (formData.get("preferredLocationId") as string) || null,
      notes: (formData.get("notes") as string)?.trim() || null,
      updated_at: new Date(),
    })
    .where(eq(employees.id, employeeId));
  revalidatePath("/employees");
  revalidatePath(`/employees/${employeeId}`);
}

export async function toggleEmployeeActive(employeeId: string) {
  const { organization } = await requireOrganization();
  const [emp] = await db
    .select()
    .from(employees)
    .where(
      and(
        eq(employees.id, employeeId),
        eq(employees.organization_id, organization.id)
      )
    )
    .limit(1);
  if (!emp) throw new Error("Dipendente non trovato");
  await db
    .update(employees)
    .set({
      is_active: !emp.is_active,
      updated_at: new Date(),
    })
    .where(eq(employees.id, employeeId));
  revalidatePath("/employees");
  revalidatePath(`/employees/${employeeId}`);
}

export async function updateEmployeeRoles(
  employeeId: string,
  roleIds: string[],
  primaryRoleId?: string
) {
  const { organization } = await requireOrganization();
  const [emp] = await db
    .select()
    .from(employees)
    .where(
      and(
        eq(employees.id, employeeId),
        eq(employees.organization_id, organization.id)
      )
    )
    .limit(1);
  if (!emp) throw new Error("Dipendente non trovato");

  await db.delete(employeeRoles).where(eq(employeeRoles.employee_id, employeeId));
  for (const roleId of roleIds) {
    if (!roleId) continue;
    await db.insert(employeeRoles).values({
      employee_id: employeeId,
      role_id: roleId,
      is_primary: roleId === primaryRoleId,
    });
  }
  revalidatePath(`/employees/${employeeId}`);
}

export async function updateAvailability(
  employeeId: string,
  updates: Array<{
    dayOfWeek: number;
    shiftPeriod: string;
    status: string;
  }>
) {
  const { organization } = await requireOrganization();
  const [emp] = await db
    .select()
    .from(employees)
    .where(
      and(
        eq(employees.id, employeeId),
        eq(employees.organization_id, organization.id)
      )
    )
    .limit(1);
  if (!emp) throw new Error("Dipendente non trovato");

  const SHIFT_PERIODS = ["morning", "afternoon", "evening"] as const;
  for (const u of updates) {
    const shiftPeriod = SHIFT_PERIODS.includes(
      u.shiftPeriod as (typeof SHIFT_PERIODS)[number]
    )
      ? (u.shiftPeriod as (typeof SHIFT_PERIODS)[number])
      : "morning";
    const status: AvailabilityStatus = (availabilityStatuses as readonly string[]).includes(
      u.status
    )
      ? (u.status as AvailabilityStatus)
      : "available";
    await db
      .insert(employeeAvailability)
      .values({
        employee_id: employeeId,
        day_of_week: u.dayOfWeek,
        shift_period: shiftPeriod,
        status,
      })
      .onConflictDoUpdate({
        target: [
          employeeAvailability.employee_id,
          employeeAvailability.day_of_week,
          employeeAvailability.shift_period,
        ],
        set: {
          status,
          updated_at: new Date(),
        },
      });
  }
  revalidatePath(`/employees/${employeeId}`);
}

export async function createIncompatibility(
  employeeAId: string,
  employeeBId: string,
  reason?: string
) {
  const { organization } = await requireOrganization();
  const [a, b] = [employeeAId, employeeBId].sort();
  if (a === b) throw new Error("Seleziona due dipendenti diversi");
  await db.insert(employeeIncompatibilities).values({
    organization_id: organization.id,
    employee_a_id: a,
    employee_b_id: b,
    reason: reason?.trim() || null,
  });
  revalidatePath(`/employees/${employeeAId}`);
  revalidatePath(`/employees/${employeeBId}`);
}

export async function removeIncompatibility(incompatibilityId: string) {
  await requireOrganization();
  await db
    .delete(employeeIncompatibilities)
    .where(eq(employeeIncompatibilities.id, incompatibilityId));
  revalidatePath("/employees");
}

export async function createTimeOff(
  employeeId: string,
  formData: FormData
) {
  const { organization } = await requireOrganization();
  const [emp] = await db
    .select()
    .from(employees)
    .where(
      and(
        eq(employees.id, employeeId),
        eq(employees.organization_id, organization.id)
      )
    )
    .limit(1);
  if (!emp) throw new Error("Dipendente non trovato");

  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  if (!startDate || !endDate) throw new Error("Date obbligatorie");

  const timeOffType: TimeOffType = (timeOffTypes as readonly string[]).includes(
    (formData.get("type") as string) || ""
  )
    ? ((formData.get("type") as string) as TimeOffType)
    : "vacation";

  await db.insert(employeeTimeOff).values({
    employee_id: employeeId,
    type: timeOffType,
    start_date: startDate,
    end_date: endDate,
    notes: (formData.get("notes") as string)?.trim() || null,
  });
  revalidatePath(`/employees/${employeeId}`);
}

export async function approveTimeOff(timeOffId: string) {
  const { user } = await requireOrganization();
  await db
    .update(employeeTimeOff)
    .set({
      status: "approved",
      approved_by_user_id: user.id,
    })
    .where(eq(employeeTimeOff.id, timeOffId));
  revalidatePath("/employees");
}

export async function rejectTimeOff(timeOffId: string) {
  await requireOrganization();
  await db
    .update(employeeTimeOff)
    .set({ status: "rejected" })
    .where(eq(employeeTimeOff.id, timeOffId));
  revalidatePath("/employees");
}
