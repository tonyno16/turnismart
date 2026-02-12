## System Architecture Blueprint

### App Summary

**End Goal:** Piattaforma SaaS italiana per scheduling del personale multi-sede con AI optimization e report automatici per commercialista
**Template Foundation:** Custom build (Next.js 15 + Supabase + Trigger.dev + Stripe)
**Required Extensions:** OpenAI API (AI scheduling), Twilio WhatsApp API, Resend Email, Supabase Storage (report files)

---

## 🏗️ System Architecture

### Stack Foundation

**Frontend & Backend:**
- Next.js 15 (App Router, Server Actions, API Routes)
- React 19 (UI layer)
- Tailwind CSS v4 (styling)
- DnD Kit (drag & drop scheduler)
- Deployed su Vercel

**Database & Auth:**
- Supabase PostgreSQL (database principale, 24 tabelle)
- Supabase Auth (email/password + Google OAuth)
- Supabase Storage (report PDF/Excel, CSV import, avatar)
- Row Level Security per multi-tenant isolation
- Drizzle ORM (type-safe queries)

**Background Jobs:**
- Trigger.dev v4 (6 workflow, 18 task)
- Deployed su Trigger.dev Cloud

**Payments:**
- Stripe (Checkout, Customer Portal, Webhooks minimali)
- Solo stripe_customer_id in database, query API real-time per stato

**Notifications:**
- Twilio WhatsApp Business API
- Resend (email transazionali)

**AI:**
- OpenAI GPT-4 con function calling (scheduling optimization)

### Architecture Diagram

