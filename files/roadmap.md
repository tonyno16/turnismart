# TurniSmart Development Roadmap

## App Summary

**App:** SaaS italiano per scheduling personale multi-sede con AI optimization e report automatici per commercialista
**Stack:** Next.js 15 + Supabase + Trigger.dev v4 + Stripe + Twilio WhatsApp + Resend + OpenAI GPT-4
**Developer:** Solo developer
**Database:** 24 tabelle PostgreSQL, organization-centric multi-tenant con RLS
**Background Jobs:** 6 workflow Trigger.dev, 18 task totali

---

## 🚨 Phase 0: Project Setup (MANDATORY FIRST STEP)

**Goal**: Prepare development environment, install dependencies, configure all external services
**⚠️ CRITICAL**: This phase must be completed before any other development work begins

### Run Setup Analysis

[Background: Essential first step to understand current template state and requirements]

- [ ] **REQUIRED**: Run `setup.md` using **claude-4-sonnet-1m** on **max mode** for maximum context
- [ ] Review generated setup analysis and recommendations
- [ ] Verify development environment is properly configured

### Project Initialization

[Goal: Scaffold Next.js project with all core dependencies configured]

- [ ] Create Next.js 15 project with App Router + TypeScript
- [ ] Install and configure Tailwind CSS v4
- [ ] Install Drizzle ORM + `drizzle-kit` + `postgres` driver
- [ ] Install `@supabase/supabase-js` + `@supabase/ssr`
- [ ] Install `@trigger.dev/sdk` v4 + `@trigger.dev/react-hooks`
- [ ] Install `stripe` + `@stripe/stripe-js`
- [ ] Install `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`
- [ ] Install `openai`, `twilio`, `resend`
- [ ] Install utility libs: `date-fns`, `zod`, `lucide-react`, `sonner`

### Environment Configuration

[Goal: All external service connections verified and working]

- [ ] Create `.env.local` with all required variables:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `DATABASE_URL` (Supabase PostgreSQL connection string)
  - `TRIGGER_SECRET_KEY` (Trigger.dev project key)
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `OPENAI_API_KEY`
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`
  - `RESEND_API_KEY`
  - `NEXT_PUBLIC_APP_URL`
- [ ] Configure Supabase project (Auth, Database, Storage)
- [ ] Configure Trigger.dev project and connect
- [ ] Configure Stripe products and pricing (Starter €9.99, Pro €24.99, Business €49.99)
- [ ] Verify all env vars are set and services respond

### Folder Structure

[Goal: Establish project organization matching system architecture]

- [ ] Create folder structure:
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
  drizzle/
    schema/            # All Drizzle table schemas
    migrations/        # Generated migrations
  ```
- [ ] Document any critical findings before proceeding to Phase 1

---

## Phase 1: Landing Page & Branding

**Goal**: Professional landing page che converte visitatori in trial users. Il visitatore capisce cosa fa l'app e puo registrarsi.

### Landing Page Implementation

