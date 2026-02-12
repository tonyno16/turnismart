## Strategic Database Planning Document

### App Summary

**End Goal:** Aiutare titolari di attivita commerciali multi-sede a creare, gestire e ottimizzare gli orari del personale e inviare report automatici al commercialista
**Template Used:** Custom interactive scheduling SaaS (non standard worker-saas)
**Core Workflows:** AI Schedule Generation, Notification Dispatch, Monthly Report Generation, Employee CSV Import, Schedule Conflict Resolution, Accountant Invitation
**Background Job Types:** AI optimization, batch notifications, report generation, data import
**Database:** Supabase (PostgreSQL) con Drizzle ORM
**Multi-Tenancy:** Organization-based isolation con Row Level Security

---

## 🏗️ Architecture: Multi-Tenant Organization Model

### Critical Design Decision: Organization-Centric

Questa app NON e user-centric (1 utente = 1 account). E **organization-centric**: un titolare crea un'organizzazione, poi invita manager, dipendenti e commercialisti.

```
Organization (Ristorante Rossi S.r.l.)
  ├── Owner: Mario Rossi
  ├── Manager: Lucia Verdi (sede Centro)
  ├── Employees: Marco R., Anna B., Luigi T., ... (28 dipendenti)
  └── Accountant: Dott. Bianchi (puo avere piu organizzazioni)
```

**Stripe Integration:** `stripe_customer_id` e `stripe_subscription_id` vivono su `organizations`, NON su `users`. Il piano e per organizzazione, non per utente.

**Row Level Security:** Ogni query filtra per `organization_id`. Utenti vedono solo dati della propria organizzazione.

---

## 🗄️ Complete Schema Design

### Cluster 1: Identity & Multi-Tenancy

---

#### `organizations`
**Purpose:** Entita principale multi-tenant. Ogni attivita commerciale e un'organizzazione.

- `id` - uuid, PK, default uuid_generate_v4()
- `name` - text, NOT NULL (nome attivita: "Ristorante Rossi S.r.l.")
- `slug` - text, UNIQUE, NOT NULL (per URL friendly)
- `sector` - text, NOT NULL (restaurant, care_home, bar, retail, hotel, other)
- `logo_url` - text, nullable (URL logo su Supabase Storage)
- `phone` - text, nullable
- `email` - text, nullable
- `stripe_customer_id` - text, nullable, UNIQUE (collegamento Stripe)
- `trial_ends_at` - timestamptz, nullable (data fine trial 30 giorni)
- `onboarding_completed` - boolean, default false
- `created_at` - timestamptz, default now()
- `updated_at` - timestamptz, default now()

**Indexes:**
- `slug` (UNIQUE, per lookup URL)
- `stripe_customer_id` (UNIQUE, per webhook Stripe)

**Note Stripe:** SOLO `stripe_customer_id` nel database. Piano, stato abbonamento, metodo pagamento: sempre query Stripe API in real-time. MAI duplicare dati Stripe nel database.

---

#### `users`
**Purpose:** Utenti autenticati con ruolo nell'organizzazione. Sincronizzato con Supabase Auth.

- `id` - uuid, PK (corrisponde a Supabase Auth user ID)
- `organization_id` - uuid, FK → organizations(id), ON DELETE CASCADE, nullable (null durante signup, prima di join/create org)
- `email` - text, NOT NULL, UNIQUE
- `full_name` - text, NOT NULL
- `phone` - text, nullable
- `avatar_url` - text, nullable
- `role` - text, NOT NULL, default 'owner' (owner, manager, employee, accountant, admin)
- `is_active` - boolean, default true
- `created_at` - timestamptz, default now()
- `updated_at` - timestamptz, default now()

**Indexes:**
- `organization_id` (per query "tutti gli utenti dell'org")
- `email` (UNIQUE, per auth lookup)
- `role` (per filtri per ruolo)

**Note:** Il commercialista puo essere collegato a PIU organizzazioni. Vedi tabella `accountant_clients` sotto.

---

#### `accountant_clients`
**Purpose:** Relazione molti-a-molti tra commercialisti e organizzazioni clienti.

- `id` - uuid, PK
- `accountant_user_id` - uuid, FK → users(id), ON DELETE CASCADE
- `organization_id` - uuid, FK → organizations(id), ON DELETE CASCADE
- `status` - text, default 'pending' (pending, active, revoked)
- `invited_at` - timestamptz, default now()
- `accepted_at` - timestamptz, nullable

**Indexes:**
- UNIQUE (`accountant_user_id`, `organization_id`)
- `accountant_user_id` (per "tutti i clienti del commercialista")
- `organization_id` (per "chi e il commercialista di questa org")