```mermaid
graph TB
    %% ========================================
    %% USER INTERFACE LAYER
    %% ========================================
    subgraph "User Interface Layer"
        direction LR
        WebOwner["🖥️ Dashboard Titolare<br/>Schedule + Locali + Dipendenti"]
        WebManager["🖥️ Vista Manager<br/>Locale singolo"]
        MobileEmployee["📱 App Dipendente (PWA)<br/>Orario + Preferenze + Richieste"]
        WebAccountant["🖥️ Portale Commercialista<br/>Report multi-cliente"]
        WebAdmin["🛡️ Admin Panel<br/>Metriche + Utenti"]
    end

    %% ========================================
    %% APPLICATION LAYER - NEXT.JS
    %% ========================================
    subgraph "Application Layer - Next.js 15 (Vercel)"
        direction TB

        subgraph "Server Actions (Internal)"
            SASchedule["📅 Schedule Actions<br/>CRUD turni, pubblica, imprevisti"]
            SALocations["🏪 Location Actions<br/>CRUD locali, fabbisogno"]
            SAEmployees["👥 Employee Actions<br/>CRUD dipendenti, preferenze"]
            SAReports["📊 Report Actions<br/>Genera report, esporta"]
            SARequests["📝 Request Actions<br/>Crea/approva richieste"]
            SAAuth["🔐 Auth Actions<br/>Signup, inviti, ruoli"]
            SASubscription["💳 Subscription Actions<br/>Checkout, Portal link"]
        end

        subgraph "API Routes (External Communication)"
            APIWebhookStripe["POST /api/webhooks/stripe<br/>Payment events"]
            APIWebhookTrigger["POST /api/webhooks/trigger<br/>Job status callbacks"]
            APIWebhookWhatsApp["POST /api/webhooks/whatsapp<br/>Delivery status"]
            APISuggest["POST /api/ai/suggest<br/>Drag & Drop validation (<2s)"]
            APICron["GET /api/cron/monthly-report<br/>Vercel Cron mensile"]
        end

        subgraph "Middleware & Auth"
            Middleware["🔒 Middleware<br/>Auth check + Role guard + Org isolation"]
        end
    end

    %% ========================================
    %% BACKGROUND JOB LAYER - TRIGGER.DEV
    %% ========================================
    subgraph "Background Job Layer - Trigger.dev Workers"
        direction TB

        subgraph "AI Schedule Generation Workflow (10-30s)"
            T1Collect["collect-scheduling-constraints<br/>Query vincoli da DB<br/>Progress: 0% → 20%"]
            T1Optimize["optimize-schedule<br/>OpenAI GPT-4 function calling<br/>⚡ Parallel per locale se >3<br/>Progress: 20% → 70%<br/>metadata.stream(schedule-preview)"]
            T1Validate["validate-schedule<br/>Check conflitti, ore max, riposi<br/>Auto-resolve con AI (max 3 retry)<br/>Progress: 70% → 90%"]
            T1Save["save-schedule-results<br/>Bulk insert shifts, stats<br/>Progress: 90% → 100%"]

            T1Collect --> T1Optimize
            T1Optimize --> T1Validate
            T1Validate --> T1Save
        end

        subgraph "Notification Dispatch Workflow (5-60s)"
            T2Prepare["prepare-notifications<br/>Query destinatari, template<br/>Progress: 0% → 20%"]
            T2Send["send-notifications-batch<br/>⚡ Parallel: WhatsApp + Email<br/>Rate limit: 50 WA/s, 10 Email/s<br/>Progress: 20% → 90%"]
            T2Finalize["finalize-notification-job<br/>Conta sent/failed, retry falliti<br/>Progress: 90% → 100%"]

            T2Prepare --> T2Send
            T2Send --> T2Finalize
        end

        subgraph "Monthly Report Workflow (15-45s)"
            T3Aggregate["aggregate-monthly-data<br/>Query shifts + assenze + festivita<br/>Calcola ore per tipo/dipendente<br/>Progress: 0% → 40%"]
            T3Generate["generate-report-files<br/>⚡ Parallel: PDF + CSV + Excel<br/>Upload su Supabase Storage<br/>Progress: 40% → 85%"]
            T3SaveMeta["save-report-metadata<br/>URL file, summary JSONB<br/>Progress: 85% → 95%"]
            T3Notify["notify-accountant<br/>🔥 Fire-and-forget<br/>Trigger Notification Dispatch<br/>Progress: 95% → 100%"]

            T3Aggregate --> T3Generate
            T3Generate --> T3SaveMeta
            T3SaveMeta --> T3Notify
        end

        subgraph "Conflict Resolution Workflow (3-10s)"
            T5Find["find-best-substitutes<br/>Query dipendenti per mansione,<br/>disponibilita, ore residue<br/>Ranking: equita + costo + pref"]
            T5Suggest["prepare-substitute-suggestions<br/>Top 5 sostituti con score<br/>metadata.root.set(suggestions)"]

            T5Find --> T5Suggest
        end

        subgraph "CSV Import Workflow (5-30s)"
            T4Parse["parse-and-validate-csv<br/>Papaparse + validazione"]
            T4Create["create-employee-records<br/>Batch insert + dedup"]
            T4Final["finalize-import<br/>Summary + cleanup file"]

            T4Parse --> T4Create
            T4Create --> T4Final
        end

        subgraph "Progress Tracking Pattern"
            ProgDB["Database: status + progress_percentage<br/>Source of truth"]
            ProgMeta["metadata.root.set(progress, step)<br/>Real-time UI via child→root"]
            ProgStream["metadata.stream(schedule-preview)<br/>AI Schedule Generation only"]
        end
    end

    %% ========================================
    %% DATA LAYER
    %% ========================================
    subgraph "Data Layer - Supabase PostgreSQL"
        direction TB

        subgraph "Core Tables (24)"
            DBOrg["organizations<br/>+ stripe_customer_id"]
            DBUsers["users<br/>+ role + organization_id"]
            DBLocations["locations + roles<br/>+ staffing_requirements"]
            DBEmployees["employees + employee_roles<br/>+ availability + incompatibilities"]
            DBSchedules["schedules + shifts<br/>(cuore dello scheduling)"]
            DBRequests["shift_requests<br/>+ employee_time_off"]
            DBReports["reports<br/>+ PDF/CSV/Excel URLs"]
            DBNotifications["notifications<br/>Log delivery"]
        end

        subgraph "Job Tracking Tables"
            DBJobSchedule["schedule_generation_jobs<br/>trigger_job_id + status + progress"]
            DBJobNotify["notification_jobs"]
            DBJobReport["report_generation_jobs"]
            DBJobImport["import_jobs"]
        end

        subgraph "Settings & Usage"
            DBSettings["organization_settings<br/>work_rules + report + notif"]
            DBUsage["usage_tracking<br/>locations/employees/AI count"]
            DBHolidays["italian_holidays<br/>Festivita statiche"]
        end

        RLS["🔒 Row Level Security<br/>Isolation per organization_id"]
    end

    %% ========================================
    %% STORAGE LAYER
    %% ========================================
    subgraph "Storage Layer - Supabase Storage"
        BucketReports["📁 reports/<br/>PDF, CSV, Excel"]
        BucketImports["📁 imports/<br/>CSV temporanei"]
        BucketAvatars["📁 avatars/<br/>Foto + Logo"]
    end

    %% ========================================
    %% EXTERNAL SERVICES
    %% ========================================
    subgraph "External Services"
        OpenAI["🤖 OpenAI API<br/>GPT-4 function calling<br/>Scheduling optimization"]
        Twilio["📱 Twilio<br/>WhatsApp Business API<br/>Template messages"]
        Resend["📧 Resend<br/>Email transazionali<br/>Template HTML"]
        StripeAPI["💳 Stripe API<br/>Real-time subscription query<br/>SOLO stripe_customer_id in DB"]
        StripePortal["💳 Stripe Customer Portal<br/>Gestione abbonamento (external)"]
        StripeCheckout["💳 Stripe Checkout<br/>Upgrade piano"]
        VercelCron["⏰ Vercel Cron<br/>Report mensile automatico"]
    end

    %% ========================================
    %% CONNECTIONS - UI to Application
    %% ========================================
    WebOwner -->|Server Actions| SASchedule
    WebOwner -->|Server Actions| SALocations
    WebOwner -->|Server Actions| SAEmployees
    WebOwner -->|Server Actions| SAReports
    WebManager -->|Server Actions| SASchedule
    WebManager -->|Server Actions| SARequests
    MobileEmployee -->|Server Actions| SARequests
    WebAccountant -->|Server Actions| SAReports
    WebAdmin -->|Server Actions| SAAuth

    %% Drag & Drop real-time
    WebOwner -->|Drag event| APISuggest
    APISuggest -->|Validation + AI suggest| OpenAI

    %% Subscription
    WebOwner -->|Manage billing| StripePortal
    WebOwner -->|Upgrade| StripeCheckout
    SASubscription -->|Query plan status| StripeAPI

    %% Real-time progress
    WebOwner -.->|useRealtimeRunWithStreams| T1Collect

    %% ========================================
    %% CONNECTIONS - Application to Jobs
    %% ========================================
    SASchedule -->|trigger()| T1Collect
    SASchedule -->|trigger()| T5Find
    SAReports -->|trigger()| T3Aggregate
    SAEmployees -->|trigger()| T4Parse
    T1Save -->|fire-and-forget| T2Prepare
    T3Notify -->|fire-and-forget| T2Prepare

    %% ========================================
    %% CONNECTIONS - Jobs to External
    %% ========================================
    T1Optimize -->|API call| OpenAI
    T1Validate -->|API call (retry)| OpenAI
    T2Send -->|WhatsApp API| Twilio
    T2Send -->|Email API| Resend

    %% ========================================
    %% CONNECTIONS - Jobs to Data
    %% ========================================
    T1Collect -->|Query vincoli| DBEmployees
    T1Collect -->|Query fabbisogno| DBLocations
    T1Save -->|Bulk insert| DBSchedules
    T1Save -->|Update| DBJobSchedule
    T2Send -->|Insert log| DBNotifications
    T3Aggregate -->|Query shifts| DBSchedules
    T3Aggregate -->|Query holidays| DBHolidays
    T3Generate -->|Upload files| BucketReports
    T3SaveMeta -->|Save URLs| DBReports
    T4Create -->|Batch insert| DBEmployees

    %% ========================================
    %% CONNECTIONS - Webhooks
    %% ========================================
    StripeAPI -->|payment events| APIWebhookStripe
    Twilio -->|delivery status| APIWebhookWhatsApp
    VercelCron -->|monthly trigger| APICron
    APICron -->|trigger()| T3Aggregate

    %% ========================================
    %% CONNECTIONS - Auth & RLS
    %% ========================================
    Middleware -->|Auth check| DBUsers
    RLS -->|Filter per org_id| DBOrg

    %% ========================================
    %% STYLES
    %% ========================================
    classDef userInterface fill:#1E88E5,stroke:#1565C0,stroke-width:2px,color:#fff
    classDef serverAction fill:#66BB6A,stroke:#388E3C,stroke-width:2px,color:#fff
    classDef apiRoute fill:#81C784,stroke:#43A047,stroke-width:2px,color:#fff
    classDef triggerTask fill:#7E57C2,stroke:#5E35B1,stroke-width:2px,color:#fff
    classDef database fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    classDef storage fill:#26A69A,stroke:#00695C,stroke-width:2px,color:#fff
    classDef external fill:#FF7043,stroke:#D84315,stroke-width:2px,color:#fff
    classDef payment fill:#FFA726,stroke:#F57C00,stroke-width:2px,color:#fff
    classDef middleware fill:#78909C,stroke:#455A64,stroke-width:2px,color:#fff

    class WebOwner,WebManager,MobileEmployee,WebAccountant,WebAdmin userInterface
    class SASchedule,SALocations,SAEmployees,SAReports,SARequests,SAAuth,SASubscription serverAction
    class APIWebhookStripe,APIWebhookTrigger,APIWebhookWhatsApp,APISuggest,APICron apiRoute
    class T1Collect,T1Optimize,T1Validate,T1Save,T2Prepare,T2Send,T2Finalize,T3Aggregate,T3Generate,T3SaveMeta,T3Notify,T4Parse,T4Create,T4Final,T5Find,T5Suggest triggerTask
    class DBOrg,DBUsers,DBLocations,DBEmployees,DBSchedules,DBRequests,DBReports,DBNotifications,DBJobSchedule,DBJobNotify,DBJobReport,DBJobImport,DBSettings,DBUsage,DBHolidays,RLS,ProgDB database
    class BucketReports,BucketImports,BucketAvatars storage
    class OpenAI,Twilio,Resend,VercelCron external
    class StripeAPI,StripePortal,StripeCheckout payment
    class Middleware middleware
```

