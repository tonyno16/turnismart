# TurniSmart Development Roadmap

## App Summary

**App:** SaaS italiano per scheduling personale multi-sede con AI optimization e report automatici per commercialista
**Stack:** Next.js 16 + Supabase + Trigger.dev v4 + Stripe + Twilio WhatsApp + Resend + OpenAI GPT-4
**Developer:** Solo developer
**Database:** 24 tabelle PostgreSQL, organization-centric multi-tenant con RLS ✅
**Background Jobs:** 1 workflow Trigger.dev (CSV import). AI, report, notifiche implementate in sync/server-side.

---

## 📋 Stato attuale (Aggiornato)

| Phase | Stato | Note |
|-------|-------|------|
| 0 | ✅ | Progetto configurato, dipendenze installate |
| 1 | ✅ | Landing, privacy, terms, refund |
| 2 | ✅ | Auth Supabase, middleware, invite flow |
| 3 | ✅ | Onboarding 5 step, sector roles |
| 4 | ✅ | Locations + Employees CRUD. Copy fabbisogno, replica settimana (016) |
| 5 | ✅ | Scheduler DnD, vista sede/dipendente/ruolo (017), conflict popup, employee sidebar, filtri |
| 6 | ✅ | Dashboard con KPI e azioni rapide |
| 7 | ✅ | AI scheduling (lib/ai-schedule sync), sick-leave sostituti, API /ai/suggest |
| 8 | ✅ | Notifiche (lib/notifications sync), Twilio, Resend, webhooks |
| 9 | ✅ | Report PDF/CSV/Excel, accountant portal, cron monthly |
| 10 | ✅ | my-schedule, my-preferences, my-requests, approve/reject |
| 11 | ✅ | Profile, Stripe Portal, usage, settings |
| 12 | ✅ | CSV import (Trigger workflow) |
| 13 | ✅ | Admin dashboard, organizations, analytics |
| 14 | ✅ | PWA manifest, loading, empty states, toast, error boundary, SEO, E2E full-flow, security checklist |