---

#### `invitations`
**Purpose:** Token di invito per dipendenti e commercialisti prima che accettino.

- `id` - uuid, PK
- `organization_id` - uuid, FK → organizations(id), ON DELETE CASCADE
- `invited_by_user_id` - uuid, FK → users(id), ON DELETE SET NULL
- `email` - text, nullable
- `phone` - text, nullable
- `role` - text, NOT NULL (employee, manager, accountant)
- `token` - text, UNIQUE, NOT NULL
- `status` - text, default 'pending' (pending, accepted, expired, revoked)
- `expires_at` - timestamptz, NOT NULL
- `accepted_at` - timestamptz, nullable
- `created_at` - timestamptz, default now()

**Indexes:**
- `token` (UNIQUE, per lookup invito)
- `organization_id` (per "tutti gli inviti pendenti")

---

### Cluster 2: Locations & Staffing

---

#### `locations`
**Purpose:** Punti vendita/sedi dell'organizzazione con orari di apertura.

- `id` - uuid, PK
- `organization_id` - uuid, FK → organizations(id), ON DELETE CASCADE
- `name` - text, NOT NULL ("Ristorante Centro")
- `address` - text, nullable
- `phone` - text, nullable
- `opening_hours` - jsonb, NOT NULL, default '{}'
  ```json
  {
    "monday":    { "shifts": [{ "open": "12:00", "close": "15:00" }, { "open": "18:00", "close": "24:00" }] },
    "tuesday":   { "shifts": [{ "open": "18:00", "close": "24:00" }] },
    "sunday":    null
  }
  ```
- `is_active` - boolean, default true
- `sort_order` - integer, default 0
- `created_at` - timestamptz, default now()
- `updated_at` - timestamptz, default now()

**Indexes:**
- `organization_id` (per "tutti i locali dell'org")

---

#### `roles`
**Purpose:** Mansioni/ruoli configurabili per organizzazione (cameriere, cuoco, lavapiatti, etc.).

- `id` - uuid, PK
- `organization_id` - uuid, FK → organizations(id), ON DELETE CASCADE
- `name` - text, NOT NULL ("Cameriere", "Cuoco")
- `color` - text, default '#3B82F6' (colore badge UI)
- `icon` - text, nullable (emoji o icon name)
- `is_active` - boolean, default true
- `sort_order` - integer, default 0
- `created_at` - timestamptz, default now()

**Indexes:**
- `organization_id` (per "tutti i ruoli dell'org")
- UNIQUE (`organization_id`, `name`)

---

#### `staffing_requirements`
**Purpose:** Fabbisogno personale per locale/giorno/fascia oraria. Quante persone per ruolo servono.

- `id` - uuid, PK
- `location_id` - uuid, FK → locations(id), ON DELETE CASCADE
- `role_id` - uuid, FK → roles(id), ON DELETE CASCADE
- `day_of_week` - integer, NOT NULL (0=lunedi, 6=domenica)
- `shift_period` - text, NOT NULL (morning, afternoon, evening)
- `required_count` - integer, NOT NULL, default 1
- `created_at` - timestamptz, default now()
- `updated_at` - timestamptz, default now()

**Indexes:**
- `location_id` (per "fabbisogno di questo locale")
- UNIQUE (`location_id`, `role_id`, `day_of_week`, `shift_period`)

---

### Cluster 3: Employees & Contracts

---

#### `employees`
**Purpose:** Anagrafica dipendenti con contratto e paga. Separata da `users` perche un dipendente potrebbe non avere un account app.

- `id` - uuid, PK
- `organization_id` - uuid, FK → organizations(id), ON DELETE CASCADE
- `user_id` - uuid, FK → users(id), ON DELETE SET NULL, nullable (null se non ha ancora accettato invito)
- `first_name` - text, NOT NULL
- `last_name` - text, NOT NULL
- `email` - text, nullable
- `phone` - text, nullable
- `contract_type` - text, NOT NULL, default 'full_time' (full_time, part_time, on_call, seasonal)
- `weekly_hours` - integer, NOT NULL, default 40
- `max_weekly_hours` - integer, NOT NULL, default 48
- `hourly_rate` - numeric(8,2), NOT NULL, default 0
- `overtime_rate` - numeric(8,2), nullable (se diverso da ordinario)
- `holiday_rate` - numeric(8,2), nullable
- `preferred_location_id` - uuid, FK → locations(id), ON DELETE SET NULL, nullable
- `is_active` - boolean, default true
- `hired_at` - date, nullable
- `notes` - text, nullable (note del titolare)
- `created_at` - timestamptz, default now()
- `updated_at` - timestamptz, default now()