---

## 🔄 System Flow Explanation

### Flow 1: AI Schedule Generation (Core Value Prop)

```
Titolare preme "Genera con AI" nello Scheduler
  → Server Action: createScheduleGenerationJob()
    → Verifica quota piano (query Stripe API)
    → Crea record in schedule_generation_jobs (status: pending)
    → tasks.trigger("collect-scheduling-constraints", { jobId, weekStart, locationIds })
  → Trigger.dev Worker esegue 4 task sequenziali:
    1. collect-scheduling-constraints: Query DB per vincoli (locali, dipendenti, disponibilita, incompatibilita)
    2. optimize-schedule: Invia prompt a OpenAI GPT-4 con function calling, riceve schedule strutturato
       - Se >3 locali: parallelizza per locale con Promise.all()
       - Streamma preview via metadata.stream("schedule-preview")
    3. validate-schedule: Verifica conflitti (overlap, ore max, riposi), auto-resolve con AI (max 3 tentativi)
    4. save-schedule-results: Bulk insert shifts, aggiorna statistiche
  → Frontend riceve progress real-time via useRealtimeRunWithStreams()
  → Al completamento: griglia scheduler si aggiorna con nuovo orario (stato: Bozza)
```

### Flow 2: Drag & Drop con AI Suggest (Real-Time)

