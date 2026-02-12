import {
  pgTable,
  text,
  timestamp,
  uuid,
  date,
  integer,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { reports } from "./reports";

export const reportJobStatuses = [
  "pending",
  "aggregating",
  "generating",
  "completed",
  "failed",
] as const;
export type ReportJobStatus = (typeof reportJobStatuses)[number];

export const reportGenerationJobs = pgTable("report_generation_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  report_id: uuid("report_id").references(() => reports.id, {
    onDelete: "set null",
  }),
  month: date("month").notNull(),
  status: text("status", { enum: reportJobStatuses })
    .default("pending")
    .notNull(),
  progress_percentage: integer("progress_percentage").default(0).notNull(),
  trigger_job_id: text("trigger_job_id"),
  error_message: text("error_message"),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  completed_at: timestamp("completed_at", { withTimezone: true }),
});
