import {
  pgTable,
  integer,
  text,
  timestamp,
  uuid,
  unique,
} from "drizzle-orm/pg-core";
import { locations } from "./locations";
import { roles } from "./roles";

export const shiftPeriods = ["morning", "afternoon", "evening"] as const;
export type ShiftPeriod = (typeof shiftPeriods)[number];

export const staffingRequirements = pgTable(
  "staffing_requirements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    location_id: uuid("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    role_id: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    day_of_week: integer("day_of_week").notNull(), // 0=Monday, 6=Sunday
    shift_period: text("shift_period", {
      enum: shiftPeriods,
    }).notNull(),
    required_count: integer("required_count").default(1).notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    unique("staffing_loc_role_day_period_unique").on(
      t.location_id,
      t.role_id,
      t.day_of_week,
      t.shift_period
    ),
  ]
);