```
Titolare trascina un turno nella griglia
  → Evento drag invia POST /api/ai/suggest con shift data
  → API Route (< 2 secondi):
    → Query DB: conflitti overlap, ore max, incompatibilita
    → Se conflitto: chiama OpenAI per suggerimenti alternativi
    → Return: { valid: boolean, conflicts: [], suggestions: [] }
  → Frontend mostra popup con risultato (conferma / suggerimenti / warning)
  → Se confermato: Server Action aggiorna shift nel DB
```

### Flow 3: Pubblicazione Orario + Notifiche

```
Titolare preme "Pubblica Orario"
  → Server Action: publishSchedule()
    → Aggiorna schedule.status = "published"
    → tasks.trigger("prepare-notifications", { event: "schedule_published", recipients: [...] })
  → Trigger.dev Worker:
    1. prepare-notifications: Query dipendenti, prepara messaggi personalizzati
    2. send-notifications-batch: Parallel WhatsApp (Twilio) + Email (Resend)
    3. finalize-notification-job: Conta successi/fallimenti, retry falliti
  → Dipendenti ricevono WhatsApp: "Il tuo orario per la settimana X e pronto. Vedi qui: [link]"
```

### Flow 4: Malattia + Sostituto Automatico

```
Manager clicca turno → "Segna Malattia"
  → Server Action: reportAbsence()
    → Marca shift.status = "sick_leave"
    → tasks.trigger("find-best-substitutes", { shiftId })
  → Trigger.dev Worker (3-10s):
    1. find-best-substitutes: Query dipendenti con mansione giusta, disponibili, ore residue
       Ranking: ore residue (piu = meglio) + sede preferita + equita + costo
    2. prepare-substitute-suggestions: Formatta top 5, metadata.root.set("suggestions", [...])
  → Frontend mostra popup con sostituti suggeriti
  → Manager clicca "Assegna" su sostituto → Server Action crea nuovo shift + trigger notifica WhatsApp
```

