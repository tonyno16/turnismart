import {
  pgTable,
  integer,
  text,
  timestamp,
  uuid,
  unique,
} from "drizzle-orm/pg-core";
import { employees } from "./employees";

export const availabilityStatuses = ["available", "unavailable", "preferred"] as const;
export type AvailabilityStatus = (typeof availabilityStatuses)[number];

export const availabilityShiftPeriods = ["morning", "afternoon", "evening"] as const;
export type AvailabilityShiftPeriod = (typeof availabilityShiftPeriods)[number];

export const employeeAvailability = pgTable(
  "employee_availability",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    employee_id: uuid("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    day_of_week: integer("day_of_week").notNull(),
    shift_period: text("shift_period", { enum: availabilityShiftPeriods }).notNull(),
    status: text("status", { enum: availabilityStatuses })
      .default("available")
      .notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    unique("employee_availability_emp_day_period_unique").on(
      t.employee_id,
      t.day_of_week,
      t.shift_period
    ),
  ]
);
