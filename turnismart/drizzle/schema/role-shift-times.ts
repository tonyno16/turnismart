import { pgTable, smallint, text, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { roles } from "./roles";

/** day_of_week: 0=Mon..6=Sun, 7=all days (default). */
export const DAY_ALL = 7;
export const roleShiftTimes = pgTable(
  "role_shift_times",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    role_id: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    shift_period: text("shift_period", { enum: ["morning", "evening"] }).notNull(),
    day_of_week: smallint("day_of_week").notNull().default(7), // 0-6=specific day, 7=all
    start_time: text("start_time").notNull(), // HH:mm
    end_time: text("end_time").notNull(), // HH:mm
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    unique("role_shift_times_role_period_day_unique").on(
      t.role_id,
      t.shift_period,
      t.day_of_week
    ),
  ]
);
