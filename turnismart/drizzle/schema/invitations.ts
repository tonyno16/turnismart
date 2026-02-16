import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { users } from "./users";

export const invitationStatuses = ["pending", "accepted", "expired"] as const;
export type InvitationStatus = (typeof invitationStatuses)[number];

export const invitations = pgTable("invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  invited_by_user_id: uuid("invited_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  phone: text("phone"),
  role: text("role", {
    enum: ["manager", "employee", "accountant"],
  }).notNull(),
  token: text("token").notNull().unique(),
  status: text("status", { enum: invitationStatuses })
    .default("pending")
    .notNull(),
  expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
  accepted_at: timestamp("accepted_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