**Indexes:**
- `organization_id` (per "tutti i dipendenti dell'org")
- `user_id` (per collegamento account → dipendente)
- `preferred_location_id` (per filtro per sede)

---

#### `employee_roles`
**Purpose:** Fino a 3 mansioni per dipendente, in ordine di priorità (1=principale, 2, 3).

- `id` - uuid, PK
- `employee_id` - uuid, FK → employees(id), ON DELETE CASCADE
- `role_id` - uuid, FK → roles(id), ON DELETE CASCADE
- `priority` - integer, default 1 (1..3, 1=principale)
- `created_at` - timestamptz, default now()

**Indexes:**
- UNIQUE (`employee_id`, `role_id`)
- `employee_id` (per "mansioni di questo dipendente")

**Constraint:** max 3 righe per `employee_id`, `priority` tra 1 e 3.

---

#### `employee_availability`
**Purpose:** Disponibilita ricorrente settimanale del dipendente (griglia giorno x fascia).

- `id` - uuid, PK
- `employee_id` - uuid, FK → employees(id), ON DELETE CASCADE
- `day_of_week` - integer, NOT NULL (0=lunedi, 6=domenica)
- `shift_period` - text, NOT NULL (morning, afternoon, evening)
- `status` - text, NOT NULL, default 'available' (available, unavailable, preferred)
- `created_at` - timestamptz, default now()
- `updated_at` - timestamptz, default now()

**Indexes:**
- `employee_id` (per "disponibilita di questo dipendente")
- UNIQUE (`employee_id`, `day_of_week`, `shift_period`)

---

#### `employee_incompatibilities`
**Purpose:** Coppie di dipendenti che preferiscono non lavorare insieme nello stesso turno.

- `id` - uuid, PK
- `organization_id` - uuid, FK → organizations(id), ON DELETE CASCADE
- `employee_a_id` - uuid, FK → employees(id), ON DELETE CASCADE
- `employee_b_id` - uuid, FK → employees(id), ON DELETE CASCADE
- `reason` - text, nullable
- `created_at` - timestamptz, default now()

**Indexes:**
- UNIQUE (`employee_a_id`, `employee_b_id`) con CHECK (employee_a_id < employee_b_id)
- `organization_id`

---

#### `employee_time_off`
**Purpose:** Periodi di ferie, permessi e indisponibilita specifiche (non ricorrenti).

- `id` - uuid, PK
- `employee_id` - uuid, FK → employees(id), ON DELETE CASCADE
- `type` - text, NOT NULL (vacation, personal_leave, sick_leave, other)
- `start_date` - date, NOT NULL
- `end_date` - date, NOT NULL
- `status` - text, default 'pending' (pending, approved, rejected)
- `approved_by_user_id` - uuid, FK → users(id), ON DELETE SET NULL, nullable
- `notes` - text, nullable
- `created_at` - timestamptz, default now()

**Indexes:**
- `employee_id` (per "assenze di questo dipendente")
- (`employee_id`, `start_date`, `end_date`) per overlap check

---

### Cluster 4: Schedules & Shifts (Core)

---

#### `schedules`
**Purpose:** Contenitore settimanale degli orari. Un record per settimana per organizzazione.

- `id` - uuid, PK
- `organization_id` - uuid, FK → organizations(id), ON DELETE CASCADE
- `week_start_date` - date, NOT NULL (sempre lunedi)
- `status` - text, NOT NULL, default 'draft' (draft, published, modified_after_publish)
- `published_at` - timestamptz, nullable
- `published_by_user_id` - uuid, FK → users(id), ON DELETE SET NULL, nullable
- `notes` - text, nullable (note interne per questa settimana)
- `created_at` - timestamptz, default now()
- `updated_at` - timestamptz, default now()

**Indexes:**
- UNIQUE (`organization_id`, `week_start_date`)
- `organization_id` (per "orari di questa org")

---

#### `shifts`
**Purpose:** Singolo turno assegnato. Il record atomico dello scheduling.

