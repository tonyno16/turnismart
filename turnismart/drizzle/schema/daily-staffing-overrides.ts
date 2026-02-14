import {
  pgTable,
  integer,
  text,
  timestamp,
  uuid,
  date,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { locations } from "./locations";
import { roles } from "./roles";
import { shiftPeriods } from "./staffing-requirements";

export const dailyStaffingOverrides = pgTable(
  "daily_staffing_overrides",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    location_id: uuid("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    role_id: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    shift_period: text("shift_period", {
      enum: shiftPeriods,
    }).notNull(),
    required_count: integer("required_count").default(0).notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    unique("daily_staffing_loc_role_date_period_unique").on(
      t.location_id,
      t.role_id,
      t.date,
      t.shift_period
    ),
    index("idx_daily_staffing_location").on(t.location_id),
    index("idx_daily_staffing_date_range").on(t.location_id, t.date),
  ]
);
