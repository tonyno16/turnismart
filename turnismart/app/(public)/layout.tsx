import type { Metadata } from "next";
import Link from "next/link";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://turnismart.it";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "TurniSmart - Orari del personale in pochi minuti con AI",
    template: "%s | TurniSmart",
  },
  description:
    "Crea e gestisci gli orari del personale in pochi minuti, non in ore. Multi-sede, AI scheduling, report automatici per il commercialista. Prova gratis 30 giorni.",
  keywords: [
    "orari personale",
    "scheduling turni",
    "gestione turni",
    "AI orari",
    "multi-sede",
    "ristoranti",
    "retail",
  ],
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: baseUrl,
    siteName: "TurniSmart",
    title: "TurniSmart - Orari del personale in pochi minuti con AI",
    description:
      "Crea gli orari del personale in pochi minuti. Multi-sede, AI, report automatici. Prova gratis 30 giorni.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TurniSmart - Orari del personale in pochi minuti",
    description: "Scheduling AI-powered per ristoranti, retail e multi-sede. Prova gratis.",
  },
  robots: "index, follow",
};

function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"
        >
          <span className="text-xl">TurniSmart</span>
        </Link>
        <nav className="hidden items-center gap-6 sm:flex" aria-label="Menu principale">
          <Link
            href="/#come-funziona"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            Come funziona
          </Link>
          <Link
            href="/#funzionalita"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            Funzionalità
          </Link>
          <Link
            href="/#prezzi"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            Prezzi
          </Link>
          <Link
            href="/#faq"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            Accedi
          </Link>
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center justify-center rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
          >
            Prova gratis 30 giorni
          </Link>
        </div>
      </div>
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="font-semibold text-zinc-900 dark:text-white">
              TurniSmart
            </span>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Orari del personale in pochi minuti, non in ore.
            </p>
          </div>
          <nav
            className="flex flex-wrap gap-6 text-sm"
            aria-label="Link utili"
          >
            <Link
              href="/privacy"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Termini di servizio
            </Link>
            <Link
              href="/refund"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Politica di rimborso
            </Link>
          </nav>
        </div>
        <p className="mt-8 border-t border-zinc-200 pt-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          &copy; {new Date().getFullYear()} TurniSmart. Tutti i diritti riservati.
        </p>
      </div>
    </footer>
  );
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