### Flow 5: Report Mensile Commercialista

```
Titolare preme "Genera Report Mese" (o Vercel Cron automatico il giorno 1)
  → Server Action / Cron → tasks.trigger("aggregate-monthly-data", { month })
  → Trigger.dev Worker:
    1. aggregate-monthly-data: Query tutti shift del mese + assenze + festivita
       Calcola per dipendente: ore ordinarie, straordinarie, festive, malattia, ferie
    2. generate-report-files: Parallel genera PDF + CSV + Excel, upload su Supabase Storage
    3. save-report-metadata: Salva URL file e summary JSONB in reports table
    4. notify-accountant: Fire-and-forget → trigger Notification Dispatch
  → Commercialista riceve WhatsApp/Email: "Il report di Gennaio per Ristorante Rossi e pronto: [link]"
  → Commercialista accede al portale, scarica PDF/CSV/Excel
```

### Flow 6: Subscription & Billing

```
Titolare vuole vedere/gestire abbonamento
  → Profile Page: Server Action query Stripe API con org.stripe_customer_id
  → Stripe ritorna: piano attuale, data rinnovo, stato
  → Frontend mostra stato (MAI salvato in database)

Titolare vuole upgrade
  → Click "Upgrade" → Server Action crea Stripe Checkout session
  → Redirect a Stripe Checkout → Pagamento → Webhook conferma
  → Webhook aggiorna SOLO eventi (email conferma), NON dati piano in DB

Titolare vuole gestire pagamento
  → Click "Gestisci Abbonamento" → Server Action genera Stripe Portal URL
  → Redirect a Stripe Customer Portal (UI esterna gestita da Stripe)
```

