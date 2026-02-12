import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const importJobStatuses = ["pending", "parsing", "creating", "completed", "failed"] as const;

export const importJobs = pgTable("import_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  file_name: text("file_name").notNull(),
  file_url: text("file_url").notNull(),
  total_rows: integer("total_rows").default(0).notNull(),
  status: text("status", { enum: importJobStatuses }).default("pending").notNull(),
  progress_percentage: integer("progress_percentage").default(0).notNull(),
  trigger_run_id: text("trigger_run_id"),
  result_summary: jsonb("result_summary").$type<{
    imported?: number;
    skipped?: number;
    errors?: Array<{ row: number; reason: string }>;
  }>(),
  error_message: text("error_message"),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  completed_at: timestamp("completed_at", { withTimezone: true }),
});
