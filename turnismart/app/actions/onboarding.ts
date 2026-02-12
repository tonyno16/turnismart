"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  organizations,
  roles,
  locations,
  staffingRequirements,
  employees,
  employeeRoles,
  organizationSettings,
} from "@/drizzle/schema";
import { requireOrganization } from "@/lib/auth";
import { SECTOR_ROLES, type SectorKey } from "@/lib/onboarding/sector-roles";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const SHIFT_PERIODS = ["morning", "afternoon", "evening"] as const;

export async function completeStep1(sector: string) {
  const { organization } = await requireOrganization();
  const sectorKey = (sector || "other") as SectorKey;
  const roleList = SECTOR_ROLES[sectorKey] ?? SECTOR_ROLES.other;

  await db
    .update(organizations)
    .set({
      sector: sectorKey,
      updated_at: new Date(),
    })
    .where(eq(organizations.id, organization.id));

  for (let i = 0; i < roleList.length; i++) {
    await db.insert(roles).values({
      organization_id: organization.id,
      name: roleList[i].name,
      color: roleList[i].color,
      sort_order: i,
    });
  }

  await db.insert(organizationSettings).values({
    organization_id: organization.id,
  }).onConflictDoNothing({ target: organizationSettings.organization_id });
}

export async function completeStep2(formData: FormData) {
  const { organization } = await requireOrganization();
  const name = (formData.get("name") as string)?.trim();
  const address = (formData.get("address") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;

  const openingHours: Record<string, { shifts: { open: string; close: string }[] }> = {};
  for (let d = 0; d < 7; d++) {
    const day = DAYS[d];
    const shifts: { open: string; close: string }[] = [];
    const open1 = formData.get(`${day}_open1`) as string;
    const close1 = formData.get(`${day}_close1`) as string;
    if (open1 && close1) shifts.push({ open: open1, close: close1 });
    const open2 = formData.get(`${day}_open2`) as string;
    const close2 = formData.get(`${day}_close2`) as string;
    if (open2 && close2) shifts.push({ open: open2, close: close2 });
    if (shifts.length > 0) openingHours[day] = { shifts };
  }

  if (!name) throw new Error("Nome sede obbligatorio");

  await db.insert(organizationSettings).values({
    organization_id: organization.id,
  }).onConflictDoNothing({ target: organizationSettings.organization_id });

  await db.insert(locations).values({
    organization_id: organization.id,
    name,
    address,
    phone,
    opening_hours: Object.keys(openingHours).length > 0 ? openingHours : {},
  });
}

export async function completeStep3(formData: FormData) {
  const { organization } = await requireOrganization();

  const [location] = await db
    .select()
    .from(locations)
    .where(eq(locations.organization_id, organization.id))
    .limit(1);
  if (!location) throw new Error("Nessuna sede trovata");

  const orgRoles = await db
    .select()
    .from(roles)
    .where(eq(roles.organization_id, organization.id));

  for (const role of orgRoles) {
    for (let day = 0; day < 7; day++) {
      for (const period of SHIFT_PERIODS) {
        const count = parseInt(
          (formData.get(`sr_${role.id}_${day}_${period}`) as string) || "0",
          10
        );
        if (count > 0) {
          await db.insert(staffingRequirements).values({
            location_id: location.id,
            role_id: role.id,
            day_of_week: day,
            shift_period: period,
            required_count: count,
          }).onConflictDoUpdate({
            target: [
              staffingRequirements.location_id,
              staffingRequirements.role_id,
              staffingRequirements.day_of_week,
              staffingRequirements.shift_period,
            ],
            set: { required_count: count, updated_at: new Date() },
          });
        }
      }
    }
  }
}

export async function completeStep4(formData: FormData) {
  const { organization } = await requireOrganization();

  const orgRoles = await db
    .select()
    .from(roles)
    .where(eq(roles.organization_id, organization.id));
  const [firstRole] = orgRoles;

  const employeesData = formData.get("employees") as string;
  if (!employeesData) return;

  const rows = JSON.parse(employeesData) as Array<{
    firstName: string;
    lastName: string;
    phone?: string;
    roleId: string;
    weeklyHours: number;
  }>;

  for (const row of rows) {
    if (!row.firstName?.trim() || !row.lastName?.trim()) continue;

    const [emp] = await db
      .insert(employees)
      .values({
        organization_id: organization.id,
        first_name: row.firstName.trim(),
        last_name: row.lastName.trim(),
        phone: row.phone?.trim() || null,
        weekly_hours: row.weeklyHours || 40,
      })
      .returning();

    if (emp) {
      const roleId = row.roleId || firstRole?.id;
      if (roleId) {
        await db.insert(employeeRoles).values({
          employee_id: emp.id,
          role_id: roleId,
          is_primary: true,
        }).onConflictDoNothing({
          target: [employeeRoles.employee_id, employeeRoles.role_id],
        });
      }
    }
  }
}

export async function completeStep5() {
  const { organization } = await requireOrganization();

  await db
    .update(organizations)
    .set({
      onboarding_completed: true,
      updated_at: new Date(),
    })
    .where(eq(organizations.id, organization.id));

  redirect("/dashboard");
}

export async function getOnboardingData() {
  const { organization } = await requireOrganization();
  const [location] = await db
    .select()
    .from(locations)
    .where(eq(locations.organization_id, organization.id))
    .limit(1);
  const orgRoles = await db
    .select()
    .from(roles)
    .where(eq(roles.organization_id, organization.id));
  return { location, roles: orgRoles };
}
