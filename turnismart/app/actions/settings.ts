"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { organizationSettings } from "@/drizzle/schema";
import { requireOrganization } from "@/lib/auth";

export type WorkRulesInput = {
  min_rest_between_shifts_hours: number;
  max_consecutive_days: number;
  overtime_threshold_hours: number;
};

export async function updateWorkRules(data: WorkRulesInput) {
  const { user, organization } = await requireOrganization();
  if (user.role !== "owner" && user.role !== "manager") throw new Error("Forbidden");
  const [settings] = await db
    .select()
    .from(organizationSettings)
    .where(eq(organizationSettings.organization_id, organization.id))
    .limit(1);

  const workRules = {
    min_rest_between_shifts_hours: Math.max(0, Math.min(24, data.min_rest_between_shifts_hours)),
    max_consecutive_days: Math.max(1, Math.min(14, data.max_consecutive_days)),
    overtime_threshold_hours: Math.max(1, Math.min(80, data.overtime_threshold_hours)),
  };

  if (settings) {
    await db
      .update(organizationSettings)
      .set({
        work_rules: { ...(settings.work_rules as Record<string, unknown>), ...workRules },
        updated_at: new Date(),
      })
      .where(eq(organizationSettings.id, settings.id));
  } else {
    await db.insert(organizationSettings).values({
      organization_id: organization.id,
      work_rules: workRules,
    });
  }
}

export type NotificationChannelPref = Record<string, boolean>;

export async function updateNotificationSettings(channels: NotificationChannelPref) {
  const { user, organization } = await requireOrganization();
  if (user.role !== "owner" && user.role !== "manager") throw new Error("Forbidden");
  const [settings] = await db
    .select()
    .from(organizationSettings)
    .where(eq(organizationSettings.organization_id, organization.id))
    .limit(1);

  const notification_settings = channels;

  if (settings) {
    await db
      .update(organizationSettings)
      .set({
        notification_settings: { ...(settings.notification_settings as Record<string, unknown>), ...notification_settings },
        updated_at: new Date(),
      })
      .where(eq(organizationSettings.id, settings.id));
  } else {
    await db.insert(organizationSettings).values({
      organization_id: organization.id,
      notification_settings: channels,
    });
  }
}
