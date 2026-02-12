import Link from "next/link";
import {
  Sparkles,
  Building2,
  FileSpreadsheet,
  GripVertical,
  MessageCircle,
  Smartphone,
} from "lucide-react";
import { FeatureCard } from "@/components/ui/feature-card";
import { PricingCard } from "@/components/ui/pricing-card";
import { FAQAccordion } from "@/components/ui/faq-accordion";

const features = [
  {
    title: "Scheduling con AI",
    description:
      "L'intelligenza artificiale genera l'orario ottimale in secondi, rispettando fabbisogni, disponibilità e contratti.",
    icon: Sparkles,
  },
  {
    title: "Multi-sede",
    description:
      "Gestisci tutte le sedi da un'unica piattaforma: ristoranti, retail, case di riposo. Un solo login.",
    icon: Building2,
  },
  {
    title: "Report automatici",
    description:
      "Esporta ore lavorate, straordinari e dati per il commercialista. PDF e CSV pronti per le buste paga.",
    icon: FileSpreadsheet,
  },
  {
    title: "Drag & drop",
    description:
      "Modifica l'orario con trascinamento. Cambi turno, coperture e imprevisti in pochi click.",
    icon: GripVertical,
  },
  {
    title: "Notifiche WhatsApp",
    description:
      "Avvisa i dipendenti quando l'orario è pronto o viene modificato. Niente più messaggi persi.",
    icon: MessageCircle,
  },
  {
    title: "App per dipendenti",
    description:
      "I dipendenti vedono il proprio orario da smartphone, richiedono permessi e scambi turno.",
    icon: Smartphone,
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "€9,99",
    period: "/mese",
    description: "Per piccole attività con una sede",
    features: [
      "1 sede",
      "Fino a 15 dipendenti",
      "Griglia orari drag & drop",
      "Export base per commercialista",
    ],
    cta: "Inizia prova gratuita",
    href: "/auth/sign-up",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "€24,99",
    period: "/mese",
    description: "Per chi ha più sedi e vuole l'AI",
    features: [
      "Fino a 5 sedi",
      "Fino a 50 dipendenti",
      "Generazione orari con AI",
      "Report avanzati e notifiche",
      "Supporto prioritario",
    ],
    cta: "Inizia prova gratuita",
    href: "/auth/sign-up",
    highlighted: true,
  },
  {
    name: "Business",
    price: "€49,99",
    period: "/mese",
    description: "Sedi e dipendenti illimitati",
    features: [
      "Sedi illimitate",
      "Dipendenti illimitati",
      "Tutto di Pro",
      "Integrazioni API",
      "Account manager dedicato",
    ],
    cta: "Contattaci",
    href: "/auth/sign-up",
    highlighted: false,
  },
];

const faqItems = [
  {
    question: "Posso migrare da Excel o da un altro software?",
    answer:
      "Sì. Puoi importare i tuoi dati tramite CSV (disponibile nel piano Business e in fase di estensione). Per iniziare puoi creare sedi e dipendenti manualmente in pochi minuti.",
  },
  {
    question: "I report sono compatibili con il software del commercialista?",
    answer:
      "Esportiamo in PDF, CSV ed Excel con ore lavorate, tipo ore e paga oraria per dipendente. La maggior parte dei software di gestione paghe accetta questi formati o import da CSV.",
  },
  {
    question: "Dove vengono conservati i dati?",
    answer:
      "I dati sono ospitati su infrastrutture in Unione Europea (GDPR compliant). Non vendiamo né cediamo i tuoi dati a terzi. Vedi la Privacy Policy per i dettagli.",
  },
  {
    question: "Cosa succede dopo i 30 giorni di prova?",
    answer:
      "Se non scegli un piano a pagamento, l'account passa in modalità limitata. Puoi esportare i dati e cancellare l'account in qualsiasi momento. Nessun addebito senza il tuo consenso.",
  },
  {
    question: "Posso annullare e avere un rimborso?",
    answer:
      "Sì. Entro 14 giorni dalla sottoscrizione di un piano a pagamento puoi richiedere il rimborso integrale. Vedi la Politica di rimborso per le condizioni.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-b from-white to-zinc-50 dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-900/80">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-white">
              Crea gli orari del personale in pochi minuti, non in ore
            </h1>
            <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400">
              Basta Excel, WhatsApp e fogli di carta. Gestisci tutti i tuoi
              locali da un&apos;unica piattaforma. L&apos;AI genera l&apos;orario
              ottimale, tu lo pubblichi e i dipendenti ricevono tutto su
              smartphone.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/auth/sign-up"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-6 py-4 text-base font-semibold text-white shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2 sm:w-auto dark:focus:ring-offset-zinc-950"
              >
                Prova gratis per 30 giorni
              </Link>
              <Link
                href="/#come-funziona"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-6 py-4 text-base font-semibold text-zinc-900 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 sm:w-auto dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
              >
                Scopri come funziona
              </Link>
            </div>
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              Nessuna carta richiesta. Cancelli quando vuoi.
            </p>
          </div>
        </div>
      </section>

      {/* Come Funziona */}
      <section
        id="come-funziona"
        className="scroll-mt-20 border-b border-zinc-200 py-16 dark:border-zinc-800 sm:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold text-zinc-900 dark:text-white">
            Come funziona
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-zinc-600 dark:text-zinc-400">
            Tre passi per passare dal caos degli orari a una gestione ordinata e
            veloce.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="relative flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))]">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
                Configura
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Inserisci sedi, orari di apertura, dipendenti e fabbisogni. Una
                sola volta, poi riutilizzi tutto.
              </p>
            </div>
            <div className="relative flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))]">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
                Genera con AI
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Clicchi &quot;Genera orario&quot; e l&apos;AI propone la
                settimana ottimale in pochi secondi. Modifichi con drag & drop
                se serve.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))]">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
                Pubblica
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Pubblichi l&apos;orario: i dipendenti ricevono notifica su
                WhatsApp o email e lo vedono nell&apos;app.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="funzionalita"
        className="scroll-mt-20 border-b border-zinc-200 py-16 dark:border-zinc-800 sm:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold text-zinc-900 dark:text-white">
            Tutto ciò che ti serve per gli orari
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-zinc-600 dark:text-zinc-400">
            Dalla generazione intelligente ai report per il commercialista, in
            un&apos;unica piattaforma.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <FeatureCard
                key={f.title}
                title={f.title}
                description={f.description}
                icon={f.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="prezzi"
        className="scroll-mt-20 border-b border-zinc-200 py-16 dark:border-zinc-800 sm:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold text-zinc-900 dark:text-white">
            Prezzi semplici
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-zinc-600 dark:text-zinc-400">
            30 giorni gratis con tutte le funzionalità Pro. Nessuna carta
            richiesta per iniziare.
          </p>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="scroll-mt-20 border-b border-zinc-200 py-16 dark:border-zinc-800 sm:py-24"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold text-zinc-900 dark:text-white">
            Domande frequenti
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-zinc-600 dark:text-zinc-400">
            Risposte rapide alle domande più comuni.
          </p>
          <div className="mt-12">
            <FAQAccordion items={faqItems} />
          </div>
        </div>
      </section>

      {/* CTA finale */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Pronto a risparmiare ore ogni settimana?
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            Unisciti a chi già gestisce gli orari con TurniSmart. Prova gratis
            per 30 giorni.
          </p>
          <Link
            href="/auth/sign-up"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-[hsl(var(--primary))] px-8 py-4 text-base font-semibold text-white shadow-lg hover:opacity-90"
          >
            Prova gratis per 30 giorni
          </Link>
        </div>
      </section>
    </>
  );
}