- `id` - uuid, PK
- `schedule_id` - uuid, FK → schedules(id), ON DELETE CASCADE
- `organization_id` - uuid, FK → organizations(id), ON DELETE CASCADE (denormalizzato per RLS)
- `location_id` - uuid, FK → locations(id), ON DELETE CASCADE
- `employee_id` - uuid, FK → employees(id), ON DELETE CASCADE
- `role_id` - uuid, FK → roles(id), ON DELETE CASCADE
- `date` - date, NOT NULL
- `start_time` - time, NOT NULL
- `end_time` - time, NOT NULL
- `break_minutes` - integer, default 0
- `is_auto_generated` - boolean, default false (true se generato da AI)
- `status` - text, default 'active' (active, cancelled, sick_leave)
- `cancelled_reason` - text, nullable
- `created_at` - timestamptz, default now()
- `updated_at` - timestamptz, default now()

**Indexes:**
- `schedule_id` (per "tutti i turni di questa settimana")
- `organization_id` (per RLS)
- `employee_id` (per "turni di questo dipendente")
- `location_id` (per "turni di questo locale")
- (`employee_id`, `date`) per conflict check (no overlap)
- `date` (per query per giorno)

**Computed Fields (query-time, non stored):**
- `duration_hours` = (end_time - start_time - break_minutes) / 60
- `is_overtime` = calcolato sommando ore settimanali dipendente vs contratto
- `is_holiday` = calcolato controllando se `date` cade in festivo

---

### Cluster 5: Requests & Communication

---

#### `shift_requests`
**Purpose:** Richieste dai dipendenti: cambio turno, ferie, permessi, malattia.

- `id` - uuid, PK
- `organization_id` - uuid, FK → organizations(id), ON DELETE CASCADE
- `employee_id` - uuid, FK → employees(id), ON DELETE CASCADE (chi fa la richiesta)
- `type` - text, NOT NULL (shift_swap, vacation, personal_leave, sick_leave)
- `status` - text, default 'pending' (pending, approved, rejected, cancelled)
- `shift_id` - uuid, FK → shifts(id), ON DELETE SET NULL, nullable (turno coinvolto, se swap)
- `swap_with_employee_id` - uuid, FK → employees(id), ON DELETE SET NULL, nullable (collega proposto per swap)
- `start_date` - date, nullable (per ferie/permessi: data inizio)
- `end_date` - date, nullable (per ferie/permessi: data fine)
- `reason` - text, nullable
- `reviewed_by_user_id` - uuid, FK → users(id), ON DELETE SET NULL, nullable
- `reviewed_at` - timestamptz, nullable
- `review_notes` - text, nullable
- `created_at` - timestamptz, default now()

**Indexes:**
- `organization_id` (per RLS)
- `employee_id` (per "le mie richieste")
- `status` (per "richieste pendenti")

---

#### `notifications`
**Purpose:** Log di tutte le notifiche inviate (WhatsApp, Email, in-app).

- `id` - uuid, PK
- `organization_id` - uuid, FK → organizations(id), ON DELETE CASCADE
- `recipient_user_id` - uuid, FK → users(id), ON DELETE CASCADE, nullable
- `recipient_employee_id` - uuid, FK → employees(id), ON DELETE SET NULL, nullable
- `channel` - text, NOT NULL (whatsapp, email, in_app)
- `event_type` - text, NOT NULL (schedule_published, shift_changed, shift_assigned, sick_leave_replacement, request_approved, request_rejected, report_ready, invitation, trial_expiring)
- `subject` - text, nullable (per email)
- `body` - text, NOT NULL (contenuto messaggio)
- `delivery_status` - text, default 'pending' (pending, sent, delivered, failed)
- `external_id` - text, nullable (Twilio message SID, Resend email ID)
- `sent_at` - timestamptz, nullable
- `created_at` - timestamptz, default now()

**Indexes:**
- `recipient_user_id` (per "le mie notifiche")
- `organization_id` (per RLS)
- (`event_type`, `created_at`) per analytics

---

### Cluster 6: Reports

---

#### `reports`
**Purpose:** Report mensili generati per il commercialista. Contiene link ai file e riepilogo dati.

- `id` - uuid, PK
- `organization_id` - uuid, FK → organizations(id), ON DELETE CASCADE
- `month` - date, NOT NULL (primo giorno del mese: 2025-01-01)
- `status` - text, default 'draft' (draft, ready, sent_to_accountant)
- `pdf_url` - text, nullable (URL file su Supabase Storage)
- `csv_url` - text, nullable
- `excel_url` - text, nullable
- `summary` - jsonb, nullable
  ```json
  {
    "total_employees": 28,
    "total_hours": 4320,
    "ordinary_hours": 4050,
    "overtime_hours": 180,
    "holiday_hours": 90,
    "sick_hours": 48,
    "vacation_hours": 120,
    "estimated_cost": 45360.00
  }
  ```
