import Link from "next/link";
import { requireOrganization } from "@/lib/auth";
import { Settings, Bell, Calculator, Briefcase } from "lucide-react";

export default async function SettingsPage() {
  const { user } = await requireOrganization();
  if (user.role !== "owner" && user.role !== "manager") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/50 dark:bg-amber-900/20">
        <p className="text-amber-800 dark:text-amber-200">
          Solo titolare o manager può accedere alle impostazioni.
        </p>
      </div>
    );
  }

  const links = [
    {
      href: "/settings/roles",
      label: "Mansioni",
      description: "Aggiungi e gestisci le mansioni (ruoli) per i dipendenti",
      icon: <Briefcase className="size-5 shrink-0" />,
    },
    {
      href: "/settings/work-rules",
      label: "Regole di lavoro",
      description: "Pausa minima tra turni, giorni consecutivi, soglia straordinari",
      icon: <Settings className="size-5 shrink-0" />,
    },
    {
      href: "/settings/notifications",
      label: "Notifiche",
      description: "Canali attivi per ogni tipo di evento (WhatsApp, email, in-app)",
      icon: <Bell className="size-5 shrink-0" />,
    },
    {
      href: "/settings/accountant",
      label: "Commercialista",
      description: "Collega commercialisti per accesso ai report",
      icon: <Calculator className="size-5 shrink-0" />,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Impostazioni
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Configura regole di lavoro, notifiche e integrazioni.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex gap-4 rounded-xl border border-zinc-200 p-6 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/50"
          >
            <div className="rounded-lg bg-zinc-100 p-2 dark:bg-zinc-800">
              {link.icon}
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-white">
                {link.label}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">{link.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
