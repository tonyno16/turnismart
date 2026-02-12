import {
  pgTable,
  text,
  timestamp,
  uuid,
  date,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { employees } from "./employees";
import { users } from "./users";
import { shifts } from "./shifts";

export const shiftRequestTypes = [
  "shift_swap",
  "vacation",
  "personal_leave",
  "sick_leave",
] as const;
export type ShiftRequestType = (typeof shiftRequestTypes)[number];

export const shiftRequestStatuses = [
  "pending",
  "approved",
  "rejected",
] as const;
export type ShiftRequestStatus = (typeof shiftRequestStatuses)[number];

export const shiftRequests = pgTable("shift_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  employee_id: uuid("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  type: text("type", { enum: shiftRequestTypes }).notNull(),
  status: text("status", { enum: shiftRequestStatuses })
    .default("pending")
    .notNull(),
  shift_id: uuid("shift_id").references(() => shifts.id, { onDelete: "set null" }),
  swap_with_employee_id: uuid("swap_with_employee_id").references(() => employees.id, {
    onDelete: "set null",
  }),
  start_date: date("start_date"),
  end_date: date("end_date"),
  reason: text("reason"),
  reviewed_by_user_id: uuid("reviewed_by_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  reviewed_at: timestamp("reviewed_at", { withTimezone: true }),
  review_notes: text("review_notes"),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