- `details_by_employee` - jsonb, nullable (array con dettaglio per dipendente)
- `details_by_location` - jsonb, nullable (array con dettaglio per locale)
- `sent_to_accountant_at` - timestamptz, nullable
- `created_by_user_id` - uuid, FK → users(id), ON DELETE SET NULL, nullable
- `created_at` - timestamptz, default now()

**Indexes:**
- UNIQUE (`organization_id`, `month`)
- `organization_id` (per RLS)

---

### Cluster 7: Background Job Tracking (Trigger.dev)

---

#### `schedule_generation_jobs`
**Purpose:** Job tracking per AI Schedule Generation workflow.

- `id` - uuid, PK
- `organization_id` - uuid, FK → organizations(id), ON DELETE CASCADE
- `schedule_id` - uuid, FK → schedules(id), ON DELETE SET NULL, nullable
- `week_start_date` - date, NOT NULL
- `location_ids` - text[], nullable (null = tutti i locali)
- `mode` - text, NOT NULL, default 'full' (full, fill_gaps, single_location)
- `options` - jsonb, default '{}'
  ```json
  { "optimizeCosts": true, "respectPreferences": true }
  ```
- `status` - text, NOT NULL, default 'pending' (pending, collecting, optimizing, validating, completed, failed, cancelled)
- `progress_percentage` - integer, default 0
- `current_step` - text, nullable
- `trigger_job_id` - text, nullable (Trigger.dev run ID)
- `result_summary` - jsonb, nullable
  ```json
  {
    "shifts_created": 45,
    "unfilled_slots": 3,
    "cost_estimate": 4230.00,
    "overtime_hours": 12,
    "conflicts_resolved": 2,
    "warnings": ["Lavapiatti scoperto lunedi sera Centro"]
  }
  ```
- `error_message` - text, nullable
- `created_at` - timestamptz, default now()
- `completed_at` - timestamptz, nullable

**Indexes:**
- `organization_id`
- `status` (per polling job attivi)
- `trigger_job_id` (per lookup da webhook)

---

#### `notification_jobs`
**Purpose:** Job tracking per Notification Dispatch workflow.

- `id` - uuid, PK
- `organization_id` - uuid, FK → organizations(id), ON DELETE CASCADE
- `event_type` - text, NOT NULL (schedule_published, shift_changed, report_ready, invitation, etc.)
- `recipient_count` - integer, default 0
- `status` - text, NOT NULL, default 'pending' (pending, preparing, sending, completed, partial_failure, failed)
- `progress_percentage` - integer, default 0
- `trigger_job_id` - text, nullable
- `result_summary` - jsonb, nullable
  ```json
  { "sent": 25, "failed": 2, "pending": 1 }
  ```
- `error_message` - text, nullable
- `created_at` - timestamptz, default now()
- `completed_at` - timestamptz, nullable

**Indexes:**
- `organization_id`
- `status`

---

#### `report_generation_jobs`
**Purpose:** Job tracking per Monthly Report Generation workflow.

- `id` - uuid, PK
- `organization_id` - uuid, FK → organizations(id), ON DELETE CASCADE
- `report_id` - uuid, FK → reports(id), ON DELETE SET NULL, nullable
- `month` - date, NOT NULL
- `status` - text, NOT NULL, default 'pending' (pending, aggregating, generating_files, completed, failed)
- `progress_percentage` - integer, default 0
- `trigger_job_id` - text, nullable
- `error_message` - text, nullable
- `created_at` - timestamptz, default now()
- `completed_at` - timestamptz, nullable

**Indexes:**
- `organization_id`
- `status`

---

#### `import_jobs`
**Purpose:** Job tracking per Employee CSV Import workflow.

- `id` - uuid, PK
- `organization_id` - uuid, FK → organizations(id), ON DELETE CASCADE
- `file_name` - text, NOT NULL
- `file_url` - text, NOT NULL (Supabase Storage URL)
- `total_rows` - integer, nullable
- `status` - text, NOT NULL, default 'pending' (pending, parsing, importing, completed, failed)
- `progress_percentage` - integer, default 0
- `trigger_job_id` - text, nullable
- `result_summary` - jsonb, nullable
  ```json
  { "imported": 45, "errors": 3, "duplicates": 2, "error_details": [...] }
  ```
- `error_message` - text, nullable
- `created_at` - timestamptz, default now()
- `completed_at` - timestamptz, nullable

**Indexes:**
- `organization_id`
- `status`

---

### Cluster 8: Usage & Settings

---

#### `usage_tracking`
**Purpose:** Tracciamento utilizzo mensile per enforcement quota piano.

