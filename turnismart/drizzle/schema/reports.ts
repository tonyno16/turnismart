import {
  pgTable,
  text,
  timestamp,
  uuid,
  date,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { users } from "./users";

export const reportStatuses = ["draft", "ready", "sent_to_accountant"] as const;
export type ReportStatus = (typeof reportStatuses)[number];

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    month: date("month").notNull(),
    status: text("status", { enum: reportStatuses })
      .default("draft")
      .notNull(),
    pdf_url: text("pdf_url"),
    csv_url: text("csv_url"),
    excel_url: text("excel_url"),
    summary: jsonb("summary").$type<{
      totalHours?: number;
      totalCost?: number;
      employeeCount?: number;
      ordinaryHours?: number;
      overtimeHours?: number;
      holidayHours?: number;
    }>(),
    details_by_employee: jsonb("details_by_employee").$type<
      Array<{
        employeeId: string;
        employeeName: string;
        ordinaryHours: number;
        overtimeHours: number;
        holidayHours: number;
        sickHours?: number;
        vacationHours?: number;
        totalCost: number;
      }>
    >(),
    details_by_location: jsonb("details_by_location").$type<
      Array<{
        locationId: string;
        locationName: string;
        totalHours: number;
        totalCost: number;
      }>
    >(),
    sent_to_accountant_at: timestamp("sent_to_accountant_at", {
      withTimezone: true,
    }),
    created_by_user_id: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [unique("reports_org_month_unique").on(t.organization_id, t.month)]
);
