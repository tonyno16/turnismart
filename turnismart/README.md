# TurniSmart

SaaS italiano per la gestione degli orari del personale multi-sede, con ottimizzazione AI, notifiche WhatsApp/Email e report per commercialista.

**Stack:** Next.js 16 · Supabase · Drizzle · Trigger.dev · Stripe · Twilio · Resend · OpenAI

---

## Quick Start

```bash
# Clona e installa
cd turnismart
npm install

# Copia le variabili d'ambiente
cp .env.example .env.local   # se esiste, altrimenti crea .env.local manualmente

# Migrazioni DB
npm run db:migrate

# Avvia
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

---

## Setup completo

Il progetto richiede vari servizi esterni. Segui la guida dettagliata:

→ **[SETUP_MANUAL_STEPS.md](./SETUP_MANUAL_STEPS.md)** — configurazione passo-passo di Supabase, Stripe, Trigger.dev, Twilio, Resend, OpenAI.

### Variabili minime per partire

| Variabile | Dove prenderla |
|-----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase |
| `DATABASE_URL` | Supabase → Settings → Database (Connection string) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` in dev |

Altre variabili (Stripe, Trigger, OpenAI, Twilio, Resend) sono necessarie per funzionalità avanzate. Vedi `SETUP_MANUAL_STEPS.md` per l’elenco completo.

---

## Scripts

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Avvia il server di sviluppo |
| `npm run build` | Build di produzione |
| `npm run start` | Avvia in produzione |
| `npm run db:migrate` | Applica migrazioni Drizzle |
| `npm run db:generate` | Genera nuova migrazione |
| `npm run setup:storage` | Crea bucket Supabase Storage |
| `npm run test` | Test unitari (Vitest) |
| `npm run test:e2e` | Test E2E (Playwright) |
| `npm run e2e:onboarding` | Test E2E onboarding completo (reset + test) |

---

## Struttura progetto

```
app/
  (public)/        # Landing, pricing, auth
  (protected)/     # Dashboard, schedule, locations, employees, reports, profile...
  api/             # Webhooks (Stripe, Trigger), cron, AI
  actions/         # Server Actions
components/        # UI riutilizzabili
lib/               # Utilità (db, auth, AI, notifiche)
drizzle/           # Schema e migrazioni
trigger/           # Workflow Trigger.dev (CSV import)
e2e/               # Test Playwright
```

---

## Test

```bash
# Unit test
npm run test

# E2E (richiede app in esecuzione, Playwright la avvia automaticamente)
npm run e2e:onboarding    # flusso onboarding → schedule → pubblica
npm run test:e2e          # tutti i test E2E
```

Per gli E2E onboarding serve `e2e/.env.test` con `TEST_USER_EMAIL` e `TEST_USER_PASSWORD` di un utente esistente in Supabase.

---

## Deploy

→ **[DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)** — checklist pre-produzione.

Vercel è la soluzione consigliata. Configura le variabili d'ambiente come in `.env.local` e assicurati che `NEXT_PUBLIC_APP_URL` punti al dominio di produzione.