- `id` - uuid, PK
- `organization_id` - uuid, FK → organizations(id), ON DELETE CASCADE
- `month` - date, NOT NULL (primo giorno del mese)
- `locations_count` - integer, default 0
- `employees_count` - integer, default 0
- `ai_generations_count` - integer, default 0
- `reports_generated_count` - integer, default 0
- `whatsapp_messages_sent` - integer, default 0
- `email_messages_sent` - integer, default 0
- `created_at` - timestamptz, default now()
- `updated_at` - timestamptz, default now()

**Indexes:**
- UNIQUE (`organization_id`, `month`)

**Quota Limits (per piano, non nel database ma in codice):**
```typescript
const PLAN_LIMITS = {
  starter: { locations: 1, employees: 15, ai_generations: 0, whatsapp: false },
  pro:     { locations: 5, employees: 50, ai_generations: -1, whatsapp: true },
  business:{ locations: -1, employees: -1, ai_generations: -1, whatsapp: true },
} // -1 = illimitato
```

---

#### `organization_settings`
**Purpose:** Impostazioni configurabili per organizzazione (regole turni, preferenze report, etc.).

- `id` - uuid, PK
- `organization_id` - uuid, FK → organizations(id), ON DELETE CASCADE, UNIQUE
- `work_rules` - jsonb, default '{}'
  ```json
  {
    "min_rest_between_shifts_hours": 11,
    "max_consecutive_days": 6,
    "overtime_threshold_hours": 40,
    "min_shift_duration_hours": 3,
    "max_shift_duration_hours": 10
  }
  ```
- `report_settings` - jsonb, default '{}'
  ```json
  {
    "auto_generate_day": 1,
    "auto_send_to_accountant": true,
    "preferred_format": "excel",
    "hours_method": "scheduled"
  }
  ```
- `notification_settings` - jsonb, default '{}'
  ```json
  {
    "schedule_published": { "channels": ["whatsapp", "email"] },
    "shift_changed": { "channels": ["whatsapp"] },
    "report_ready": { "channels": ["email", "whatsapp"] }
  }
  ```
- `created_at` - timestamptz, default now()
- `updated_at` - timestamptz, default now()

**Indexes:**
- UNIQUE (`organization_id`)

---

#### `italian_holidays`
**Purpose:** Tabella statica con festivita italiane per calcolo ore festive nei report.

- `id` - uuid, PK
- `date` - date, NOT NULL, UNIQUE
- `name` - text, NOT NULL ("Capodanno", "Pasqua", "Ferragosto", etc.)
- `year` - integer, NOT NULL

**Indexes:**
- UNIQUE (`date`)
- `year`

**Seed data:** Pre-popolata con festivita italiane per i prossimi 5 anni.

---

## ⚡ Workflow-to-Schema Mapping

### Workflow 1: AI Schedule Generation (`trigger_workflow_ai_schedule.md`)

- **Job Tracking:** `schedule_generation_jobs`
  - `trigger_job_id` - Trigger.dev run ID (per useRealtimeRunWithStreams)
  - `status` - 6 stati (pending → collecting → optimizing → validating → completed/failed)
  - `progress_percentage` - 0-100
  - Input: `week_start_date`, `location_ids`, `mode`, `options`
  - Output: `result_summary` (shifts creati, scoperti, costo, warnings)
- **Data Letta:** `locations`, `staffing_requirements`, `employees`, `employee_roles`, `employee_availability`, `employee_incompatibilities`, `employee_time_off`, `shifts` (settimane precedenti per equita)
- **Data Scritta:** `schedules` (crea/aggiorna), `shifts` (bulk insert turni generati)
- **Enhancement:** result_summary contiene warnings per turni scoperti

### Workflow 2: Notification Dispatch (`trigger_workflow_notifications.md`)

- **Job Tracking:** `notification_jobs`
  - `trigger_job_id`, `status`, `progress_percentage`
  - Input: `event_type`, `recipient_count`
  - Output: `result_summary` (sent, failed, pending)
- **Data Letta:** `users`, `employees` (per contatti), `organization_settings` (canali preferiti)
- **Data Scritta:** `notifications` (un record per ogni notifica inviata)

### Workflow 3: Monthly Report Generation (`trigger_workflow_monthly_report.md`)

- **Job Tracking:** `report_generation_jobs`
  - `trigger_job_id`, `status`, `progress_percentage`
  - Input: `month`
  - Output: link a `reports` record
