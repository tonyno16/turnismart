import {
  pgTable,
  text,
  timestamp,
  uuid,
  date,
  integer,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { schedules } from "./schedules";
import { locations } from "./locations";
import { employees } from "./employees";
import { roles } from "./roles";

export const shiftStatuses = ["active", "cancelled", "sick_leave"] as const;
export type ShiftStatus = (typeof shiftStatuses)[number];

export const shifts = pgTable(
  "shifts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schedule_id: uuid("schedule_id")
      .notNull()
      .references(() => schedules.id, { onDelete: "cascade" }),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    location_id: uuid("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    employee_id: uuid("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    role_id: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    start_time: text("start_time").notNull(), // HH:mm
    end_time: text("end_time").notNull(), // HH:mm
    break_minutes: integer("break_minutes").default(0).notNull(),
    is_auto_generated: boolean("is_auto_generated").default(false).notNull(),
    status: text("status", { enum: shiftStatuses })
      .default("active")
      .notNull(),
    notes: text("notes"),
    cancelled_reason: text("cancelled_reason"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("idx_shifts_schedule_status").on(t.schedule_id, t.status),
    index("idx_shifts_employee_date").on(t.employee_id, t.date),
    index("idx_shifts_organization").on(t.organization_id),
  ]
);