---

## ⚠️ Technical Risk Assessment

### ✅ Stack Foundation Strengths (Low Risk)

- **Supabase Auth + RLS:** Multi-tenant isolation provata e robusta. Row Level Security su organization_id garantisce che nessun utente veda dati di altre organizzazioni. Pattern consolidato.

- **Next.js Server Actions:** Eliminano la necessita di creare API REST per operazioni interne. Type-safe, con validazione server-side. Riducono superficie attacco e complessita.

- **Stripe as Source of Truth:** Zero logica di billing nel nostro codice. Stripe gestisce tutto: upgrade, downgrade, pagamenti falliti, fatture. Noi query solo lo stato real-time.

- **Trigger.dev Cloud:** Managed infrastructure per background jobs. Retry automatico, monitoring, logs. Non dobbiamo gestire worker, code, o scaling.

- **Vercel Deployment:** Zero-config deployment, preview per ogni PR, edge network globale. Next.js 15 ottimizzato per Vercel.

### 🟡 Extension Integration Points (Monitor)

- **OpenAI API Latency & Costs**
  - Rischio: GPT-4 function calling puo richiedere 5-15 secondi per risposta. Con organizzazioni grandi (10+ locali, 100+ dipendenti), il prompt potrebbe diventare molto lungo.
  - Mitigazione: Parallelizzare per locale (ogni locale e un prompt separato), poi merge. Impostare timeout 30s. Cache risultati parziali in DB.
  - Costo stimato: ~$0.10-0.50 per generazione orario. A 100 clienti Pro con 4 gen/mese = ~$50-200/mese.

- **WhatsApp Business API (Twilio) Setup**
  - Rischio: L'approvazione dei template WhatsApp da Meta richiede 1-7 giorni. I template devono essere pre-approvati prima dell'invio.
  - Mitigazione: Preparare template standard durante lo sviluppo. Usare Twilio Sandbox per testing. Avere fallback su Email se WhatsApp non disponibile.
  - Costo stimato: ~$0.005 per messaggio WhatsApp. A 100 clienti con 30 dip media = ~$15-50/mese.

- **Real-Time Scheduler Drag & Drop**
  - Rischio: DnD Kit con griglia complessa (7 giorni x 20+ dipendenti) potrebbe avere problemi di performance. Ogni drop richiede validazione server (<2s).
  - Mitigazione: Validazione ottimistica frontend (check base client-side), validazione completa server-side. Virtualizzazione griglia per organizzazioni grandi. Lazy load dipendenti sidebar.

- **PDF/Excel Generation in Worker**
  - Rischio: @react-pdf/renderer e exceljs possono essere lenti per report con 100+ dipendenti. Memory usage elevato in worker.
  - Mitigazione: Trigger.dev supporta machine size configurabili. Generare i 3 formati in parallelo. Limit report a 12 mesi massimo per singola generazione.

### 🟢 Smart Architecture Decisions

- **Server Actions per operazioni interne, API Routes solo per webhook e AI suggest:** Riduce complessita, mantiene type safety, semplifica auth.

- **Fire-and-forget per notifiche:** Le notifiche non bloccano mai il workflow principale. Se WhatsApp fallisce, il report e comunque generato.

- **Organization-centric, non user-centric:** Un solo stripe_customer_id per organizzazione semplifica enormemente billing e quota enforcement.

- **JSONB per settings flessibili:** organization_settings, opening_hours, result_summary usano JSONB. Permette di aggiungere campi senza migration.

- **Nessun Redis/Cache:** Per MVP non serve. Supabase e gia ottimizzato per query. Se servira, si aggiunge dopo.

- **Nessun microservizio:** Tutto in un monolite Next.js + Trigger.dev workers. Piu semplice da sviluppare, deployare e debuggare.

---

## 🏗️ Implementation Strategy

### Phase 1: Foundation (Settimane 1-2)

