import { date, integer, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { employees } from "./employees";

export const employeeAvailabilityExceptions = pgTable(
  "employee_availability_exceptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    employee_id: uuid("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    start_date: date("start_date").notNull(),
    end_date: date("end_date").notNull(),
    day_of_week: integer("day_of_week").notNull(), // 0=Monday, 6=Sunday
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);
