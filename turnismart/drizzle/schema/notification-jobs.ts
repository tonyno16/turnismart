import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const notificationJobStatuses = [
  "pending",
  "preparing",
  "sending",
  "completed",
  "failed",
  "partial",
] as const;
export type NotificationJobStatus = (typeof notificationJobStatuses)[number];

export const notificationJobs = pgTable("notification_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  event_type: text("event_type").notNull(),
  recipient_count: integer("recipient_count").default(0).notNull(),
  status: text("status", { enum: notificationJobStatuses })
    .default("pending")
    .notNull(),
  progress_percentage: integer("progress_percentage").default(0).notNull(),
  trigger_job_id: text("trigger_job_id"),
  result_summary: jsonb("result_summary").$type<{
    sent?: number;
    failed?: number;
    pending?: number;
    errors?: string[];
  }>(),
  error_message: text("error_message"),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  completed_at: timestamp("completed_at", { withTimezone: true }),
});