[Background: Prima impressione dell'app, deve comunicare valore in 5 secondi]

- [ ] Build `app/(public)/page.tsx` - Landing page completa
  - [ ] Hero section: headline "Crea gli orari del personale in pochi minuti, non in ore" + CTA "Prova Gratis per 30 Giorni"
  - [ ] "Come Funziona" section: 3 step (Configura → Genera con AI → Pubblica)
  - [ ] Features grid: 6 card (AI Scheduling, Multi-Sede, Report Auto, Drag & Drop, WhatsApp, Mobile)
  - [ ] Pricing section: 3 piani (Starter €9.99, Pro €24.99, Business €49.99) con feature comparison
  - [ ] FAQ accordion: 4-6 domande frequenti
  - [ ] Footer: Privacy, Termini, Contatti

### Legal Pages

[Goal: Pagine obbligatorie per SaaS italiano]

- [ ] Build `app/(public)/privacy/page.tsx` - Privacy Policy GDPR-compliant
- [ ] Build `app/(public)/terms/page.tsx` - Termini di Servizio
- [ ] Build `app/(public)/refund/page.tsx` - Politica Rimborsi (14 giorni)

---

## Phase 2: Authentication & Multi-Tenant Foundation

**Goal**: Utenti possono registrarsi, fare login, e creare la propria organizzazione. Sistema multi-tenant funzionante con isolamento dati.

### Database Schema: Identity & Multi-Tenancy

[Goal: Creare le tabelle fondamentali su cui tutto il resto si basa]

- [ ] Create `drizzle/schema/organizations.ts`
  - [ ] Fields: id, name, slug, sector, logo_url, phone, email, stripe_customer_id, trial_ends_at, onboarding_completed, created_at, updated_at
  - [ ] UNIQUE constraint su slug e stripe_customer_id
- [ ] Create `drizzle/schema/users.ts`
  - [ ] Fields: id (match Supabase Auth), organization_id (FK nullable), email, full_name, phone, avatar_url, role (owner/manager/employee/accountant/admin), is_active, created_at, updated_at
  - [ ] UNIQUE constraint su email
- [ ] Create `drizzle/schema/invitations.ts`
  - [ ] Fields: id, organization_id, invited_by_user_id, email, phone, role, token (UNIQUE), status, expires_at, accepted_at, created_at
- [ ] Create `drizzle/schema/accountant-clients.ts`
  - [ ] Fields: id, accountant_user_id, organization_id, status, invited_at, accepted_at
  - [ ] UNIQUE constraint su (accountant_user_id, organization_id)
- [ ] Run `drizzle-kit generate` + `drizzle-kit migrate` per applicare migration
- [ ] Enable Row Level Security su tutte le tabelle con policy per organization_id

### Supabase Auth Configuration

[Goal: Autenticazione funzionante con email/password e Google OAuth]

- [ ] Configure Supabase Auth providers: email/password + Google OAuth
- [ ] Create `lib/supabase/server.ts` - Server-side Supabase client
- [ ] Create `lib/supabase/client.ts` - Client-side Supabase client
- [ ] Create `middleware.ts` - Auth check + role guard + org isolation
  - [ ] Public routes: /, /privacy, /terms, /refund, /auth/*
  - [ ] Protected routes: /app/* (require auth)
  - [ ] Role-based routing: /admin/* (admin only), /accountant/* (accountant only)

### Auth Pages

[Goal: Flusso signup/login completo e funzionante]

- [ ] Build `app/(public)/auth/sign-up/page.tsx` - Registrazione (email + password + full name)
- [ ] Build `app/(public)/auth/login/page.tsx` - Login (email + password + Google OAuth)
- [ ] Build `app/(public)/auth/forgot-password/page.tsx` - Reset password
- [ ] Build `app/(public)/auth/verify-email/page.tsx` - Conferma email
- [ ] Build `app/(public)/auth/invite/[token]/page.tsx` - Accetta invito (dipendente/commercialista)
- [ ] Create `app/actions/auth.ts` - Server Actions per signup, login, invite accept
  - [ ] On signup: create user + create organization (role=owner) + set trial_ends_at = 30 days
  - [ ] On invite accept: create user + link to existing organization with invited role

### Organization Setup

[Goal: Nuovo utente crea automaticamente la propria organizzazione al signup]

- [ ] Auto-create organization on signup (with sector selection)
- [ ] Create `lib/auth.ts` - getCurrentUser(), getCurrentOrganization(), requireRole()
- [ ] Create `lib/organizations.ts` - getOrganization(), updateOrganization()

---

## Phase 3: Onboarding Wizard & Core Data Setup

**Goal**: Nuovo titolare completa il setup iniziale in 10 minuti: tipo attivita, locali, ruoli, fabbisogno, primi dipendenti. Al termine l'app e pronta per creare il primo orario.

### Database Schema: Locations, Roles, Staffing

[Goal: Tabelle per locali, mansioni e fabbisogno personale]

- [ ] Create `drizzle/schema/locations.ts`
  - [ ] Fields: id, organization_id, name, address, phone, opening_hours (JSONB), is_active, sort_order, created_at, updated_at
- [ ] Create `drizzle/schema/roles.ts`
  - [ ] Fields: id, organization_id, name, color, icon, is_active, sort_order, created_at
  - [ ] UNIQUE (organization_id, name)
- [ ] Create `drizzle/schema/staffing-requirements.ts`
  - [ ] Fields: id, location_id, role_id, day_of_week (0-6), shift_period (morning/afternoon/evening), required_count, created_at, updated_at
  - [ ] UNIQUE (location_id, role_id, day_of_week, shift_period)
- [ ] Create `drizzle/schema/organization-settings.ts`
  - [ ] Fields: id, organization_id (UNIQUE), work_rules (JSONB), report_settings (JSONB), notification_settings (JSONB), created_at, updated_at
  - [ ] Default work_rules: { min_rest_between_shifts_hours: 11, max_consecutive_days: 6, overtime_threshold_hours: 40 }
- [ ] Run migration

### Onboarding Wizard

[Goal: Flusso guidato in 5 step per configurare l'attivita da zero]

- [ ] Build `app/(protected)/onboarding/page.tsx` - Wizard multi-step
  - [ ] Step 1: Tipo attivita (ristorante, bar, hotel, retail, RSA, altro) → pre-popola ruoli suggeriti
  - [ ] Step 2: Primo locale (nome, indirizzo, orari apertura)
  - [ ] Step 3: Fabbisogno personale (griglia ruolo x giorno x fascia, editabile)
  - [ ] Step 4: Primi dipendenti (form rapido: nome, cognome, telefono, mansione, ore settimanali)
  - [ ] Step 5: Riepilogo + "Inizia a creare l'orario!"
- [ ] Create `app/actions/onboarding.ts` - Server Actions per ogni step
  - [ ] completeStep1: set organization.sector + create default roles per sector
  - [ ] completeStep2: create location + opening_hours
  - [ ] completeStep3: create staffing_requirements records
  - [ ] completeStep4: create employees + employee_roles
  - [ ] completeStep5: set organization.onboarding_completed = true → redirect to /app/dashboard
- [ ] Create seed data per sector (ruoli suggeriti):
  - [ ] Ristorante: Cameriere, Cuoco, Lavapiatti, Barista, Maitre
  - [ ] Bar: Barista, Cameriere
  - [ ] Hotel: Receptionist, Housekeeping, Portiere, Cameriere
  - [ ] RSA: Operatore OSS, Infermiere, Medico, Ausiliario
  - [ ] Retail: Cassiere, Commesso, Magazziniere
- [ ] Redirect logic: se onboarding_completed = false → redirect a /onboarding

---

## Phase 4: Location & Employee Management (CRUD)

**Goal**: Titolare gestisce completamente locali e dipendenti: aggiunge, modifica, rimuove locali con fabbisogno; gestisce anagrafica dipendenti con contratto, mansioni, disponibilita e incompatibilita.

### Database Schema: Employees & Contracts

[Goal: Tabelle complete per anagrafica dipendenti e tutti i vincoli]

- [ ] Create `drizzle/schema/employees.ts`
  - [ ] Fields: id, organization_id, user_id (nullable FK), first_name, last_name, email, phone, contract_type, weekly_hours, max_weekly_hours, hourly_rate, overtime_rate, holiday_rate, preferred_location_id, is_active, hired_at, notes, created_at, updated_at
- [ ] Create `drizzle/schema/employee-roles.ts`
  - [ ] Fields: id, employee_id, role_id, is_primary, created_at
  - [ ] UNIQUE (employee_id, role_id)
- [ ] Create `drizzle/schema/employee-availability.ts`
  - [ ] Fields: id, employee_id, day_of_week, shift_period, status (available/unavailable/preferred), created_at, updated_at
  - [ ] UNIQUE (employee_id, day_of_week, shift_period)
- [ ] Create `drizzle/schema/employee-incompatibilities.ts`
  - [ ] Fields: id, organization_id, employee_a_id, employee_b_id, reason, created_at
  - [ ] UNIQUE (employee_a_id, employee_b_id) con CHECK (a < b)
- [ ] Create `drizzle/schema/employee-time-off.ts`
  - [ ] Fields: id, employee_id, type (vacation/personal_leave/sick_leave/other), start_date, end_date, status (pending/approved/rejected), approved_by_user_id, notes, created_at
- [ ] Run migration

### Location Management Pages

[Goal: Titolare visualizza, aggiunge e modifica locali con tutto il fabbisogno personale]

- [ ] Build `app/(protected)/locations/page.tsx` - Lista locali come cards
  - [ ] Card per locale: nome, indirizzo, orari, numero dipendenti, stato (configurato/incompleto)
  - [ ] Azioni: [Modifica] [Vedi Orario] [Completa Setup]
  - [ ] Bottone [+ Aggiungi Locale] (con check quota piano)
- [ ] Build `app/(protected)/locations/[id]/page.tsx` - Dettaglio locale
  - [ ] Info locale editabili (nome, indirizzo, telefono, orari apertura)
  - [ ] Griglia fabbisogno personale (ruolo x giorno x fascia) editabile inline
  - [ ] [+ Aggiungi Ruolo], [Copia da Turno], [Copia da altro Locale]
  - [ ] Lista dipendenti assegnati a questo locale
  - [ ] Statistiche: turni/sett, costo stimato, % copertura
- [ ] Create `app/actions/locations.ts` - Server Actions
  - [ ] createLocation, updateLocation, deleteLocation
  - [ ] updateStaffingRequirements (batch update griglia)
  - [ ] copyStaffingFromShift, copyStaffingFromLocation

### Employee Management Pages

[Goal: Titolare gestisce anagrafica completa dipendenti con contratto, mansioni e vincoli]

- [ ] Build `app/(protected)/employees/page.tsx` - Lista dipendenti con tabella
  - [ ] Colonne: Nome, Mansioni (badges), Sede, Ore contratto
  - [ ] Filtri: [Mansione ▼] [Locale ▼] [Contratto ▼]
  - [ ] Cerca per nome
  - [ ] Bottoni [+ Aggiungi] [📥 Import CSV]
  - [ ] Paginazione
- [ ] Build `app/(protected)/employees/[id]/page.tsx` - Dettaglio dipendente
  - [ ] Profilo e contratto editabile (nome, email, telefono, tipo contratto, ore, paga)
  - [ ] Mansioni assegnate (multi-select con primary badge)
  - [ ] Griglia disponibilita settimanale (giorno x fascia: disponibile/non disp./preferito)
  - [ ] Incompatibilita colleghi (lista + [+ Aggiungi collega])
  - [ ] Sede preferita (select)
  - [ ] Orario corrente (solo lettura, turni questa settimana)
  - [ ] Storico ultimi 3 mesi (ore ord/straord, assenze, costo)
- [ ] Create `app/actions/employees.ts` - Server Actions
  - [ ] createEmployee, updateEmployee, toggleEmployeeActive
  - [ ] updateEmployeeRoles (batch), updateAvailability (batch)
  - [ ] createIncompatibility, removeIncompatibility
  - [ ] createTimeOff, approveTimeOff, rejectTimeOff
- [ ] Create `lib/employees.ts` - Query helpers
  - [ ] getEmployeesByOrganization(orgId, filters)
  - [ ] getEmployeeDetail(employeeId) - con roles, availability, incompatibilities
  - [ ] getEmployeeWeeklyHours(employeeId, weekStart) - somma ore dalla shifts table

---

## Phase 5: Scheduler Core (Drag & Drop)

**Goal**: Titolare vede la griglia orario settimanale, puo assegnare turni trascinando dipendenti sulla griglia, e gestisce turni manualmente con validazione conflitti in tempo reale. Tutto senza AI ancora.

### Database Schema: Schedules & Shifts

[Goal: Tabelle core per lo scheduling]

- [ ] Create `drizzle/schema/schedules.ts`
  - [ ] Fields: id, organization_id, week_start_date, status (draft/published/modified_after_publish), published_at, published_by_user_id, notes, created_at, updated_at
  - [ ] UNIQUE (organization_id, week_start_date)
- [ ] Create `drizzle/schema/shifts.ts`
  - [ ] Fields: id, schedule_id, organization_id, location_id, employee_id, role_id, date, start_time, end_time, break_minutes, is_auto_generated, status (active/cancelled/sick_leave), cancelled_reason, created_at, updated_at
  - [ ] Indexes: schedule_id, employee_id, location_id, (employee_id, date), organization_id
- [ ] Create `drizzle/schema/shift-requests.ts`
  - [ ] Fields: id, organization_id, employee_id, type (shift_swap/vacation/personal_leave/sick_leave), status, shift_id, swap_with_employee_id, start_date, end_date, reason, reviewed_by_user_id, reviewed_at, review_notes, created_at
- [ ] Run migration

### Navigation & Layout

[Goal: Sidebar role-based con navigazione a tutte le sezioni]

- [ ] Build `components/navigation/sidebar.tsx` - Sidebar responsive
  - [ ] Owner: Dashboard, Orario, Locali, Dipendenti, Report, Impostazioni
  - [ ] Manager: Dashboard, Orario (filtrato), Dipendenti (filtrato), Richieste
  - [ ] Mostra quota utilizzo in fondo (sedi/dip usati vs limite piano)
- [ ] Build `components/navigation/mobile-nav.tsx` - Bottom tab bar per mobile
  - [ ] Dipendente: Orario, Preferenze, Richieste, Profilo
- [ ] Implement role-based rendering (show/hide based on user.role)

### Scheduler Grid

[Goal: Griglia interattiva con 3 viste, drag & drop, e validazione conflitti real-time]

- [ ] Build `app/(protected)/schedule/page.tsx` - Scheduler page
  - [ ] Toolbar: navigazione settimana (← →), date range display
  - [ ] Vista tabs: [Per Locale] [Per Dipendente] [Per Ruolo]
  - [ ] Filtri: Locale select, Ruolo select
  - [ ] Bottoni: [🤖 Genera AI] (disabled, Phase 7) [📢 Pubblica] Status badge (Bozza/Pubblicato)
  - [ ] Barra fabbisogno: per ogni ruolo mostra assegnati/richiesti con colore (✅ completo, ⚠️ quasi, 🔴 scoperto)

- [ ] Build `components/schedule/schedule-grid.tsx` - Griglia principale
  - [ ] Vista Per Locale: righe = dipendenti, colonne = giorni (Lun-Dom), celle = turno assegnato
  - [ ] Vista Per Dipendente: righe = dipendenti (tutti i locali), colonne = giorni, mostra totale ore + alert
  - [ ] Vista Per Ruolo: raggruppato per mansione, mostra copertura

- [ ] Build `components/schedule/shift-cell.tsx` - Cella singola turno
  - [ ] Mostra: orario (es. "18-23"), ruolo badge, locale (se vista per dipendente)
  - [ ] Click → edit popup (cambia orario, ruolo, elimina)
  - [ ] Right-click → context menu (Segna Malattia, Cancella, Duplica)

- [ ] Build `components/schedule/employee-sidebar.tsx` - Sidebar dipendenti disponibili
  - [ ] Lista dipendenti con: nome, mansioni (badges), ore usate/totali, disponibilita oggi (🟢🟡🔴)
  - [ ] Filtro per mansione e cerca per nome
  - [ ] Draggable: trascina dipendente sulla griglia per assegnare

- [ ] Implement DnD Kit integration
  - [ ] `DndContext` wrapper per lo scheduler
  - [ ] `Draggable` su employee cards nella sidebar
  - [ ] `Droppable` su celle vuote nella griglia
  - [ ] onDragEnd handler: crea shift con employee + date + location + time slot

### Shift Validation (Client + Server)

[Goal: Ogni assegnazione turno viene validata per conflitti, ore max, riposi e incompatibilita]

- [ ] Create `lib/schedule-validation.ts` - Validation logic
  - [ ] checkOverlap(employeeId, date, startTime, endTime) - turno sovrapposto
  - [ ] checkMaxWeeklyHours(employeeId, weekStart, additionalHours) - sopra ore contratto
  - [ ] checkMinRestPeriod(employeeId, date, startTime) - minimo 11h riposo tra turni
  - [ ] checkIncompatibility(employeeId, locationId, date) - collega incompatibile nello stesso turno
  - [ ] checkAvailability(employeeId, dayOfWeek, shiftPeriod) - dipendente non disponibile
  - [ ] checkTimeOff(employeeId, date) - ferie/permesso approvato

- [ ] Build `components/schedule/conflict-popup.tsx` - Popup conflitto
  - [ ] Mostra tipo conflitto e dettaglio
  - [ ] Bottoni: [Assegna Comunque] [Annulla]

- [ ] Create `app/actions/shifts.ts` - Server Actions per CRUD turni
  - [ ] createShift (con validazione server-side completa)
  - [ ] updateShift, deleteShift, cancelShift
  - [ ] bulkCreateShifts (per assegnazione rapida)
  - [ ] publishSchedule (cambia status + triggera notifiche in Phase 7)
  - [ ] markSickLeave(shiftId) (cancella turno + triggera sostituti in Phase 7)

- [ ] Create `lib/schedules.ts` - Query helpers
  - [ ] getWeekSchedule(orgId, weekStart, locationId?)
  - [ ] getEmployeeWeekShifts(employeeId, weekStart)
  - [ ] getStaffingCoverage(locationId, weekStart) - assegnati vs richiesti per slot
  - [ ] getWeekStats(orgId, weekStart) - totale ore, costo stimato, turni scoperti

---

## Phase 6: Dashboard & Overview

**Goal**: Titolare ha una dashboard che mostra lo stato di salute di tutte le sedi con alert, KPI e azioni rapide. Vista rapida senza dover entrare nello scheduler.

### Dashboard Page

[Goal: Vista riassuntiva con cards KPI, griglia settimanale a semaforo, notifiche e azioni rapide]

- [ ] Build `app/(protected)/dashboard/page.tsx`
  - [ ] KPI cards: Dipendenti attivi oggi, Turni scoperti, Ore pianificate settimana, Costo stimato
  - [ ] Vista rapida settimana: griglia locali x giorni con semaforo (🟢 Coperto, 🟡 Quasi, 🔴 Scoperto, ⚫ Chiuso)
  - [ ] Sezione Notifiche/Alert: richieste cambio turno pendenti, malattie segnalate, dipendenti senza turni
  - [ ] Azioni Rapide: [Genera Orario Prossima Sett.] [Pubblica Orario] [Genera Report Mese]

- [ ] Create `lib/dashboard.ts` - Dashboard query helpers
  - [ ] getDashboardStats(orgId) - KPI aggregati
  - [ ] getWeekOverview(orgId, weekStart) - stato copertura per locale/giorno
  - [ ] getPendingAlerts(orgId) - richieste pendenti, malattie, scoperti

---

## Phase 7: AI Schedule Generation & Conflict Resolution

**Goal**: Titolare genera l'orario settimanale con un click usando l'AI. L'AI ottimizza tenendo conto di tutti i vincoli. Quando un dipendente si ammala, il sistema suggerisce automaticamente i 5 migliori sostituti.

### 🚨 IMPLEMENTATION SOURCE: `trigger_workflows_summary.md` - Workflow 1 (AI Schedule Generation) + Workflow 5 (Conflict Resolution)

### Database Schema: Job Tracking

[Goal: Tabelle per tracking dei background job AI]

- [ ] Create `drizzle/schema/schedule-generation-jobs.ts`
  - [ ] Fields: id, organization_id, schedule_id, week_start_date, location_ids (text[]), mode (full/fill_gaps/single_location), options (JSONB), status (pending/collecting/optimizing/validating/completed/failed/cancelled), progress_percentage, current_step, trigger_job_id, result_summary (JSONB), error_message, created_at, completed_at
- [ ] Run migration

### Trigger.dev Setup

[Goal: Trigger.dev configurato e primo workflow funzionante]

- [ ] Configure `trigger.config.ts` con project settings
- [ ] Create `trigger/ai-schedule-generation.ts` with 4-task workflow:

  **Task 1: collect-scheduling-constraints**
  - [ ] Query DB: locations + staffing_requirements per locali selezionati
  - [ ] Query DB: employees + employee_roles + employee_availability per org
  - [ ] Query DB: employee_incompatibilities per org
  - [ ] Query DB: employee_time_off per settimana target
  - [ ] Query DB: shifts settimane precedenti (per equita distribuzione)
  - [ ] Serializza come payload strutturato per GPT-4
  - [ ] metadata.root.set("progress", 20) + metadata.root.set("currentStep", "Raccolta vincoli completata")
  - [ ] Update schedule_generation_jobs: progress_percentage = 20

  **Task 2: optimize-schedule (OpenAI GPT-4 function calling)**
  - [ ] IF location_ids.length > 3: parallelizza per locale con Promise.all()
  - [ ] ELSE: singola chiamata GPT-4 per tutti i locali
  - [ ] Prompt: vincoli + fabbisogno + disponibilita → richiedi schedule JSON strutturato
  - [ ] Use function calling per output strutturato (array di shift assignments)
  - [ ] metadata.stream("schedule-preview") per preview live nel frontend
  - [ ] metadata.root.set("progress", 70)
  - [ ] Update schedule_generation_jobs: progress_percentage = 70
  - [ ] Retry: max 3 tentativi per chiamata OpenAI, backoff 5s/10s/20s

  **Task 3: validate-schedule**
  - [ ] Check conflitti: overlap turni stesso dipendente
  - [ ] Check ore max: dipendente supera weekly_hours contratto
  - [ ] Check riposo minimo: < 11h tra fine turno e inizio successivo
  - [ ] Check indisponibilita: turno in giorno/fascia non disponibile
  - [ ] Check incompatibilita: colleghi incompatibili nello stesso turno/locale
  - [ ] IF conflitti trovati AND tentativi < 3: ri-chiama GPT-4 con conflitti come feedback → auto-resolve
  - [ ] IF conflitti ancora dopo 3 tentativi: graceful degradation (orario parziale + lista turni scoperti)
  - [ ] metadata.root.set("progress", 90)

  **Task 4: save-schedule-results**
  - [ ] Create/update schedule record (status: draft)
  - [ ] Bulk INSERT shifts per tutti i turni generati (is_auto_generated = true)
  - [ ] Calcola result_summary: { shifts_created, unfilled_slots, cost_estimate, overtime_hours, conflicts_resolved, warnings }
  - [ ] Update schedule_generation_jobs: status = completed, progress = 100, result_summary
  - [ ] Update usage_tracking: increment ai_generations_count
  - [ ] metadata.root.set("progress", 100)

### AI Schedule Generation UI

[Goal: Bottone "Genera con AI" nello scheduler con progress bar real-time e preview]

- [ ] Enable "Genera con AI" button in scheduler toolbar
- [ ] Build `components/schedule/ai-generation-modal.tsx` - Modal di configurazione
  - [ ] Select locali target (tutti o specifici)
  - [ ] Select modalita: Genera nuovo / Riempi buchi / Solo questo locale
  - [ ] Opzioni: Ottimizza costi, Rispetta preferenze
  - [ ] [Genera] button → create job + trigger workflow
- [ ] Build `components/schedule/ai-progress-overlay.tsx` - Overlay progresso
  - [ ] Subscribe via useRealtimeRunWithStreams(job.trigger_job_id)
  - [ ] Progress bar 0-100% con animazione
  - [ ] Step corrente: "Raccolta vincoli..." → "Ottimizzazione turni..." → "Validazione..." → "Salvataggio..."
  - [ ] Checklist step completati (✅ / 🔄 / ⬜)
  - [ ] Tempo stimato restante
  - [ ] [Annulla] button
- [ ] Al completamento: refresh griglia scheduler con turni generati, mostra result_summary (turni creati, scoperti, warnings)

### AI Drag & Drop Suggestions

[Goal: Quando il drag & drop genera conflitto, l'AI suggerisce alternative]

- [ ] Create `app/api/ai/suggest/route.ts` - POST endpoint (<2 secondi)
  - [ ] Input: { employeeId, date, startTime, endTime, locationId, roleId }
  - [ ] Validazione conflitti completa (riuso lib/schedule-validation.ts)
  - [ ] IF conflitto: chiama OpenAI per 3 suggerimenti alternativi
  - [ ] Return: { valid, conflicts[], suggestions[] }
- [ ] Build `components/schedule/ai-suggest-popup.tsx` - Popup suggerimenti
  - [ ] Mostra conflitto rilevato
  - [ ] 3 suggerimenti AI: "Sposta a mercoledi", "Assegna Paolo", "Sposta Luigi al Nord"
  - [ ] Bottoni: [Assegna Comunque] [Accetta Suggerimento 1/2/3] [Annulla]

### Conflict Resolution: Sick Leave Substitutes

**🚨 IMPLEMENTATION SOURCE**: Workflow 5 from trigger_workflows_summary.md

- [ ] Create `trigger/conflict-resolution.ts` with 2-task workflow:

  **Task 1: find-best-substitutes**
  - [ ] Input: shiftId del turno scoperto
  - [ ] Query dipendenti con: stessa mansione (role_id), disponibili quel giorno/fascia, nessun turno sovrapposto, dentro ore contratto, nessuna incompatibilita con colleghi presenti
  - [ ] Ranking: 1) ore residue (piu = meglio), 2) sede preferita match, 3) equita (meno ore questa settimana = meglio), 4) costo (paga oraria piu bassa = meglio)

  **Task 2: prepare-substitute-suggestions**
  - [ ] Formatta top 5 sostituti con score (0-100)
  - [ ] metadata.root.set("suggestions", [...]) per real-time frontend

- [ ] Build `components/schedule/sick-leave-popup.tsx` - Popup sostituti
  - [ ] Header: "🤒 Malattia - [Nome]" + dettaglio turno scoperto
  - [ ] Lista 5 sostituti con: nome, mansione, ore residue/totali, sede preferita, score
  - [ ] Per ogni sostituto: [Assegna + Notifica WhatsApp]
  - [ ] Bottoni: [Lascia Scoperto] [Cerca Manualmente]
  - [ ] On "Assegna": create new shift + trigger notification dispatch (Phase 8)

---

## Phase 8: Notification System (WhatsApp + Email)

**Goal**: Quando l'orario viene pubblicato, i dipendenti ricevono automaticamente WhatsApp/Email con i propri turni. Notifiche anche per cambio turno, malattia e report.

### 🚨 IMPLEMENTATION SOURCE: Workflow 2 from trigger_workflows_summary.md

### Database Schema: Notifications

[Goal: Tabelle per logging notifiche e job tracking]

- [ ] Create `drizzle/schema/notifications.ts`
  - [ ] Fields: id, organization_id, recipient_user_id, recipient_employee_id, channel (whatsapp/email/in_app), event_type, subject, body, delivery_status (pending/sent/delivered/failed), external_id, sent_at, created_at
- [ ] Create `drizzle/schema/notification-jobs.ts`
  - [ ] Fields: id, organization_id, event_type, recipient_count, status, progress_percentage, trigger_job_id, result_summary (JSONB), error_message, created_at, completed_at
- [ ] Run migration

### Trigger.dev Notification Workflow

[Goal: Invio batch multi-canale (WhatsApp + Email) con retry e fallback]

- [ ] Create `trigger/notification-dispatch.ts` with 3-task workflow:

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
  - [ ] metadata.root.set("progress", 20 + (sent/total * 70))

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

## Phase 9: Monthly Report Generation & Accountant Portal

**Goal**: Titolare genera report mensili ore/costi con PDF/CSV/Excel. Il commercialista accede al portale, vede i clienti e scarica i report. Report generabile anche automaticamente il primo del mese.

### 🚨 IMPLEMENTATION SOURCE: Workflow 3 (Monthly Report) + Workflow 6 (Accountant Invitation) from trigger_workflows_summary.md

### Database Schema: Reports

[Goal: Tabelle per report e festivita italiane]

- [ ] Create `drizzle/schema/reports.ts`
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

## Phase 10: Employee Mobile Experience

**Goal**: I dipendenti usano l'app dal telefono per vedere i propri turni, gestire disponibilita e fare richieste di cambio turno/ferie.

### Employee Schedule View (Mobile-First)

[Goal: Dipendente vede i propri turni in formato mobile-friendly]

- [ ] Build `app/(protected)/my-schedule/page.tsx` - I miei turni
  - [ ] Vista settimanale/mensile con cards per ogni giorno
  - [ ] Ogni card: locale, orario, ruolo, colleghi in turno
  - [ ] Giorni liberi marcati
  - [ ] Navigazione settimana (← →)
  - [ ] Footer: ore settimana attuale / ore contratto, ore mese / ore mese target
  - [ ] Swipe per cambiare giorno (mobile gesture)

### Employee Preferences

[Goal: Dipendente gestisce la propria disponibilita e preferenze]

- [ ] Build `app/(protected)/my-preferences/page.tsx` - Le mie preferenze
  - [ ] Griglia disponibilita: giorno x fascia (Mattina/Pomeriggio/Sera), toggle ✅❌⭐
  - [ ] Sede preferita (dropdown)
  - [ ] Sedi escluse (checkboxes)
  - [ ] Incompatibilita colleghi (lista + aggiungi)
  - [ ] [Salva Preferenze] → update employee_availability + preferred_location + incompatibilities

### Shift Requests

[Goal: Dipendente puo richiedere cambio turno, ferie, permessi o segnalare malattia]

- [ ] Build `app/(protected)/my-requests/page.tsx` - Le mie richieste
  - [ ] Lista richieste con stato: pendente 🟡, approvata 🟢, rifiutata 🔴
  - [ ] [+ Nuova Richiesta] → form modale:
    - [ ] Tipo: Cambio turno / Ferie / Permesso / Malattia
    - [ ] Turno coinvolto (select da turni assegnati)
    - [ ] Date (per ferie/permesso: data inizio/fine)
    - [ ] Collega proposto per scambio (opzionale, per cambio turno)
    - [ ] Motivazione (testo libero)
  - [ ] On submit: create shift_request + notification to owner/manager

### Manager Request Approval

[Goal: Manager/Owner vedono e approvano/rifiutano le richieste dei dipendenti]

- [ ] Build `app/(protected)/requests/page.tsx` - Gestione richieste (Owner/Manager)
  - [ ] Lista richieste pendenti con: dipendente, tipo, turno, date, motivazione
  - [ ] Per ogni richiesta: [✅ Approva] [❌ Rifiuta] + note
  - [ ] On approva cambio turno: update shift assignments + notification
  - [ ] On approva ferie: create employee_time_off approved + notification

---

## Phase 11: Profile, Subscription & Settings

**Goal**: Titolare gestisce profilo organizzazione, abbonamento (via Stripe Portal), e impostazioni (regole turni, notifiche, report). Usage tracking visibile.

### Profile & Subscription

[Goal: Pagina profilo con info account, stato abbonamento da Stripe API e usage stats]

- [ ] Build `app/(protected)/profile/page.tsx` - Profilo completo
  - [ ] Account card: logo, nome organizzazione, email, telefono, [Modifica] [Cambia Password]
  - [ ] Abbonamento card: Query Stripe API con stripe_customer_id → mostra piano, rinnovo, metodo pagamento
  - [ ] [Gestisci Abbonamento] → genera Stripe Portal URL → redirect
  - [ ] Utilizzo card: sedi X/Y, dipendenti X/Y, AI generazioni mese, report inviati (query usage_tracking)
  - [ ] Progress bars per ogni quota

### Database Schema: Usage Tracking

[Goal: Tabella per tracciamento quota mensile]

- [ ] Create `drizzle/schema/usage-tracking.ts`
  - [ ] Fields: id, organization_id, month, locations_count, employees_count, ai_generations_count, reports_generated_count, whatsapp_messages_sent, email_messages_sent, created_at, updated_at
  - [ ] UNIQUE (organization_id, month)
- [ ] Create `lib/usage.ts` - Usage helpers
  - [ ] getOrCreateMonthlyUsage(orgId)
  - [ ] incrementUsage(orgId, field)
  - [ ] checkQuota(orgId, resource) → query Stripe plan + compare with usage
- [ ] Integrate quota checks into: createLocation, createEmployee, AI generation, report generation

### Settings Pages

[Goal: Titolare configura regole turni, preferenze report e canali notifica]

- [ ] Build `app/(protected)/settings/page.tsx` - Hub impostazioni
- [ ] Build `app/(protected)/settings/work-rules/page.tsx`
  - [ ] Riposo minimo tra turni (ore)
  - [ ] Giorni consecutivi massimi
  - [ ] Soglia straordinario (ore/settimana)
  - [ ] Durata minima/massima turno
- [ ] Build `app/(protected)/settings/notifications/page.tsx`
  - [ ] Per ogni evento: canali attivi (WhatsApp ✅, Email ✅, In-App ✅)
  - [ ] Toggle on/off per tipo notifica

---

## Phase 12: CSV Import

**Goal**: Titolare importa lista dipendenti da CSV (export dal gestionale o Excel). Validazione, dedup e import batch in background.

### 🚨 IMPLEMENTATION SOURCE: Workflow 4 from trigger_workflows_summary.md

### Database Schema: Import Jobs

[Goal: Tabella per tracking import CSV]

- [ ] Create `drizzle/schema/import-jobs.ts`
  - [ ] Fields: id, organization_id, file_name, file_url, total_rows, status, progress_percentage, trigger_job_id, result_summary (JSONB), error_message, created_at, completed_at
- [ ] Run migration

### Supabase Storage: Imports Bucket

- [ ] Create Supabase Storage bucket `imports` con RLS policy (write for owner, auto-delete after 7 days)

### CSV Import Workflow

- [ ] Install `papaparse`
- [ ] Create `trigger/csv-import.ts` with 3-task workflow:

  **Task 1: parse-and-validate-csv**
  - [ ] Download CSV da Supabase Storage
  - [ ] Parse con Papaparse
  - [ ] Auto-mapping colonne: nome, cognome, email, telefono, mansioni, contratto, ore_settimanali, paga_oraria
  - [ ] Validazione per riga: required fields, email format, phone format, mansione valida
  - [ ] Duplicate detection (email/phone vs employees esistenti)
  - [ ] IF >50% righe invalide: FAIL fast con lista errori
  - [ ] metadata.root.set("progress", 40)

  **Task 2: create-employee-records**
  - [ ] Batch INSERT employees per righe valide
  - [ ] Create employee_roles per mansioni mappate
  - [ ] Skip duplicati (non sovrascrivere)
  - [ ] metadata.root.set("progress", 85)

  **Task 3: finalize-import**
  - [ ] Update import_jobs: result_summary { imported, errors, duplicates, error_details }
  - [ ] Cleanup: delete CSV temporaneo da Storage
  - [ ] metadata.root.set("progress", 100)

### CSV Import UI

[Goal: Upload CSV con preview risultati e gestione errori]

- [ ] Add [📥 Import CSV] button nella lista dipendenti
- [ ] Build `components/employees/csv-import-modal.tsx`
  - [ ] Drop zone per file CSV
  - [ ] Preview prime 5 righe con mapping colonne
  - [ ] [Importa] → upload CSV su Storage + trigger workflow
  - [ ] Progress bar durante import
  - [ ] Risultati: X importati, Y errori, Z duplicati
  - [ ] Lista errori dettagliata con riga e motivo

---

## Phase 13: Admin Panel

**Goal**: Super admin monitora la piattaforma: metriche sistema, revenue, gestione utenti e piani.

### Admin Dashboard

[Goal: Vista operativa della piattaforma per il super admin]

- [ ] Build `app/(protected)/admin/page.tsx` - Dashboard admin
  - [ ] KPI: organizzazioni totali, utenti totali, MRR, churn rate
  - [ ] Organizzazioni recenti con piano e stato
  - [ ] Alert: trial in scadenza, pagamenti falliti, errori sistema

- [ ] Build `app/(protected)/admin/users/page.tsx` - Gestione utenti
  - [ ] Lista organizzazioni con: nome, piano, sedi, dipendenti, creato il
  - [ ] Filtri: piano, stato (active/trial/expired)
  - [ ] Azioni: [Sospendi] [Estendi Trial] [Dettaglio]

- [ ] Build `app/(protected)/admin/analytics/page.tsx` - Analytics
  - [ ] Revenue chart (MRR over time)
  - [ ] Conversioni trial → paid
  - [ ] Distribuzione piani
  - [ ] Feature usage (AI gen, report, notifiche)

---

## Phase 14: Final Implementation Sweep

**Goal**: Handle any remaining requirements, polish, and ensure 100% coverage of prep documents

### Remaining Requirements

[Background: Catch-all for edge cases and smaller requirements]

- [ ] Review ALL prep documents for any unaddressed requirements
- [ ] PWA configuration for mobile employee experience (manifest.json, service worker)
- [ ] Responsive polish: test all pages on mobile/tablet/desktop breakpoints
- [ ] Error boundaries per ogni sezione
- [ ] Loading states e skeletons per ogni pagina
- [ ] Empty states per liste vuote (primo locale, primi dipendenti, primo orario)
- [ ] Toast notifications (sonner) per tutte le azioni (salvataggio, errore, successo)
- [ ] SEO: meta tags, Open Graph per landing page
- [ ] Performance: lazy loading per scheduler grande, virtualizzazione griglia se >20 dipendenti
- [ ] Test end-to-end: flusso completo signup → onboarding → primo orario → pubblica → report
- [ ] Security review: RLS policies, input sanitization, rate limiting
- [ ] Verify all 24 database tables created and populated with correct indexes
- [ ] Verify all 6 Trigger.dev workflows functional with proper error handling
- [ ] Verify Stripe integration: checkout, portal, webhook
- [ ] Verify WhatsApp + Email notifications delivered correctly
- [ ] Documentation: README con setup instructions per development

---

## 📊 Phase Summary

| Phase | Feature | Key Deliverable | Est. Effort |
|-------|---------|-----------------|-------------|
| 0 | Project Setup | Dev environment ready | 1 day |
| 1 | Landing Page | Marketing page live | 1 day |
| 2 | Auth & Multi-Tenant | Signup/login + org creation + RLS | 2-3 days |
| 3 | Onboarding | 5-step wizard, org configured | 2-3 days |
| 4 | Locations & Employees | Full CRUD with constraints | 3-4 days |
| 5 | Scheduler Core | Drag & drop grid with validation | 4-5 days |
| 6 | Dashboard | KPI overview + alerts | 1-2 days |
| 7 | AI Scheduling | AI generation + conflict resolution | 4-5 days |
| 8 | Notifications | WhatsApp + Email batch dispatch | 3-4 days |
| 9 | Reports & Accountant | PDF/CSV/Excel + accountant portal | 3-4 days |
| 10 | Employee Mobile | Schedule view + preferences + requests | 2-3 days |
| 11 | Profile & Settings | Subscription + usage + config | 2 days |
| 12 | CSV Import | Batch employee import | 1-2 days |
| 13 | Admin Panel | Platform monitoring | 1-2 days |
| 14 | Final Sweep | Polish + testing + security | 2-3 days |

**Total Estimated: 8-10 weeks (solo developer)**

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
