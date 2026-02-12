import { eq } from "drizzle-orm";
import Link from "next/link";
import { requireOrganization } from "@/lib/auth";
import { db } from "@/lib/db";
import { roles } from "@/drizzle/schema";
import { RolesManager } from "./roles-manager";

export default async function RolesSettingsPage() {
  const { user, organization } = await requireOrganization();
  if (user.role !== "owner" && user.role !== "manager") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/50 dark:bg-amber-900/20">
        <p className="text-amber-800 dark:text-amber-200">
          Solo titolare o manager può gestire le mansioni.
        </p>
      </div>
    );
  }

  const orgRoles = await db
    .select()
    .from(roles)
    .where(eq(roles.organization_id, organization.id))
    .orderBy(roles.sort_order, roles.name);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/settings"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400"
        >
          ← Impostazioni
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
          Mansioni
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Le mansioni (ruoli) assegnabili ai dipendenti. Usate per fabbisogno e turni.
        </p>
      </div>

      <RolesManager roles={orgRoles} />
    </div>
  );
}
