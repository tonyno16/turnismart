import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { roles } from "@/drizzle/schema";

export async function getRolesForOrganization(organizationId: string) {
  return db
    .select()
    .from(roles)
    .where(eq(roles.organization_id, organizationId))
    .orderBy(roles.sort_order, roles.name);
}
