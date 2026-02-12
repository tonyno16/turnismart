import {
  pgTable,
  text,
  timestamp,
  uuid,
  date,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { schedules } from "./schedules";

export const jobStatuses = [
  "pending",
  "collecting",
  "optimizing",
  "validating",
  "completed",
  "failed",
  "cancelled",
] as const;
export type JobStatus = (typeof jobStatuses)[number];

export const scheduleGenerationJobs = pgTable("schedule_generation_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  schedule_id: uuid("schedule_id").references(() => schedules.id, {
    onDelete: "set null",
  }),
  week_start_date: date("week_start_date").notNull(),
  location_ids: text("location_ids").array(),
  mode: text("mode").default("full"),
  options: jsonb("options").$type<Record<string, unknown>>().default({}),
  status: text("status", { enum: jobStatuses })
    .default("pending")
    .notNull(),
  progress_percentage: integer("progress_percentage").default(0).notNull(),
  current_step: text("current_step"),
  trigger_run_id: text("trigger_run_id"),
  result_summary: jsonb("result_summary").$type<Record<string, unknown>>(),
  error_message: text("error_message"),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  completed_at: timestamp("completed_at", { withTimezone: true }),
});