- **Data Letta:** `shifts` (tutti i turni del mese), `employees`, `employee_time_off`, `locations`, `italian_holidays`
- **Data Scritta:** `reports` (crea record con summary e URL file), upload PDF/CSV/Excel su Supabase Storage
- **Fire-and-forget:** Triggera Notification Dispatch (report_ready) per commercialista

### Workflow 4: Employee CSV Import (`trigger_workflow_csv_import.md`)

- **Job Tracking:** `import_jobs`
  - `trigger_job_id`, `status`, `progress_percentage`
  - Input: `file_name`, `file_url`, `total_rows`
  - Output: `result_summary` (imported, errors, duplicates)
- **Data Scritta:** `employees` (bulk insert), `employee_roles` (associazione mansioni)
- **Storage:** File CSV temporaneo su Supabase Storage bucket "imports"

### Workflow 5: Schedule Conflict Resolution (`trigger_workflow_conflict_resolution.md`)

- **Job Tracking:** Inline nella `schedule_generation_jobs` (non serve tabella separata, < 10 secondi)
- **Alternativa:** Risultati salvati come JSONB temporaneo (suggerimenti sostituti) restituiti direttamente via metadata.root.set()
- **Data Letta:** `shifts` (turno scoperto), `employees`, `employee_roles`, `employee_availability`, `employee_incompatibilities`
- **Data Scritta:** Nessuna (suggerimenti sono real-time, l'assegnazione avviene via Server Action separata)

### Workflow 6: Accountant Invitation (`trigger_workflow_accountant_invite.md`)

- **Job Tracking:** Non serve tabella dedicata (< 10 secondi, riusa Notification Dispatch)
- **Data Scritta:** `invitations` (crea invito), poi `accountant_clients` (quando accettato)
- **Trigger:** Fire-and-forget su Notification Dispatch (invitation event)

---

## 📋 Implementation Priority

### Phase 1: Foundation (settimana 1-2)

Tabelle da creare per primo, necessarie per tutto il resto:

1. `organizations` - Base multi-tenancy
2. `users` - Auth e ruoli
3. `invitations` - Sistema inviti
4. `locations` - Punti vendita
5. `roles` - Mansioni configurabili
6. `staffing_requirements` - Fabbisogno personale
7. `employees` - Anagrafica dipendenti
8. `employee_roles` - Mansioni per dipendente
9. `employee_availability` - Disponibilita ricorrente
10. `organization_settings` - Configurazioni org
11. `usage_tracking` - Quota enforcement

### Phase 2: Scheduling Core (settimana 2-3)

Tabelle per lo scheduler e AI:

12. `schedules` - Container settimanali
13. `shifts` - Turni individuali
14. `employee_incompatibilities` - Vincoli colleghi
15. `employee_time_off` - Ferie e assenze
16. `schedule_generation_jobs` - AI job tracking
17. `shift_requests` - Richieste dipendenti

### Phase 3: Notifications & Reports (settimana 3-4)

18. `notifications` - Log notifiche
19. `notification_jobs` - Job tracking notifiche
20. `reports` - Report mensili
21. `report_generation_jobs` - Job tracking report
22. `italian_holidays` - Festivita (seed data)
23. `accountant_clients` - Relazione commercialisti

### Phase 4: Import & Enhancement (settimana 4+)

24. `import_jobs` - Job tracking CSV import

---

## 🗺️ Complete Schema Overview

### Cluster Summary

**Identity & Multi-Tenancy (4 tabelle):**
- `organizations` - Entita principale, Stripe customer
- `users` - Utenti autenticati con ruolo
- `accountant_clients` - Relazione commercialista ↔ org
- `invitations` - Token invito

**Locations & Staffing (3 tabelle):**
- `locations` - Punti vendita
- `roles` - Mansioni configurabili
- `staffing_requirements` - Fabbisogno per locale/giorno/ruolo

**Employees & Contracts (5 tabelle):**
- `employees` - Anagrafica e contratto
- `employee_roles` - Mansioni per dipendente (M2M)
- `employee_availability` - Disponibilita ricorrente
- `employee_incompatibilities` - Vincoli colleghi
- `employee_time_off` - Ferie e assenze

**Schedules & Shifts (3 tabelle):**
- `schedules` - Container settimanali
- `shifts` - Turni individuali (core)
- `shift_requests` - Richieste dipendenti

**Communication (1 tabella):**
- `notifications` - Log notifiche inviate

**Reports (1 tabella):**
- `reports` - Report mensili con file e summary

**Job Tracking - Trigger.dev (4 tabelle):**
- `schedule_generation_jobs` - AI scheduling
- `notification_jobs` - Invio batch
- `report_generation_jobs` - Generazione report
- `import_jobs` - Import CSV

**Settings & Usage (3 tabelle):**
- `organization_settings` - Config org
- `usage_tracking` - Quota mensile
- `italian_holidays` - Festivita statiche

---

**Total Tables: 24**
**New Tables: 24** (nessuna tabella esistente da template, progetto da zero)
**Tables to Modify: 0**
**Tables to Remove: 0**

---

## 🎯 Strategic Advantage

Questa architettura e progettata specificamente per il multi-tenant scheduling SaaS italiano:

- ✅ **Organization-centric** - Ogni dato e isolato per organizzazione via `organization_id` + RLS
- ✅ **Stripe minimal** - Solo `stripe_customer_id` su organizations, tutto il resto query API
- ✅ **Trigger.dev ready** - 4 job tracking tables con `trigger_job_id`, `status`, `progress_percentage`
- ✅ **AI-friendly** - La struttura di `staffing_requirements` + `employee_availability` + `employee_incompatibilities` e progettata per essere serializzata come prompt AI
- ✅ **Report-ready** - `shifts` contiene tutti i dati per aggregare ore per tipo e generare report
- ✅ **Scalabile** - JSONB per settings flessibili, tabelle separate per ogni concern
- ✅ **Mobile-first** - `employee_availability` con struttura giorno x fascia corrisponde alla griglia UI mobile

**Gaps consapevoli (Phase 2+):**
- ⚠️ Nessuna tabella per timbratura (Phase 2: `time_entries`)
- ⚠️ Nessuna tabella per integrazione software paghe (Phase 3: `payroll_exports`)
- ⚠️ Nessuna tabella per analytics avanzati (Phase 3: materialized views)

---

## 🔧 Trigger.dev Integration Requirements

### Required Fields (Every Job Table)

```typescript
// These fields MUST exist in every [workflow]_jobs table
{
  trigger_job_id: text        // Trigger.dev run ID for useRealtimeRun()
  status: enum               // pending | processing | completed | failed | cancelled
  progress_percentage: int   // 0-100, synced with metadata.set("progress")
  error_message: text        // User-friendly error message (nullable)
}
```

### Frontend Integration Pattern

```typescript
// AI Schedule Generation: real-time streaming
const { run } = useRealtimeRunWithStreams(job.trigger_job_id, { accessToken });
const progress = run?.metadata?.progress ?? job.progress_percentage;
const currentStep = run?.metadata?.currentStep ?? job.current_step;

// Other jobs: database polling
const { data: job } = useSWR(`/api/jobs/${jobId}`, fetcher, { refreshInterval: 2000 });
```

### Database Update Pattern

```typescript
// Inside Trigger.dev tasks
await db.update(scheduleGenerationJobs)
  .set({ progress_percentage: 50, current_step: "Ottimizzazione turni..." })
  .where(eq(scheduleGenerationJobs.id, jobId));

metadata.root.set("progress", 50);
metadata.root.set("currentStep", "Ottimizzazione turni...");
```

---

## 📊 Usage Tracking Pattern

### Organization-Based Quota Enforcement

```typescript
// Check quota before action
async function checkQuota(orgId: string, resource: 'locations' | 'employees' | 'ai_generations') {
  const plan = await getStripePlan(orgId); // Query Stripe API
  const usage = await db.query.usageTracking.findFirst({
    where: and(eq(usageTracking.organizationId, orgId), eq(usageTracking.month, currentMonth))
  });

  const limit = PLAN_LIMITS[plan][resource];
  if (limit === -1) return true; // unlimited
  return usage[`${resource}_count`] < limit;
}
```

### Increment Usage After Action

```typescript
// After successful AI generation
await db.update(usageTracking)
  .set({ ai_generations_count: sql`ai_generations_count + 1` })
  .where(and(eq(usageTracking.organizationId, orgId), eq(usageTracking.month, currentMonth)));
```

---

## 🔒 Row Level Security (RLS) Strategy

### Policy Pattern

Ogni tabella con `organization_id` ha una RLS policy:

```sql
-- Utenti vedono solo dati della propria organizzazione
CREATE POLICY "org_isolation" ON [table_name]
  USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));
```

### Eccezioni

- `italian_holidays` - Nessuna RLS (dati pubblici condivisi)
- `users` - RLS basata su `id = auth.uid()` per il proprio profilo, `organization_id` per vedere colleghi
- `accountant_clients` - Il commercialista vede tutte le org dove `accountant_user_id = auth.uid()`

---

**Last Updated:** 2025-02-11
**Total Tables:** 24
**Development Phase:** Design Complete - Ready for Implementation
