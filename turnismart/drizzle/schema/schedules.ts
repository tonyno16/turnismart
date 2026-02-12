import {
  pgTable,
  text,
  timestamp,
  uuid,
  date,
  unique,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { users } from "./users";

export const scheduleStatuses = ["draft", "published", "modified_after_publish"] as const;
export type ScheduleStatus = (typeof scheduleStatuses)[number];

export const schedules = pgTable(
  "schedules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    week_start_date: date("week_start_date").notNull(),
    status: text("status", { enum: scheduleStatuses })
      .default("draft")
      .notNull(),
    published_at: timestamp("published_at", { withTimezone: true }),
    published_by_user_id: uuid("published_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [unique("schedules_org_week_unique").on(t.organization_id, t.week_start_date)]
);
