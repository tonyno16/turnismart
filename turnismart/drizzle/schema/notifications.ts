import {
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { users } from "./users";
import { employees } from "./employees";

export const notificationChannels = ["whatsapp", "email", "in_app"] as const;
export type NotificationChannel = (typeof notificationChannels)[number];

export const notificationDeliveryStatuses = [
  "pending",
  "sent",
  "delivered",
  "failed",
] as const;
export type NotificationDeliveryStatus =
  (typeof notificationDeliveryStatuses)[number];

export const notificationEventTypes = [
  "schedule_published",
  "shift_changed",
  "shift_assigned",
  "sick_leave_replacement",
  "request_approved",
  "request_rejected",
  "report_ready",
  "invitation",
  "trial_expiring",
] as const;
export type NotificationEventType = (typeof notificationEventTypes)[number];

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  recipient_user_id: uuid("recipient_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  recipient_employee_id: uuid("recipient_employee_id").references(
    () => employees.id,
    { onDelete: "set null" }
  ),
  channel: text("channel", { enum: notificationChannels }).notNull(),
  event_type: text("event_type", { enum: notificationEventTypes }).notNull(),
  subject: text("subject"),
  body: text("body").notNull(),
  delivery_status: text("delivery_status", {
    enum: notificationDeliveryStatuses,
  })
    .default("pending")
    .notNull(),
  external_id: text("external_id"),
  sent_at: timestamp("sent_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
