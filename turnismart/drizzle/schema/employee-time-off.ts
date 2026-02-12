import {
  pgTable,
  text,
  timestamp,
  uuid,
  date,
} from "drizzle-orm/pg-core";
import { employees } from "./employees";
import { users } from "./users";

export const timeOffTypes = ["vacation", "personal_leave", "sick_leave", "other"] as const;
export type TimeOffType = (typeof timeOffTypes)[number];

export const timeOffStatuses = ["pending", "approved", "rejected"] as const;
export type TimeOffStatus = (typeof timeOffStatuses)[number];

export const employeeTimeOff = pgTable("employee_time_off", {
  id: uuid("id").defaultRandom().primaryKey(),
  employee_id: uuid("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  type: text("type", { enum: timeOffTypes }).notNull(),
  start_date: date("start_date").notNull(),
  end_date: date("end_date").notNull(),
  status: text("status", { enum: timeOffStatuses })
    .default("pending")
    .notNull(),
  approved_by_user_id: uuid("approved_by_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  notes: text("notes"),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
