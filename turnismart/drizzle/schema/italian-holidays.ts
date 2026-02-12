import { pgTable, text, timestamp, uuid, date, unique } from "drizzle-orm/pg-core";

export const italianHolidays = pgTable(
  "italian_holidays",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    date: date("date").notNull(),
    name: text("name").notNull(),
    year: text("year"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [unique("italian_holidays_date_unique").on(t.date)]
);