**Obiettivo:** Auth funzionante, multi-tenant, CRUD base

- Setup progetto: Next.js 15 + Supabase + Drizzle ORM + Tailwind v4
- Supabase Auth: email/password + Google OAuth
- Database: migration tabelle Cluster 1-3 (organizations, users, locations, roles, employees)
- RLS policies su tutte le tabelle
- Onboarding wizard (5 step)
- CRUD locali + fabbisogno personale
- CRUD dipendenti + mansioni + preferenze
- Stripe: checkout, portal link, webhook base
- Layout responsive con sidebar role-based

### Phase 2: Scheduler Core (Settimane 3-4)

**Obiettivo:** Scheduler interattivo con drag & drop

- Database: migration tabelle Cluster 4 (schedules, shifts)
- Griglia scheduler con 3 viste (locale/dipendente/ruolo)
- DnD Kit: drag & drop turni con validazione
- API /api/ai/suggest per validazione real-time
- Sidebar dipendenti disponibili con filtri
- Dashboard titolare con overview cards
- Gestione manuale completa (senza AI ancora)

### Phase 3: AI & Background Jobs (Settimane 5-6)

**Obiettivo:** AI scheduling + notifiche + report

- Trigger.dev setup: account, configurazione, primo task
- AI Schedule Generation workflow (4 task)
- OpenAI GPT-4 integration con function calling
- Progress bar real-time (useRealtimeRunWithStreams)
- Notification Dispatch workflow (WhatsApp + Email)
- Twilio WhatsApp setup + template approval
- Resend email setup + template HTML
- Conflict Resolution workflow (sostituti automatici)
- Report generation workflow + upload Supabase Storage
- Vercel Cron per report mensile automatico

### Phase 4: Multi-Role & Polish (Settimane 7-8)

**Obiettivo:** Tutte le viste ruolo, commercialista, mobile

- Area dipendente mobile-first (PWA)
- Portale commercialista
- Sistema inviti (dipendenti + commercialista)
- Shift requests (cambio turno, ferie, malattia)
- CSV Import workflow
- Centro notifiche in-app
- Landing page con pricing
- Testing e2e per tutti i flussi

### Phase 5: Growth (Post-Launch)

- Time Clock digitale (timbratura geolocalizzata)
- Integrazione software paghe (Zucchetti, TeamSystem)
- Analytics dashboard avanzati
- Scambio turni peer-to-peer
- AI learning da storico
- App nativa iOS/Android

---

## 🛠️ Development Approach

### Template-First Development

Questa app non usa un template pre-esistente ma segue principi consolidati:
- **Supabase per tutto il backend data:** Auth, DB, Storage, Realtime. Un solo servizio da gestire.
- **Next.js Server Actions come default:** API Routes solo dove serve (webhook, AI suggest, cron).
- **Trigger.dev per tutto cio che dura >10s:** Non reinventare background job processing.
- **Stripe per tutto il billing:** Non costruire UI di billing custom.

### Minimal Viable Extensions

Servizi aggiunti solo perche necessari:
- **OpenAI:** L'AI scheduling e il differenziatore core. Senza, l'app e solo un foglio Excel interattivo.
- **Twilio WhatsApp:** Canale di comunicazione standard nel settore horeca italiano. Email da sola non basta.
- **Resend Email:** Complemento a WhatsApp per notifiche formali, report, inviti.

Servizi deliberatamente NON aggiunti:
- **Redis/Cache:** Non serve per MVP. Supabase gestisce le query.
- **CDN/Edge:** Vercel lo fornisce gratis con il deployment.
- **Monitoring (Sentry, DataDog):** Si aggiunge quando ci sono utenti reali. Trigger.dev ha monitoring built-in.
- **Analytics (Mixpanel, Amplitude):** Si aggiunge post-launch. Per ora bastano le metriche admin.
- **Search Engine (Algolia, Meilisearch):** 50 dipendenti si cercano con LIKE/pg_trgm.

