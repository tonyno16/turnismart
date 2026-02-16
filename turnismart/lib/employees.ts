import { eq, and, or, inArray, ilike } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  employees,
  employeeRoles,
  roles,
  employeeAvailability,
  employeeAvailabilityExceptions,
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
  const conditions = [eq(employees.organization_id, organizationId)];
  if (filters?.isActive !== undefined) {
    conditions.push(eq(employees.is_active, filters.isActive));
  }
  if (filters?.search) {
    const pattern = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(employees.first_name, pattern),
        ilike(employees.last_name, pattern),
        ilike(employees.email, pattern),
        ilike(employees.phone, pattern)
      )!
    );
  }

  const list = await db
    .select()
    .from(employees)
    .where(and(...conditions))
    .orderBy(employees.last_name, employees.first_name);

  let filtered = list;
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

/** Returns map of employeeId -> roleIds for scheduler filters */
export async function getEmployeeRoleIdsForOrganization(organizationId: string) {
  const rows = await db
    .select({
      employee_id: employeeRoles.employee_id,
      role_id: employeeRoles.role_id,
    })
    .from(employeeRoles)
    .innerJoin(employees, eq(employeeRoles.employee_id, employees.id))
    .where(eq(employees.organization_id, organizationId));

  const map: Record<string, string[]> = {};
  for (const r of rows) {
    if (!map[r.employee_id]) map[r.employee_id] = [];
    map[r.employee_id].push(r.role_id);
  }
  return map;
}

export async function getEmployeeDetail(employeeId: string) {
  const [emp] = await db
    .select()
    .from(employees)
    .where(eq(employees.id, employeeId))
    .limit(1);
  if (!emp) return null;

  // Parallelize independent queries to reduce round-trips (was 7 sequential, now 2 batches)
  const [empRolesUnsorted, availability, availabilityExceptions, timeOff, incompatibilitiesRows] =
    await Promise.all([
      db
        .select({
          id: employeeRoles.id,
          role_id: roles.id,
          role_name: roles.name,
          priority: employeeRoles.priority,
          hourly_rate: employeeRoles.hourly_rate,
        })
        .from(employeeRoles)
        .innerJoin(roles, eq(employeeRoles.role_id, roles.id))
        .where(eq(employeeRoles.employee_id, employeeId))
        .orderBy(employeeRoles.priority),
      db
        .select()
        .from(employeeAvailability)
        .where(eq(employeeAvailability.employee_id, employeeId)),
      db
        .select()
        .from(employeeAvailabilityExceptions)
        .where(eq(employeeAvailabilityExceptions.employee_id, employeeId))
        .orderBy(employeeAvailabilityExceptions.start_date),
      db
        .select()
        .from(employeeTimeOff)
        .where(eq(employeeTimeOff.employee_id, employeeId))
        .orderBy(employeeTimeOff.start_date),
      db
        .select()
        .from(employeeIncompatibilities)
        .where(
          or(
            eq(employeeIncompatibilities.employee_a_id, employeeId),
            eq(employeeIncompatibilities.employee_b_id, employeeId)
          )
        ),
    ]);

  const empRoles = empRolesUnsorted;

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
    availabilityExceptions,
    timeOff,
    incompatibilities,
  };
}

/** Returns employee's contract weekly hours. Phase 5 scheduler will extend to sum scheduled hours per week. */
export async function getEmployeeWeeklyHours(
  employeeId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for future week-scoped calculation
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