**Trigger.dev:** Solo `trigger/csv-import.ts` deployato. AI schedule, monthly report, notification dispatch, conflict resolution, accountant invite sono implementati in modo sincrono (lib/*, app/actions/*) per semplificazione.

---

## 🚨 Phase 0: Project Setup ✅

**Goal**: Prepare development environment, install dependencies, configure all external services

### Run Setup Analysis

- [x] Verify development environment is properly configured

### Project Initialization

- [x] Next.js 16 project with App Router + TypeScript
- [x] Tailwind CSS v4
- [x] Drizzle ORM + `drizzle-kit` + `postgres` driver
- [x] `@supabase/supabase-js` + `@supabase/ssr`
- [x] `@trigger.dev/sdk` v4 + `@trigger.dev/react-hooks`
- [x] `stripe` + `@stripe/stripe-js`
- [x] `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`
- [x] `openai`, `twilio`, `resend`
- [x] `date-fns`, `zod`, `lucide-react`, `sonner`

### Environment Configuration

- [x] `.env.local` con variabili richieste:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `DATABASE_URL` (Supabase PostgreSQL connection string)
  - `TRIGGER_SECRET_KEY` (Trigger.dev project key)
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `OPENAI_API_KEY`
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`
  - `RESEND_API_KEY`
  - `NEXT_PUBLIC_APP_URL`
- [x] Supabase (Auth, Database, Storage)
- [x] Trigger.dev project
- [x] Stripe products e pricing
- [ ] Verify all env vars and services (manuale)

### Folder Structure

- [x] Struttura cartelle conforme:
  ```
  app/
    (public)/          # Landing, pricing, auth pages
    (protected)/       # All authenticated pages
      dashboard/
      schedule/
      locations/
      employees/
      reports/
      profile/
      my-schedule/     # Employee mobile view
      my-preferences/
      my-requests/
      accountant/      # Accountant portal
      admin/           # Super admin
    api/
      webhooks/        # Stripe, Trigger, WhatsApp
      ai/              # AI suggest endpoint
      cron/            # Monthly report cron
    actions/           # Server Actions
  components/
    ui/                # Shared UI components
    navigation/        # Sidebar, mobile nav
    schedule/          # Scheduler-specific
    employees/         # Employee-specific
    reports/           # Report-specific
  lib/                 # Server utilities
  trigger/             # Trigger.dev workflows
  drizzle/schema/, migrations/
  ```
---

## Phase 1: Landing Page & Branding ✅

**Goal**: Professional landing page che converte visitatori in trial users.

### Landing Page Implementation

- [x] `app/(public)/page.tsx`
  - [x] Hero section + CTA
  - [x] Features grid (6 card)
  - [x] Pricing section (3 piani)
  - [x] FAQ accordion
  - [x] Footer con link

### Legal Pages

- [x] `app/(public)/privacy/page.tsx`
- [x] `app/(public)/terms/page.tsx`
- [x] `app/(public)/refund/page.tsx`

---

## Phase 2: Authentication & Multi-Tenant Foundation ✅

**Goal**: Utenti possono registrarsi, fare login, e creare la propria organizzazione.

### Database Schema: Identity & Multi-Tenancy

- [x] `drizzle/schema/organizations.ts`
- [x] `users.ts`, `invitations.ts`, `accountant-clients.ts`
- [x] Migrazioni applicate, RLS abilitato

### Supabase Auth & Middleware

- [x] `lib/supabase/server.ts`, `client.ts`
- [x] `middleware.ts` - Auth + role guard (admin, accountant)

### Auth Pages

- [x] sign-up, login, forgot-password, reset-password, verify-email
- [x] invite/[token] - Accetta invito
- [x] `app/actions/auth.ts`

### Organization Setup

- [x] `lib/auth.ts`, `lib/organizations.ts`

---

## Phase 3: Onboarding Wizard & Core Data Setup ✅

**Goal**: Setup iniziale in 5 step: settore → locale → fabbisogno → dipendenti → riepilogo.

### Database Schema: Locations, Roles, Staffing

- [x] locations, roles, staffing-requirements, organization-settings
- [x] Migrazioni

### Onboarding Wizard

- [x] `app/(protected)/onboarding/page.tsx` - 5 step
- [x] `app/actions/onboarding.ts`
- [x] Ruoli per settore (lib/onboarding/sector-roles.ts)
- [x] Redirect se onboarding_completed = false

---

## Phase 4: Location & Employee Management (CRUD) ✅

**Goal**: Gestione completa locali e dipendenti.

### Database & Pages

- [x] Schema employees, employee-roles, availability, incompatibilities, time-off
- [x] `locations/page.tsx`, `locations/[id]` con griglia fabbisogno
- [x] `employees/page.tsx` con filtri e Import CSV, `employees/[id]` con profilo, disponibilità
- [x] `app/actions/locations.ts` - createLocation, updateLocation, deleteLocation, updateStaffingRequirements
- [x] `app/actions/employees.ts` - createEmployee, updateEmployee, approveTimeOff, rejectTimeOff
- [x] `lib/employees.ts`, `lib/locations.ts`
- [x] copyStaffingFromLocation, copyStaffingFromShift, replica settimana (016)

---

## Phase 5: Scheduler Core (Drag & Drop) ✅

**Goal**: Griglia orario settimanale con drag & drop, validazione conflitti.

### Database Schema: Schedules & Shifts

- [x] schedules, shifts, shift-requests

### Navigation & Layout

- [x] `components/navigation/app-sidebar.tsx` - Sidebar role-based

### Scheduler Grid

- [x] `schedule/page.tsx` + `scheduler-client.tsx` - Vista per locale, toolbar, Pubblica
- [x] `employee-sidebar.tsx` - DnD draggable, ore usate/totali
- [x] `lib/schedule-validation.ts`, `conflict-popup.tsx`
- [x] `app/actions/shifts.ts` - createShift, deleteShift, publishSchedule
- [x] `lib/schedules.ts` - getWeekSchedule, getStaffingCoverage, getWeekStats

---

## Phase 6: Dashboard & Overview ✅

**Goal**: Dashboard con KPI, griglia settimanale a semaforo, azioni rapide.

### Dashboard Page

- [x] `dashboard/page.tsx` - KPI cards, griglia copertura, alert, azioni rapide
- [x] `lib/dashboard.ts` - getDashboardStats, getWeekOverview, getPendingAlerts

---

## Phase 7: AI Schedule Generation & Conflict Resolution ✅

**Goal**: Generazione orario con AI e sostituti per malattia. *Implementato in sync (lib/ai-schedule.ts), non come Trigger workflow.*

### AI Schedule

- [x] `lib/ai-schedule.ts` - collectSchedulingConstraints, optimizeWithAI, validateAndSave
- [x] `schedule-generation-jobs` per tracking
- [x] `ai-generation-modal.tsx` - Select locali, modalità, trigger genera
- [x] Progress/result nel modal

### AI Suggestions & Sick Leave

- [x] `app/api/ai/suggest/route.ts` - Suggerimenti alternativi su conflitto
- [x] `lib/substitute-suggestions.ts` - Trova migliori sostituti
- [x] `sick-leave-popup.tsx` - Lista sostituti, [Assegna]

---

## Phase 8: Notification System (WhatsApp + Email) ✅

**Goal**: Notifiche al publish orario, sostituzione malattia, report. *Implementato in sync (lib/notifications.ts), non Trigger.*

### Database Schema: Notifications

- [x] `notifications.ts`, `notification-jobs.ts`
- [x] `lib/twilio.ts`, `lib/resend.ts`, `lib/notifications.ts`
- [x] publishSchedule → dispatchSchedulePublishedNotifications
- [x] `app/api/webhooks/whatsapp/route.ts`, `stripe/route.ts`

### (Trigger workflow non implementato - usato sync)

- [ ] Opzionale: `trigger/notification-dispatch.ts` per scalabilità:

  **Task 1: prepare-notifications**

  - [ ] Query destinatari per event_type (dipendenti per schedule_published, commercialista per report_ready, etc.)
  - [ ] Query organization_settings per canali preferiti
  - [ ] Genera messaggi personalizzati da template per ogni destinatario
  - [ ] Template events: schedule_published, shift_changed, shift_assigned, sick_leave_replacement, request_approved, request_rejected, report_ready, invitation, trial_expiring
  - [ ] metadata.root.set("progress", 20)

  **Task 2: send-notifications-batch**

  - [ ] Parallel: WhatsApp (Twilio) + Email (Resend) simultaneamente con Promise.all()
  - [ ] Rate limiting: 50 WhatsApp/sec, 10 Email/sec
  - [ ] Per ogni messaggio: INSERT notification record con delivery_status
  - [ ] Retry per messaggio fallito: 3 tentativi, backoff 30s/60s/120s
  - [ ] Fallback: se WhatsApp fallisce dopo 3 retry → invia via Email
  - [ ] metadata.root.set("progress", 20 + (sent/total \* 70))

  **Task 3: finalize-notification-job**

  - [ ] Conta sent/failed/pending
  - [ ] Update notification_jobs: status = completed, result_summary
  - [ ] metadata.root.set("progress", 100)

### Twilio WhatsApp Setup

[Goal: WhatsApp Business API configurato con template messages approvati]

- [ ] Create `lib/twilio.ts` - Twilio client helper
- [ ] Create WhatsApp message templates in Twilio Console:
  - [ ] `schedule_published`: "Ciao {{1}}, il tuo orario per la settimana {{2}} e pronto. Vedi qui: {{3}}"
  - [ ] `shift_changed`: "Ciao {{1}}, il tuo turno di {{2}} e stato modificato. Nuovo orario: {{3}}. Dettagli: {{4}}"
  - [ ] `sick_leave_sub`: "Ciao {{1}}, puoi coprire il turno di {{2}} il {{3}} dalle {{4}} alle {{5}}? Rispondi SI per confermare."
  - [ ] `report_ready`: "Dott. {{1}}, il report di {{2}} per {{3}} e pronto. Scarica qui: {{4}}"
- [ ] Submit templates per approvazione Meta (1-7 giorni)

### Resend Email Setup

[Goal: Email transazionali con template HTML branded]

- [ ] Create `lib/resend.ts` - Resend client helper
- [ ] Create email templates con React Email:
  - [ ] `schedule-published.tsx` - Orario settimanale con tabella turni
  - [ ] `shift-changed.tsx` - Notifica cambio turno
  - [ ] `report-ready.tsx` - Report disponibile con link download
  - [ ] `invitation.tsx` - Invito dipendente/commercialista

### Integration: Pubblica Orario → Notifiche

[Goal: Quando titolare pubblica l'orario, notifiche partono automaticamente]

- [ ] Update publishSchedule action:
  - [ ] Set schedule.status = "published", published_at, published_by_user_id
  - [ ] Fire-and-forget: tasks.trigger("prepare-notifications", { event: "schedule_published", scheduleId })
- [ ] Update sick leave assign action:
  - [ ] Fire-and-forget: tasks.trigger("prepare-notifications", { event: "sick_leave_replacement", shiftId })

### Webhook Endpoints

[Goal: Ricevi conferme di delivery da Twilio e Stripe]

- [ ] Create `app/api/webhooks/whatsapp/route.ts` - Twilio delivery status
  - [ ] Update notification.delivery_status based on Twilio callback
- [ ] Create `app/api/webhooks/stripe/route.ts` - Stripe payment events (minimal)
  - [ ] Handle invoice.payment_succeeded: send payment receipt email
  - [ ] Handle customer.subscription.deleted: send cancellation email
  - [ ] DO NOT sync subscription data to database

---

## Phase 9: Monthly Report Generation & Accountant Portal ✅

**Goal**: Report PDF/CSV/Excel, portale commercialista. *Implementato in sync (app/actions/reports.ts).*

### Database Schema: Reports

- [x] reports, report-generation-jobs, italian-holidays
  - [ ] Fields: id, organization_id, month, status (draft/ready/sent_to_accountant), pdf_url, csv_url, excel_url, summary (JSONB), details_by_employee (JSONB), details_by_location (JSONB), sent_to_accountant_at, created_by_user_id, created_at
  - [ ] UNIQUE (organization_id, month)
- [ ] Create `drizzle/schema/report-generation-jobs.ts`
  - [ ] Fields: id, organization_id, report_id, month, status, progress_percentage, trigger_job_id, error_message, created_at, completed_at
- [ ] Create `drizzle/schema/italian-holidays.ts`
  - [ ] Fields: id, date (UNIQUE), name, year
  - [ ] Seed data: festivita italiane 2025-2030 (Capodanno, Epifania, Pasqua, 25 Aprile, 1 Maggio, 2 Giugno, Ferragosto, 1 Novembre, 8 Dicembre, Natale, S. Stefano)
- [ ] Run migration + seed festivita

### Supabase Storage: Reports Bucket

[Goal: Storage configurato per i file report generati]

- [ ] Create Supabase Storage bucket `reports` con RLS policy
  - [ ] Owner/Manager: read own org reports
  - [ ] Accountant: read client org reports
  - [ ] Service role: write (per Trigger.dev upload)

### Trigger.dev Report Workflow

[Goal: Genera PDF + CSV + Excel con dati mensili aggregati per dipendente e locale]

- [ ] Install `@react-pdf/renderer` + `exceljs` + `csv-stringify`
- [ ] Create `trigger/monthly-report.ts` with 4-task workflow:

  **Task 1: aggregate-monthly-data**

  - [ ] Query tutti shifts del mese per organizzazione
  - [ ] Query employee_time_off (malattia, ferie) del mese
  - [ ] Query italian_holidays del mese
  - [ ] Per ogni dipendente: calcola ore ordinarie, straordinarie (>40h/sett), festive, malattia, ferie
  - [ ] Per ogni locale: calcola ore totali, costo, numero dipendenti
  - [ ] metadata.root.set("progress", 40)

  **Task 2: generate-report-files (Parallel)**

  - [ ] Promise.all([generatePDF(), generateCSV(), generateExcel()])
  - [ ] PDF: tabella riepilogo + dettaglio per dipendente + dettaglio per locale
  - [ ] CSV: tabella piatta esportabile (dipendente, ore_ord, ore_str, ore_fest, malattia, ferie, totale, costo)
  - [ ] Excel: multi-sheet (Riepilogo, Per Dipendente, Per Locale)
  - [ ] Upload tutti su Supabase Storage bucket "reports"
  - [ ] metadata.root.set("progress", 85)

  **Task 3: save-report-metadata**

  - [ ] Create/update reports record: pdf_url, csv_url, excel_url, summary JSONB, details JSONB
  - [ ] metadata.root.set("progress", 95)

  **Task 4: notify-accountant (fire-and-forget)**

  - [ ] IF accountant connected: trigger Notification Dispatch (event: report_ready)
  - [ ] Does NOT block workflow completion
  - [ ] metadata.root.set("progress", 100)

### Report Pages (Owner)

[Goal: Titolare visualizza, genera e gestisce i report mensili]

- [ ] Build `app/(protected)/reports/page.tsx` - Lista report
  - [ ] Header: Commercialista collegato badge (✅ o ⚙️ Setup)
  - [ ] Bottone [📊 Genera Report Mese Corrente]
  - [ ] Lista report generati: mese, stato (inviato/non inviato), riepilogo, download buttons
  - [ ] Per ogni report: [📄 PDF] [📊 CSV] [📗 Excel] [👁 Vedi]
- [ ] Build `app/(protected)/reports/[id]/page.tsx` - Anteprima report
  - [ ] Riepilogo generale: dipendenti attivi, ore totali per tipo, costo stimato
  - [ ] Tabella dettaglio per dipendente: nome, contratto, ore ord/str/fest, malattia, ferie, totale, costo
  - [ ] Tabella dettaglio per locale: ore totali, costo, numero dipendenti
  - [ ] Bottoni download + [📧 Reinvia al Commercialista]

### Accountant Portal

[Goal: Il commercialista accede al proprio portale, vede tutti i clienti e scarica i report]

- [ ] Build `app/(protected)/accountant/page.tsx` - Dashboard commercialista
  - [ ] Lista clienti (organizzazioni collegate) con: nome, sedi, dipendenti, ultimo report, stato
  - [ ] Per ogni cliente: download buttons (PDF/CSV/Excel) per ultimo report
  - [ ] [📥 Scarica Tutti i Report Mese] → ZIP download
- [ ] Build `app/(protected)/accountant/[clientId]/[month]/page.tsx` - Dettaglio report cliente
  - [ ] Stessa vista di reports/[id] ma dal contesto commercialista

### Accountant Invitation Flow

[Goal: Titolare invita il commercialista, che accede al portale con un click]

- [ ] Build `app/(protected)/settings/accountant/page.tsx` - Gestione commercialista
  - [ ] Form: email + telefono commercialista
  - [ ] [Invita Commercialista] → crea invito + trigger notification (WhatsApp + Email con link)
  - [ ] Stato invito: pendente / accettato / revocato
- [ ] Create `app/actions/accountant.ts` - Server Actions
  - [ ] inviteAccountant: create invitation + trigger Notification Dispatch
  - [ ] revokeAccountant: update accountant_clients.status = "revoked"
- [ ] Update invite accept flow: se role=accountant → create accountant_clients record + redirect /accountant

### Vercel Cron: Auto Monthly Report

[Goal: Il primo del mese, se il titolare ha attivato l'opzione, il report viene generato e inviato automaticamente]

- [ ] Create `app/api/cron/monthly-report/route.ts`
  - [ ] Vercel Cron schedule: `0 6 1 * *` (ore 6:00 del primo di ogni mese)
  - [ ] Query organizzazioni con report_settings.auto_generate_day = 1
  - [ ] Per ciascuna: trigger report generation workflow
- [ ] Add cron config in `vercel.json`

---

## Phase 10: Employee Mobile Experience ✅

**Goal**: Dipendenti vedono turni, gestiscono preferenze e richieste.

### Pages

- [x] `my-schedule/page.tsx` - Vista turni settimanale
- [x] `my-preferences/page.tsx` - Griglia disponibilità
- [x] `my-requests/page.tsx` - Richieste (cambio turno, ferie, permesso, malattia)
- [x] `requests/page.tsx` - Approva/Rifiuta (Owner/Manager)

---

## Phase 11: Profile, Subscription & Settings ✅

**Goal**: Titolare gestisce profilo organizzazione, abbonamento (via Stripe Portal), e impostazioni (regole turni, notifiche, report). Usage tracking visibile.

### Profile & Subscription

[Goal: Pagina profilo con info account, stato abbonamento da Stripe API e usage stats]

- [x] Build `app/(protected)/profile/page.tsx` - Profilo completo
  - [x] Account card: nome organizzazione, email, ruolo
  - [x] Abbonamento card: Query Stripe API con stripe_customer_id → mostra piano, trial
  - [x] [Gestisci Abbonamento] → genera Stripe Portal URL → redirect
  - [x] Utilizzo card: sedi X/Y, dipendenti X/Y, AI generazioni mese, report inviati (query usage_tracking)
  - [x] Progress bars per ogni quota

### Database Schema: Usage Tracking

[Goal: Tabella per tracciamento quota mensile]

- [x] Create `drizzle/schema/usage-tracking.ts`
  - [x] Fields: id, organization_id, month, locations_count, employees_count, ai_generations_count, reports_generated_count, whatsapp_messages_sent, email_messages_sent, created_at, updated_at
  - [x] UNIQUE (organization_id, month)
- [x] Create `lib/usage.ts` - Usage helpers
  - [x] getOrCreateMonthlyUsage(orgId)
  - [x] incrementUsage(orgId, field)
  - [x] checkQuota(orgId, resource) → query Stripe plan + compare with usage
- [x] Integrate quota checks into: createLocation, createEmployee, AI generation, report generation

### Settings Pages

[Goal: Titolare configura regole turni, preferenze report e canali notifica]

- [x] Build `app/(protected)/settings/page.tsx` - Hub impostazioni
- [x] Build `app/(protected)/settings/work-rules/page.tsx`
  - [x] Riposo minimo tra turni (ore)
  - [x] Giorni consecutivi massimi
  - [x] Soglia straordinario (ore/settimana)
- [x] Build `app/(protected)/settings/notifications/page.tsx`
  - [x] Per ogni evento: canali attivi (WhatsApp ✅, Email ✅)
  - [x] Toggle on/off per tipo notifica

---

## Phase 12: CSV Import ✅

**Goal**: Titolare importa lista dipendenti da CSV (export dal gestionale o Excel). Validazione, dedup e import batch in background.

### 🚨 IMPLEMENTATION SOURCE: Workflow 4 from trigger_workflows_summary.md

### Database Schema: Import Jobs

[Goal: Tabella per tracking import CSV]

- [x] Create `drizzle/schema/import-jobs.ts`
  - [x] Fields: id, organization_id, file_name, file_url, total_rows, status, progress_percentage, trigger_job_id, result_summary (JSONB), error_message, created_at, completed_at
- [x] Run migration

### Supabase Storage: Imports Bucket

- [x] Create Supabase Storage bucket `imports` (setup-storage.ts)

### CSV Import Workflow

- [x] Install `papaparse`
- [x] Create `trigger/csv-import.ts` with 3-task workflow:

  **Task 1: parse-and-validate-csv** (inline in csvImportWorkflow)

  - [x] Download CSV da Supabase Storage
  - [x] Parse con Papaparse
  - [x] Auto-mapping colonne: nome, cognome, email, telefono, mansione, contratto, ore_settimanali
  - [x] Validazione per riga: required fields, email format, phone format
  - [x] Duplicate detection (email/phone vs employees esistenti)
  - [x] IF >50% righe invalide: FAIL fast con lista errori
  - [x] progress 0→40%

  **Task 2: create-employee-records**

  - [x] Batch INSERT employees per righe valide
  - [x] Create employee_roles per mansioni mappate
  - [x] Skip duplicati (non sovrascrivere)
  - [x] progress 40→80%

  **Task 3: finalize-import**

  - [x] Update import_jobs: result_summary { imported, errors, skipped }
  - [x] Cleanup: delete CSV temporaneo da Storage
  - [x] progress 100%

### CSV Import UI

[Goal: Upload CSV con preview risultati e gestione errori]

- [x] Add [📥 Import CSV] button nella lista dipendenti
- [x] Build `components/employees/csv-import-modal.tsx`
  - [x] Drop zone per file CSV
  - [x] [Importa] → upload CSV su Storage + trigger workflow
  - [x] Progress bar durante import
  - [x] Risultati: X importati, Y errori, Z duplicati (skipped)
  - [x] Lista errori dettagliata con riga e motivo

---

## Phase 13: Admin Panel ✅

**Goal**: Super admin monitora la piattaforma: metriche sistema, revenue, gestione utenti e piani.

### Admin Dashboard

[Goal: Vista operativa della piattaforma per il super admin]

- [x] Build `app/(protected)/admin/page.tsx` - Dashboard admin

  - [x] KPI: organizzazioni totali, utenti totali, trial, alert
  - [x] Organizzazioni recenti con piano e stato
  - [x] Alert: trial in scadenza, pagamenti falliti

- [x] Build `app/(protected)/admin/organizations/page.tsx` - Gestione organizzazioni

  - [x] Lista organizzazioni con: nome, piano, sedi, dipendenti, creato il
  - [x] Filtri: ricerca, paid/trial
  - [x] Azioni: [Estendi Trial]

- [x] Build `app/(protected)/admin/analytics/page.tsx` - Analytics
  - [x] Distribuzione piani (trial/paid/free)
  - [x] Utilizzo mensile (sedi, dipendenti, AI, report)
  - [x] Trend iscrizioni utenti

---

## Phase 14: Final Implementation Sweep

**Goal**: Handle any remaining requirements, polish, and ensure 100% coverage of prep documents

### Remaining Requirements

[Background: Catch-all for edge cases and smaller requirements]

- [ ] Review ALL prep documents for any unaddressed requirements
- [x] PWA manifest.json per mobile (service worker opzionale)
- [x] Responsive polish: toolbar wrap, dropdown Azioni, sidebar collassabile, touch scroll (023)
- [x] Error boundaries (ErrorBoundary nel layout protetto)
- [x] Loading states e skeletons (protected, dashboard, schedule)
- [x] Empty states (sedi, dipendenti, programmazione)
- [x] Toast notifications (sonner) per azioni principali (create/edit/delete, approve/reject, extend trial)
- [x] SEO: meta tags, Open Graph per landing page
- [ ] Performance: lazy loading per scheduler grande, virtualizzazione griglia se >20 dipendenti
- [x] Test end-to-end: onboarding → primo orario → pubblica (024, `npm run e2e:onboarding`)
- [ ] Security review: RLS policies, input sanitization, rate limiting
- [ ] Verify all 24 database tables created and populated with correct indexes
- [ ] Verify all 6 Trigger.dev workflows functional with proper error handling
- [ ] Verify Stripe integration: checkout, portal, webhook
- [ ] Verify WhatsApp + Email notifications delivered correctly
- [ ] Documentation: README con setup instructions per development

### Cosa manca (priorità)

1. ~~**Test E2E**~~ – Fatto (024)
2. **Security review** – RLS, input validation, rate limiting
3. **Verifica integrazioni** – Stripe, Trigger.dev CSV, notifiche
4. **Virtualizzazione griglia** – Scheduler >20 dipendenti (opzionale)
5. **Documentation** – README setup, checklist deploy

*Completati: copyStaffingFrom* (016), Vista Per Dipendente/Ruolo (017), responsive (023), E2E onboarding (024).*

---

## 📊 Phase Summary

| Phase | Feature               | Key Deliverable                        | Stato |
| ----- | --------------------- | -------------------------------------- | ----- |
| 0     | Project Setup         | Dev environment ready                  | ✅ |
| 1     | Landing Page          | Marketing page live                    | ✅ |
| 2     | Auth & Multi-Tenant   | Signup/login + org creation + RLS      | ✅ |
| 3     | Onboarding            | 5-step wizard, org configured         | ✅ |
| 4     | Locations & Employees | Full CRUD with constraints            | ✅ |
| 5     | Scheduler Core        | Drag & drop grid with validation       | ✅ |
| 6     | Dashboard             | KPI overview + alerts                 | ✅ |
| 7     | AI Scheduling         | AI generation + conflict resolution    | ✅ |
| 8     | Notifications         | WhatsApp + Email batch dispatch       | ✅ |
| 9     | Reports & Accountant  | PDF/CSV/Excel + accountant portal     | ✅ |
| 10    | Employee Mobile       | Schedule view + preferences + requests| ✅ |
| 11    | Profile & Settings    | Subscription + usage + config         | ✅ |
| 12    | CSV Import            | Batch employee import                 | ✅ |
| 13    | Admin Panel           | Platform monitoring                   | ✅ |
| 14    | Final Sweep           | Polish + testing + security           | 🔄 |

**Completate: 14/15 fasi** | Est. totale: 8-10 settimane

---

## 🔑 Key Technical Decisions

- **Feature-based phases**: Every phase delivers complete user functionality (DB + UI + backend + integration)
- **Scheduler before AI**: Build manual scheduling (Phase 5) before AI generation (Phase 7) so the grid works independently
- **Notifications after AI**: Phase 8 depends on Phase 7 because "Pubblica" needs to trigger notifications
- **Reports after scheduling**: Phase 9 needs shifts data from Phases 5-7 to aggregate
- **Employee mobile after core**: Phase 10 builds on top of the scheduling data created in earlier phases
- **Usage tracking late**: Phase 11 integrates quota enforcement after all features that consume quotas exist
- **CSV import optional**: Phase 12 is a convenience feature, not blocking any other phase
- **Stripe minimal**: No custom billing UI, query Stripe API real-time, link to Stripe Portal
- **Organization-centric**: All data scoped to organization_id, not user_id
- **RLS from day 1**: Row Level Security enabled from Phase 2, never disabled
