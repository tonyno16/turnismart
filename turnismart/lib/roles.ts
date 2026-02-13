import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { roles, roleShiftTimes, DAY_ALL } from "@/drizzle/schema";
import { getPeriodTimesForOrganization } from "./schedules";

export async function getRolesForOrganization(organizationId: string) {
  return db
    .select()
    .from(roles)
    .where(eq(roles.organization_id, organizationId))
    .orderBy(roles.sort_order, roles.name);
}

export type RoleShiftTimesMap = Record<
  string,
  { morning: { start: string; end: string }; evening: { start: string; end: string } }
>;

export type RoleShiftTimesWithDays = {
  default: RoleShiftTimesMap;
  byDay: Partial<Record<number, RoleShiftTimesMap>>; // 0=Mon..6=Sun
};

export async function getRoleShiftTimesForOrganization(
  organizationId: string
): Promise<RoleShiftTimesWithDays> {
  const [orgTimes, roleList, overrideRows] = await Promise.all([
    getPeriodTimesForOrganization(organizationId),
    getRolesForOrganization(organizationId),
    db
      .select({
        role_id: roleShiftTimes.role_id,
        shift_period: roleShiftTimes.shift_period,
        day_of_week: roleShiftTimes.day_of_week,
        start_time: roleShiftTimes.start_time,
        end_time: roleShiftTimes.end_time,
      })
      .from(roleShiftTimes)
      .innerJoin(roles, eq(roleShiftTimes.role_id, roles.id))
      .where(eq(roles.organization_id, organizationId)),
  ]);

  const defaultMap: RoleShiftTimesMap = {};
  const byDay: Partial<Record<number, RoleShiftTimesMap>> = {};
  for (const role of roleList) {
    defaultMap[role.id] = {
      morning: { ...orgTimes.morning },
      evening: { ...orgTimes.evening },
    };
  }

  for (const r of overrideRows) {
    if (r.day_of_week === DAY_ALL) {
      if (defaultMap[r.role_id]) {
        if (r.shift_period === "morning") {
          defaultMap[r.role_id].morning = { start: r.start_time, end: r.end_time };
        } else {
          defaultMap[r.role_id].evening = { start: r.start_time, end: r.end_time };
        }
      }
    } else {
      if (!byDay[r.day_of_week]) byDay[r.day_of_week] = {};
      const dayMap = byDay[r.day_of_week]!;
      if (!dayMap[r.role_id]) {
        dayMap[r.role_id] = {
          morning: { ...defaultMap[r.role_id]?.morning ?? orgTimes.morning },
          evening: { ...defaultMap[r.role_id]?.evening ?? orgTimes.evening },
        };
      }
      if (r.shift_period === "morning") {
        dayMap[r.role_id].morning = { start: r.start_time, end: r.end_time };
      } else {
        dayMap[r.role_id].evening = { start: r.start_time, end: r.end_time };
      }
    }
  }
  return { default: defaultMap, byDay };
}
