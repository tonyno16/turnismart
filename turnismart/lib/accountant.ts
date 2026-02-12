import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  accountantClients,
  organizations,
  reports,
} from "@/drizzle/schema";

export async function getAccountantClients(accountantUserId: string) {
  return db
    .select({
      id: accountantClients.id,
      organizationId: organizations.id,
      organizationName: organizations.name,
      status: accountantClients.status,
    })
    .from(accountantClients)
    .innerJoin(
      organizations,
      eq(accountantClients.organization_id, organizations.id)
    )
    .where(eq(accountantClients.accountant_user_id, accountantUserId));
}

export async function getClientReports(organizationId: string) {
  return db
    .select()
    .from(reports)
    .where(eq(reports.organization_id, organizationId))
    .orderBy(desc(reports.month));
}
