import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export type ScheduleTemplateWeekData = {
  staffing: Array<{
    location_id: string;
    role_id: string;
    day_of_week: number;
    shift_period: string;
    required_count: number;
  }>;
  shifts: Array<{
    location_id: string;
    role_id: string;
    employee_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
  }>;
};

export const scheduleTemplates = pgTable("schedule_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  week_data: jsonb("week_data").$type<ScheduleTemplateWeekData>().notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
