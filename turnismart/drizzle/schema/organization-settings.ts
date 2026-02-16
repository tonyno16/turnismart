import { pgTable, timestamp, uuid, jsonb, unique } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const organizationSettings = pgTable(
  "organization_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    work_rules: jsonb("work_rules")
      .$type<Record<string, unknown>>()
      .default({
        min_rest_between_shifts_hours: 11,
        max_consecutive_days: 6,
        overtime_threshold_hours: 40,
      }),
    report_settings: jsonb("report_settings")
      .$type<Record<string, unknown>>()
      .default({}),
    notification_settings: jsonb("notification_settings")
      .$type<Record<string, unknown>>()
      .default({}),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [unique("organization_settings_org_unique").on(t.organization_id)]
);