---

## 🔄 Background Job Workflows (Trigger.dev)

### AI Schedule Generation Workflow
**Purpose:** Genera l'orario settimanale ottimale per tutti i locali
**Trigger:** Titolare preme "Genera con AI"
**Task Chain:**
```
collect-constraints → optimize-schedule → validate-schedule → save-results
                      (OpenAI GPT-4)     (auto-resolve AI)   (bulk insert)
                      ⚡ Parallel/locale  max 3 retry
```
**Key Patterns:**
- Progress: metadata.root.set() per propagare da child a root task
- Streaming: metadata.stream("schedule-preview") per preview live
- Database: query 6 tabelle vincoli → bulk insert shifts
- Error: graceful degradation (orario parziale con lista turni scoperti)

### Notification Dispatch Workflow
**Purpose:** Invio batch WhatsApp + Email
**Trigger:** Eventi app (pubblicazione, cambio turno, report pronto)
**Task Chain:**
```
prepare-notifications → send-batch → finalize
                        ⚡ Parallel WA+Email
```
**Key Patterns:**
- Parallel: WhatsApp e Email inviate simultaneamente
- Rate limiting: 50 WA/sec, 10 Email/sec
- Partial success: job completa anche con alcuni fallimenti
- Fallback: se WA fallisce, retry via Email

### Monthly Report Workflow
**Purpose:** Compila report mensile ore/costi per commercialista
**Trigger:** Titolare o Vercel Cron mensile
**Task Chain:**
```
aggregate-data → generate-files → save-metadata → notify-accountant
                 ⚡ PDF+CSV+Excel                  🔥 Fire-and-forget
```
**Key Patterns:**
- Parallel: 3 formati file generati simultaneamente
- Storage: upload su Supabase Storage bucket "reports"
- Fire-and-forget: notifica commercialista non blocca completamento

### Conflict Resolution Workflow
**Purpose:** Trova sostituti quando dipendente si ammala
**Trigger:** Manager segna malattia
**Task Chain:**
```
find-substitutes → prepare-suggestions
(ranking AI)      (metadata.root.set)
```
**Key Patterns:**
- Veloce: <10 secondi, no streaming necessario
- Ranking: ore residue + sede preferita + equita + costo
- Real-time: suggerimenti via metadata, non salvati in DB

---

## 📊 Usage Tracking Pattern

```
Titolare aggiunge locale/dipendente o genera AI schedule
  → Server Action verifica quota:
    1. Query Stripe API per piano attuale (starter/pro/business)
    2. Query usage_tracking per conteggio mese corrente
    3. Confronta con limiti piano (in codice, non in DB)
  → Se sotto quota: esegui azione + incrementa contatore
  → Se sopra quota: mostra messaggio upgrade + link Stripe Checkout
```

---

## 🎯 Success Metrics

This system architecture supports the core value proposition: **Creare gli orari del personale in pochi minuti con AI, gestire imprevisti con drag & drop, e inviare report automatici al commercialista.**

**Stack Optimization:**
- Leverages Supabase per auth, DB, storage, realtime (un solo servizio backend)
- Leverages Vercel per deployment, edge, cron (zero config)
- Leverages Stripe per billing completo (zero custom billing UI)
- Leverages Trigger.dev per background jobs (zero infrastruttura worker)

**Focused Extensions:**
- OpenAI per AI scheduling (core differentiator)
- Twilio + Resend per notifiche multi-canale (requisito mercato italiano)

**Avoided Complexity:**
- No Redis, no microservizi, no custom auth, no custom billing
- Monolite Next.js gestibile da 1-2 sviluppatori
- Scaling verticale su Supabase Pro quando serve

> **Next Steps:** Ready for implementation. Start with Phase 1 (Foundation), poi Phase 2 (Scheduler Core). L'AI e i background jobs vengono aggiunti in Phase 3 quando il CRUD base funziona.
