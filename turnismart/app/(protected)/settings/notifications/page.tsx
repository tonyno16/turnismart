import { requireOrganization } from "@/lib/auth";
import { db } from "@/lib/db";
import { organizationSettings } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { NotificationSettingsForm } from "./notification-settings-form";
import type { NotificationEventType } from "@/drizzle/schema";

const EVENT_LABELS: Record<NotificationEventType, string> = {
  schedule_published: "Orario pubblicato",
  shift_changed: "Turno modificato",
  shift_assigned: "Turno assegnato",
  sick_leave_replacement: "Sostituzione malattia",
  request_approved: "Richiesta approvata",
  request_rejected: "Richiesta rifiutata",
  report_ready: "Report pronto",
  invitation: "Invito",
  trial_expiring: "Prova in scadenza",
};

const CHANNEL_LABELS = {
  whatsapp: "WhatsApp",
  email: "Email",
  in_app: "In-app",
} as const;

const EVENTS: NotificationEventType[] = [
  "schedule_published",
  "shift_changed",
  "shift_assigned",
  "request_approved",
  "request_rejected",
  "report_ready",
  "invitation",
  "trial_expiring",
  "sick_leave_replacement",
];

export default async function NotificationSettingsPage() {
  const { organization } = await requireOrganization();
  const [settings] = await db
    .select()
    .from(organizationSettings)
    .where(eq(organizationSettings.organization_id, organization.id))
    .limit(1);

  const notification_settings = (settings?.notification_settings as Record<string, boolean>) ?? {};

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
          Notifiche
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Scegli quali canali usare per ogni tipo di notifica. In-app è sempre attivo.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <NotificationSettingsForm
          events={EVENTS}
          eventLabels={EVENT_LABELS}
          channelLabels={CHANNEL_LABELS}
          initialValues={notification_settings}
        />
      </div>
    </div>
  );
}
