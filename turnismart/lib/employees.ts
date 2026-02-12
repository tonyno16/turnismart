import { eq, and, or, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  employees,
  employeeRoles,
  roles,
  employeeAvailability,
  employeeIncompatibilities,
  employeeTimeOff,
} from "@/drizzle/schema";

export type EmployeeFilters = {
  search?: string;
  isActive?: boolean;
  roleId?: string;
};

export async function getEmployeesByOrganization(
  organizationId: string,
  filters?: EmployeeFilters
) {
  const list = await db
    .select()
    .from(employees)
    .where(
      filters?.isActive !== undefined
        ? and(
            eq(employees.organization_id, organizationId),
            eq(employees.is_active, filters.isActive)
          )
        : eq(employees.organization_id, organizationId)
    )
    .orderBy(employees.last_name, employees.first_name);

  let filtered = list;
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.first_name.toLowerCase().includes(s) ||
        e.last_name.toLowerCase().includes(s) ||
        (e.email?.toLowerCase().includes(s) ?? false) ||
        (e.phone?.includes(filters.search ?? "") ?? false)
    );
  }
  if (filters?.roleId) {
    const withRole = await db
      .select({ employee_id: employeeRoles.employee_id })
      .from(employeeRoles)
      .where(eq(employeeRoles.role_id, filters.roleId));
    const ids = new Set(withRole.map((r) => r.employee_id));
    filtered = filtered.filter((e) => ids.has(e.id));
  }

  return filtered;
}

export async function getEmployeeDetail(employeeId: string) {
  const [emp] = await db
    .select()
    .from(employees)
    .where(eq(employees.id, employeeId))
    .limit(1);
  if (!emp) return null;

  const empRoles = await db
    .select({
      id: employeeRoles.id,
      role_id: roles.id,
      role_name: roles.name,
      is_primary: employeeRoles.is_primary,
    })
    .from(employeeRoles)
    .innerJoin(roles, eq(employeeRoles.role_id, roles.id))
    .where(eq(employeeRoles.employee_id, employeeId));

  const availability = await db
    .select()
    .from(employeeAvailability)
    .where(eq(employeeAvailability.employee_id, employeeId));

  const timeOff = await db
    .select()
    .from(employeeTimeOff)
    .where(eq(employeeTimeOff.employee_id, employeeId))
    .orderBy(employeeTimeOff.start_date);

  const incompatibilitiesRows = await db
    .select()
    .from(employeeIncompatibilities)
    .where(
      or(
        eq(employeeIncompatibilities.employee_a_id, employeeId),
        eq(employeeIncompatibilities.employee_b_id, employeeId)
      )
    );

  const otherIds = incompatibilitiesRows.map((r) =>
    r.employee_a_id === employeeId ? r.employee_b_id : r.employee_a_id
  );
  const otherEmployees =
    otherIds.length > 0
      ? await db
          .select({
            id: employees.id,
            first_name: employees.first_name,
            last_name: employees.last_name,
          })
          .from(employees)
          .where(inArray(employees.id, otherIds))
      : [];
  const otherMap = Object.fromEntries(
    otherEmployees.map((e) => [e.id, `${e.first_name} ${e.last_name}`])
  );

  const incompatibilities = incompatibilitiesRows.map((r) => ({
    ...r,
    other_employee_name:
      otherMap[r.employee_a_id === employeeId ? r.employee_b_id : r.employee_a_id],
  }));

  return {
    ...emp,
    roles: empRoles,
    availability,
    timeOff,
    incompatibilities,
  };
}

/** Returns employee's contract weekly hours. Phase 5 scheduler will extend to sum scheduled hours per week. */
export async function getEmployeeWeeklyHours(
  employeeId: string,
  _weekStart?: string
): Promise<{ weekly: number; max: number } | null> {
  const [emp] = await db
    .select({
      weekly_hours: employees.weekly_hours,
      max_weekly_hours: employees.max_weekly_hours,
    })
    .from(employees)
    .where(eq(employees.id, employeeId))
    .limit(1);
  return emp
    ? { weekly: emp.weekly_hours, max: emp.max_weekly_hours }
    : null;
}
