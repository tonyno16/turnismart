# Trigger.dev Workflows Summary

### App Summary

**End Goal:** Aiutare titolari e manager di attivita commerciali multi-sede a creare, gestire e ottimizzare gli orari del personale in pochi minuti e inviare report automatici al commercialista
**Core Value Proposition:** AI scheduling agent che genera orari ottimali + drag & drop + report automatici commercialista
**Target Users:** Titolari multi-sede, Manager, Dipendenti, Commercialisti
**Template Type:** Interactive scheduling SaaS con AI agent e background job processing via Trigger.dev

---

## 🔄 All Workflows Overview

**Total Workflows:** 6

### 📅 1. AI Schedule Generation
**File:** `trigger_workflow_ai_schedule.md`
**Purpose:** Genera l'orario settimanale ottimale per tutti i locali usando l'AI agent
**Trigger:** Titolare preme "Genera con AI" nello Scheduler
**Duration:** 10-30 secondi (dipende dal numero di locali/dipendenti)
**Dependencies:** Nessuna (workflow fondazione)
**Task Count:** 4 Trigger.dev tasks
**Priority:** HIGH

### 📲 2. Notification Dispatch
**File:** `trigger_workflow_notifications.md`
**Purpose:** Invio batch di notifiche WhatsApp e Email a dipendenti, manager e commercialisti
**Trigger:** Pubblicazione orario, cambio turno, report pronto, o altri eventi
**Duration:** 5-60 secondi (dipende dal numero di destinatari)
**Dependencies:** Nessuna (indipendente, attivato da eventi)
**Task Count:** 3 Trigger.dev tasks
**Priority:** HIGH

### 📊 3. Monthly Report Generation
**File:** `trigger_workflow_monthly_report.md`
**Purpose:** Compila il report mensile ore/costi per il commercialista e genera file PDF/CSV/Excel
**Trigger:** Titolare preme "Genera Report" oppure cron job automatico a fine mese
**Duration:** 15-45 secondi (dipende dal numero di dipendenti e complessita)
**Dependencies:** Dipende da Notification Dispatch (per notifica al commercialista)
**Task Count:** 4 Trigger.dev tasks
**Priority:** HIGH

### 📥 4. Employee CSV Import
**File:** `trigger_workflow_csv_import.md`
**Purpose:** Import batch di dipendenti da file CSV con validazione e creazione record
**Trigger:** Titolare carica file CSV nella pagina Dipendenti o durante Onboarding
**Duration:** 5-30 secondi (dipende dal numero di righe)
**Dependencies:** Nessuna
**Task Count:** 3 Trigger.dev tasks
**Priority:** MEDIUM

### 🔄 5. Schedule Conflict Resolution
**File:** `trigger_workflow_conflict_resolution.md`
**Purpose:** Quando viene segnalata una malattia o assenza, trova automaticamente i migliori sostituti e suggerisce riallocazioni
**Trigger:** Manager o titolare segna un dipendente come malato/assente
**Duration:** 3-10 secondi
**Dependencies:** Dipende da AI Schedule Generation (usa stessa logica AI)
**Task Count:** 2 Trigger.dev tasks
**Priority:** HIGH

### 📧 6. Accountant Invitation & Link
**File:** `trigger_workflow_accountant_invite.md`
**Purpose:** Gestisce l'invio dell'invito al commercialista via Email e WhatsApp con link di accesso al portale
**Trigger:** Titolare collega un commercialista nelle impostazioni
**Duration:** 3-10 secondi
**Dependencies:** Dipende da Notification Dispatch (riusa logica invio)
**Task Count:** 2 Trigger.dev tasks
**Priority:** MEDIUM

---

## 🌳 Complete Dependency Tree

```
📅 AI Schedule Generation (Foundation - Build First)
  • No dependencies
  • Provides: logica AI scheduling, algoritmo ottimizzazione
  • Priority: HIGH
  • Riusato da: Conflict Resolution
     │
     ├─→ 🔄 Schedule Conflict Resolution (Dependent - Build Third)
     │     • Requires: stessa AI engine di Schedule Generation
     │     • Provides: suggerimenti sostituti automatici
     │     • Priority: HIGH
     │
     └─→ 📊 Monthly Report Generation (Independent - Build Fourth)
           • No dependency diretta su AI, ma usa dati schedule
           • Provides: report PDF/CSV/Excel per commercialista
           • Priority: HIGH
                │
                └─→ fires Notification Dispatch (per notificare commercialista)

📲 Notification Dispatch (Foundation - Build Second)
  • No dependencies
  • Provides: infrastruttura invio WhatsApp/Email
  • Priority: HIGH
  • Riusato da: tutti gli altri workflow per notifiche
     │
     └─→ 📧 Accountant Invitation (Dependent - Build Fifth)
           • Requires: logica invio notifiche
           • Provides: onboarding commercialista
           • Priority: MEDIUM

📥 Employee CSV Import (Independent - Build Sixth)
  • No dependencies
  • Provides: import batch dipendenti
  • Priority: MEDIUM
  • Standalone, puo essere costruito in qualsiasi momento
```

---

## 🛠️ Build Order Recommendation

### Phase 1: Core Functionality (MVP Launch)
Build these workflows first for minimum viable product:

1. **AI Schedule Generation** (`trigger_workflow_ai_schedule.md`)
   - Why first: Cuore dell'app, differenziatore principale, nessuna dipendenza
   - Estimated time: 3-5 giorni sviluppo
   - Complexity: Complex (algoritmo AI + ottimizzazione vincoli)

2. **Notification Dispatch** (`trigger_workflow_notifications.md`)
   - Why second: Infrastruttura condivisa da tutti gli altri workflow, essenziale per UX
   - Estimated time: 2-3 giorni sviluppo
   - Complexity: Medium (integrazione WhatsApp API + Email + template)

3. **Schedule Conflict Resolution** (`trigger_workflow_conflict_resolution.md`)
   - Why third: Feature critica per gestione quotidiana (malattie/assenze), riusa AI engine
   - Estimated time: 1-2 giorni sviluppo
   - Complexity: Medium (riusa logica AI, aggiunge filtro sostituti)

4. **Monthly Report Generation** (`trigger_workflow_monthly_report.md`)
   - Why fourth: Essenziale per il value proposition verso i commercialisti
   - Estimated time: 2-3 giorni sviluppo
   - Complexity: Medium (query aggregazione + generazione PDF/CSV/Excel)

### Phase 2: Enhancements (Post-Launch)

5. **Accountant Invitation** (`trigger_workflow_accountant_invite.md`)
   - Why deferred: Non critico per launch, il commercialista puo essere collegato manualmente
   - Estimated time: 1 giorno sviluppo
   - Complexity: Simple (riusa Notification Dispatch)

6. **Employee CSV Import** (`trigger_workflow_csv_import.md`)
   - Why deferred: I dipendenti possono essere aggiunti manualmente, CSV e una comodita
   - Estimated time: 1-2 giorni sviluppo
   - Complexity: Medium (parsing CSV + validazione + batch insert)

### Phase 3: Growth Features (Future)
Workflow futuri non ancora documentati:

- **Time Clock Processing** - Elaborazione timbrature e confronto con pianificato
- **Predictive Staffing** - AI che prevede fabbisogno basato su storico/stagionalita
- **Payroll Software Integration** - Export diretto verso Zucchetti/TeamSystem via API
- **Auto-Schedule Cron** - Generazione automatica orario settimana successiva ogni domenica sera

---

## 📚 Technology Stack Requirements

### Trigger.dev Configuration
- **Trigger.dev v4 Account:** Required for all workflows
- **Project Setup:** Create project at trigger.dev
- **Environment Variables:**
  - `TRIGGER_SECRET_KEY` - Project secret key
  - `TRIGGER_API_URL` - API endpoint (default: cloud)

### Build Extensions
- Nessuna build extension speciale richiesta (no FFmpeg, no Puppeteer)
- Le operazioni sono tutte basate su API calls e database queries

### External Services & APIs

- **OpenAI API** - Required for: AI Schedule Generation, Conflict Resolution
  - API Key: `OPENAI_API_KEY`
  - Purpose: Algoritmo di ottimizzazione scheduling con GPT-4 / function calling
  - Rate limits: Tier 1 (500 RPM) sufficiente per MVP
  - Alternativa: Claude API (`ANTHROPIC_API_KEY`) per constraint solving

- **WhatsApp Business API (via Twilio)** - Required for: Notification Dispatch, Accountant Invitation
  - API Key: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`
  - Purpose: Invio notifiche WhatsApp a dipendenti e commercialisti
  - Rate limits: 1000 messaggi/giorno (Twilio standard)
  - Alternativa: Meta Cloud API (gratuita per template messages)

- **Resend** - Required for: Notification Dispatch, Accountant Invitation, Monthly Report
  - API Key: `RESEND_API_KEY`
  - Purpose: Invio email transazionali (orari, report, inviti)
  - Rate limits: 100 email/giorno (free tier), 50k/mese (pro)

- **Supabase** - Required for: All workflows (database + storage)
  - API Key: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  - Purpose: Database queries, file storage per report PDF

### Database Requirements

**PostgreSQL Extensions:**
- `uuid-ossp` - UUID generation per job IDs e record IDs
- `pg_trgm` - Ricerca fuzzy per nomi dipendenti (opzionale)

**Job Tracking Tables** (da creare in database schema phase):
- `schedule_generation_jobs` - Job AI scheduling: status, progress, metadata, risultato
- `notification_jobs` - Job notifiche: status, destinatari, canale, delivery status
- `report_generation_jobs` - Job report: status, periodo, file generati
- `import_jobs` - Job import CSV: status, righe processate, errori

**Supabase Storage Buckets:**
- `reports` - Stores: file PDF/CSV/Excel dei report mensili generati
- `imports` - Stores: file CSV caricati per import dipendenti (temporaneo)
- `avatars` - Stores: foto profilo utenti e logo attivita

---

## 📋 Detailed Workflow Documentation

---

### 📅 Workflow 1: AI Schedule Generation

#### Overview
Il workflow principale dell'app. Quando il titolare preme "Genera con AI", il sistema analizza tutti i vincoli (fabbisogno locali, disponibilita dipendenti, preferenze, incompatibilita, contratti) e genera l'orario settimanale ottimale per tutti i locali selezionati.

#### Task Chain Diagram

```
[TITOLARE PREME "GENERA CON AI"]
        ↓
[Server Action: createScheduleGenerationJob()]
  • Valida quota piano (AI generations/mese)
  • Crea record in schedule_generation_jobs (status: "pending")
  • Triggera Trigger.dev task con jobId
        ↓
┌──────────────────────────────────────────────┐
│ Task 1: collect-scheduling-constraints       │
│ • Query database: tutti i locali selezionati │
│ • Query: fabbisogno per locale/giorno/fascia │
│ • Query: tutti i dipendenti attivi           │
│ • Query: disponibilita e preferenze          │
│ • Query: incompatibilita colleghi            │
│ • Query: contratti e ore residue             │
│ • Query: turni settimane precedenti (equita) │
│ • Output: ConstraintsPayload completo        │
│ • Progress: 0% → 20%                        │
│ • metadata.root.set("currentStep",           │
│   "Raccolta vincoli...")                     │
└─────────────┬────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────┐
│ Task 2: optimize-schedule                    │
│ • Costruisci prompt AI con tutti i vincoli   │
│ • Chiama OpenAI GPT-4 con function calling   │
│ • Il modello ritorna schedule strutturato    │
│ • Formato: array di shift assignments        │
│ • ⚡ Se molti locali: parallel per locale   │
│ •   (ogni locale ottimizzato separatamente,  │
│     poi merge e risoluzione conflitti cross)  │
│ • Progress: 20% → 70%                       │
│ • metadata.root.set("currentStep",           │
│   "Ottimizzazione turni...")                 │
│ • metadata.stream("schedule-preview",        │
│   partialScheduleStream)                     │
└─────────────┬────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────┐
│ Task 3: validate-schedule                    │
│ • Verifica conflitti: stesso dipendente su   │
│   due turni sovrapposti                      │
│ • Verifica ore massime contrattuali          │
│ • Verifica riposi obbligatori (11h tra turni)│
│ • Verifica indisponibilita rispettate        │
│ • Verifica incompatibilita colleghi          │
│ • Se conflitti trovati:                      │
│   → Chiama AI per risolverli automaticamente │
│   → Max 3 tentativi di risoluzione           │
│ • Output: ValidatedSchedulePayload          │
│ • Progress: 70% → 90%                       │
│ • metadata.root.set("currentStep",           │
│   "Validazione conflitti...")                │
└─────────────┬────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────┐
│ Task 4: save-schedule-results                │
│ • Salva tutti gli shift nel database         │
│ • Aggiorna schedule status: "draft"          │
│ • Calcola statistiche: copertura, costi,     │
│   ore straordinarie, equita distribuzione    │
│ • Aggiorna job status: "completed"           │
│ • Salva warnings (turni non coperti, ecc.)   │
│ • Progress: 90% → 100%                      │
│ • metadata.root.set("currentStep",           │
│   "Orario generato!")                        │
└──────────────────────────────────────────────┘
        ↓
[Frontend: useRealtimeRunWithStreams()]
  • Mostra progress bar 0-100% in tempo reale
  • Mostra step corrente ("Raccolta vincoli...", etc.)
  • Al completamento: refresh griglia scheduler con nuovo orario
  • Se errore: mostra messaggio + pulsante "Riprova"
```

#### Payload Interfaces

```typescript
// Task 1 Input
interface ScheduleGenerationInput {
  jobId: string;
  organizationId: string;
  weekStartDate: string; // ISO date
  locationIds: string[]; // locali da schedulare ("tutti" o selezione)
  options: {
    mode: "full" | "fill-gaps" | "single-location";
    optimizeCosts: boolean;
    respectPreferences: boolean;
  };
}

// Task 1 Output → Task 2 Input
interface ConstraintsPayload {
  jobId: string;
  locations: Array<{
    id: string;
    name: string;
    openingHours: Record<DayOfWeek, { open: string; close: string } | null>;
    staffRequirements: Record<DayOfWeek, Record<ShiftPeriod, Record<RoleId, number>>>;
  }>;
  employees: Array<{
    id: string;
    name: string;
    roles: RoleId[];
    contractType: string;
    weeklyHours: number;
    maxHours: number;
    hourlyRate: number;
    preferredLocationId: string | null;
    unavailableDays: DayOfWeek[];
    incompatibleWith: string[]; // employee IDs
    hoursWorkedThisWeek: number;
    recentShiftHistory: ShiftRecord[];
  }>;
  existingShifts: ShiftRecord[]; // turni gia assegnati manualmente
  rules: {
    minRestBetweenShifts: number; // ore (default: 11)
    maxConsecutiveDays: number; // default: 6
    overtimeThreshold: number; // ore dopo cui scatta straordinario
  };
}

// Task 2 Output → Task 3 Input
interface GeneratedSchedulePayload {
  jobId: string;
  shifts: Array<{
    employeeId: string;
    locationId: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    roleId: string;
    isAutoGenerated: boolean;
  }>;
  unfilledSlots: Array<{
    locationId: string;
    dayOfWeek: DayOfWeek;
    period: ShiftPeriod;
    roleId: string;
    reason: string;
  }>;
  costEstimate: number;
  overtimeHours: number;
}

// Task 3 Output → Task 4 Input
interface ValidatedSchedulePayload extends GeneratedSchedulePayload {
  conflicts: Array<{
    type: "overlap" | "max-hours" | "rest-period" | "unavailable" | "incompatible";
    description: string;
    resolved: boolean;
    resolution?: string;
  }>;
  warnings: string[];
  validationPassed: boolean;
}
```

#### Database Schema

```sql
-- Job tracking per AI schedule generation
CREATE TABLE schedule_generation_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  week_start_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
    -- pending, collecting, optimizing, validating, completed, failed
  progress INTEGER DEFAULT 0,
  current_step TEXT,
  trigger_run_id TEXT, -- Trigger.dev run ID per real-time tracking
  location_ids TEXT[], -- locali inclusi
  options JSONB, -- mode, optimizeCosts, etc.
  result_summary JSONB, -- statistiche post-generazione
  warnings TEXT[],
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

#### Progress Tracking Pattern
- **Frontend**: `useRealtimeRunWithStreams()` hook sottoscritto al root run ID
- **Streaming**: schedule preview streammato durante ottimizzazione (Task 2)
- **Database**: job status e progress aggiornati ad ogni step
- **Root metadata**: tutti i child task usano `metadata.root.set()` per propagare al frontend

#### Error Handling
- **Retry strategy**: 3 tentativi con backoff esponenziale per chiamate OpenAI
- **Fast fail**: Quota superata, nessun dipendente attivo, nessun locale configurato
- **Graceful degradation**: Se AI non riesce a coprire tutti i turni, genera orario parziale con lista turni scoperti
- **User messages**:
  - "Quota AI esaurita per questo mese. Passa al piano Pro per generazioni illimitate."
  - "Impossibile generare: nessun dipendente disponibile per [locale] il [giorno]."
  - "Orario generato con X turni scoperti. Vuoi assegnare manualmente?"

---

### 📲 Workflow 2: Notification Dispatch

#### Overview
Infrastruttura condivisa per l'invio di notifiche WhatsApp e Email. Attivato da vari eventi dell'app (pubblicazione orario, cambio turno, report pronto, inviti). Gestisce template messaggi, rate limiting, e tracking delivery.

#### Task Chain Diagram

```
[EVENTO TRIGGERA NOTIFICA]
  • Pubblicazione orario → notifica tutti i dipendenti
  • Cambio turno → notifica dipendente coinvolto
  • Report pronto → notifica commercialista
  • Invito → notifica nuovo utente
        ↓
[Server Action: createNotificationJob()]
  • Crea record in notification_jobs
  • Prepara lista destinatari con canale preferito
  • Triggera Trigger.dev task
        ↓
┌──────────────────────────────────────────────┐
│ Task 1: prepare-notifications                │
│ • Query destinatari e preferenze canale      │
│ • Seleziona template messaggio per evento    │
│ • Personalizza messaggio per ogni dest.      │
│   (nome, locale, orario, link)               │
│ • Raggruppa per canale: WhatsApp vs Email    │
│ • Progress: 0% → 20%                        │
└─────────────┬────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────┐
│ Task 2: send-notifications-batch             │
│ • ⚡ Parallel: WhatsApp + Email in parallelo │
│                                              │
│ WhatsApp batch:                              │
│ • Per ogni destinatario WhatsApp:            │
│   → Chiama Twilio WhatsApp API              │
│   → Usa template pre-approvato Meta         │
│   → Rate limit: max 50/secondo              │
│ • Salva delivery status per messaggio        │
│                                              │
│ Email batch:                                 │
│ • Per ogni destinatario Email:               │
│   → Chiama Resend API                       │
│   → Template HTML responsive                 │
│ • Salva delivery status per messaggio        │
│                                              │
│ • Progress: 20% → 90%                       │
└─────────────┬────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────┐
│ Task 3: finalize-notification-job            │
│ • Aggiorna job status: completed/partial     │
│ • Conta: inviati, falliti, pending           │
│ • Se fallimenti: schedula retry per falliti  │
│ • Salva summary nel database                 │
│ • Progress: 90% → 100%                      │
└──────────────────────────────────────────────┘
```

#### Notification Templates

```typescript
type NotificationEvent =
  | "schedule_published"      // Orario pubblicato: "Il tuo orario per la settimana X e pronto"
  | "shift_changed"           // Turno modificato: "Il tuo turno di [giorno] e stato cambiato"
  | "shift_assigned"          // Nuovo turno: "Ti e stato assegnato un turno [dettagli]"
  | "shift_cancelled"         // Turno cancellato: "Il tuo turno di [giorno] e stato cancellato"
  | "sick_leave_replacement"  // Sostituzione: "Puoi coprire il turno di [collega] [giorno]?"
  | "request_approved"        // Richiesta approvata: "La tua richiesta di [tipo] e stata approvata"
  | "request_rejected"        // Richiesta rifiutata: "La tua richiesta di [tipo] e stata rifiutata"
  | "report_ready"            // Report pronto: "Il report di [mese] per [attivita] e disponibile"
  | "invitation"              // Invito: "Sei stato invitato a unirti a [attivita] su [app]"
  | "trial_expiring"          // Trial in scadenza: "Il tuo periodo gratuito scade tra X giorni"

interface NotificationPayload {
  jobId: string;
  event: NotificationEvent;
  organizationId: string;
  recipients: Array<{
    userId: string;
    name: string;
    phone?: string;     // per WhatsApp
    email?: string;     // per Email
    preferredChannel: "whatsapp" | "email" | "both";
  }>;
  data: Record<string, string>; // variabili template (nome, giorno, locale, link, etc.)
}
```

#### Error Handling
- **Retry strategy**: 3 tentativi per singolo messaggio fallito, backoff 30s/60s/120s
- **Rate limiting**: Max 50 WhatsApp/sec, 10 Email/sec (Resend free tier)
- **Partial success**: Job completato anche se alcuni messaggi falliscono
- **Fallback**: Se WhatsApp fallisce, retry via Email (e viceversa se entrambi configurati)
- **User messages**: "Notifiche inviate a X dipendenti. Y messaggi in attesa di delivery."

---

### 📊 Workflow 3: Monthly Report Generation

#### Overview
Compila il report mensile con tutte le ore lavorate, suddivise per tipo (ordinarie, straordinarie, festive, malattia, ferie), per ogni dipendente, con calcolo costi. Genera file PDF, CSV e Excel scaricabili dal commercialista.

#### Task Chain Diagram

```
[TITOLARE PREME "GENERA REPORT" O CRON AUTOMATICO]
        ↓
[Server Action: createReportGenerationJob()]
  • Valida: il mese selezionato ha dati sufficienti?
  • Crea record in report_generation_jobs
  • Triggera Trigger.dev task
        ↓
┌──────────────────────────────────────────────┐
│ Task 1: aggregate-monthly-data               │
│ • Query tutti gli shift del mese             │
│ • Query assenze: malattia, ferie, permessi   │
│ • Per ogni dipendente calcola:               │
│   - Ore ordinarie (fino a soglia contratto)  │
│   - Ore straordinarie (oltre soglia)         │
│   - Ore festive (domeniche, festivita)       │
│   - Ore malattia                             │
│   - Ore ferie/permesso                       │
│   - Costo lordo: ore * paga oraria per tipo  │
│ • Raggruppa anche per punto vendita          │
│ • Progress: 0% → 40%                        │
└─────────────┬────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────┐
│ Task 2: generate-report-files                │
│ • ⚡ Parallel: genera 3 formati in parallelo │
│                                              │
│ PDF generation:                              │
│ • Report formattato con logo attivita        │
│ • Riepilogo generale + dettaglio dipendenti  │
│ • Tabella per punto vendita                  │
│ • Usa @react-pdf/renderer o puppeteer-core   │
│                                              │
│ CSV generation:                              │
│ • Formato tabellare semplice                 │
│ • Compatibile import software paghe          │
│ • Colonne: Nome, Contratto, Ore ord., etc.   │
│                                              │
│ Excel generation:                            │
│ • Multi-foglio: Riepilogo, Per Dipendente,   │
│   Per Locale, Dettaglio Giornaliero          │
│ • Usa exceljs library                        │
│ • Formule per totali automatici              │
│                                              │
│ • Upload files su Supabase Storage           │
│ • Progress: 40% → 85%                       │
└─────────────┬────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────┐
│ Task 3: save-report-metadata                 │
│ • Salva URL file generati nel database       │
│ • Aggiorna report status: "ready"            │
│ • Progress: 85% → 95%                       │
└─────────────┬────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────┐
│ Task 4: notify-accountant (fire-and-forget)  │
│ • Se commercialista collegato:               │
│   → Triggera Notification Dispatch workflow  │
│   → Evento: "report_ready"                  │
│   → Include link diretto al report           │
│ • Non blocca il completamento del job        │
│ • Progress: 95% → 100%                      │
└──────────────────────────────────────────────┘
```

#### Database Schema

```sql
CREATE TABLE report_generation_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  month DATE NOT NULL, -- primo giorno del mese (es. 2025-01-01)
  status TEXT NOT NULL DEFAULT 'pending',
    -- pending, aggregating, generating, completed, failed
  progress INTEGER DEFAULT 0,
  trigger_run_id TEXT,
  pdf_url TEXT,
  csv_url TEXT,
  excel_url TEXT,
  summary JSONB, -- totale ore, totale costi, num dipendenti
  accountant_notified BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

#### Error Handling
- **Retry strategy**: 2 tentativi per generazione file, 3 per upload storage
- **Fast fail**: Nessun dato per il mese selezionato
- **Partial success**: Se un formato file fallisce, gli altri vengono comunque generati
- **User messages**: "Report generato. PDF e CSV disponibili. Excel in errore, riprova."

---

### 📥 Workflow 4: Employee CSV Import

#### Task Chain Diagram

```
[TITOLARE CARICA FILE CSV]
        ↓
[Server Action: uploadAndCreateImportJob()]
  • Upload CSV su Supabase Storage (bucket: imports)
  • Valida estensione file (.csv)
  • Crea record in import_jobs
  • Triggera Trigger.dev task
        ↓
┌──────────────────────────────────────────────┐
│ Task 1: parse-and-validate-csv               │
│ • Scarica file da Supabase Storage           │
│ • Parse CSV con papaparse                    │
│ • Identifica colonne (auto-mapping):         │
│   nome, cognome, email, telefono, mansioni,  │
│   contratto, ore_settimanali, paga_oraria    │
│ • Valida ogni riga:                          │
│   - Campi obbligatori presenti?              │
│   - Email formato valido?                    │
│   - Telefono formato italiano?               │
│   - Mansione esiste nei ruoli configurati?   │
│ • Output: righe valide + righe con errori    │
│ • Progress: 0% → 40%                        │
└─────────────┬────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────┐
│ Task 2: create-employee-records              │
│ • Per ogni riga valida:                      │
│   → Crea record dipendente nel database      │
│   → Associa mansioni e contratto             │
│   → Genera token invito per accesso app      │
│ • ⚡ Batch insert (non uno per uno)          │
│ • Verifica duplicati (email/telefono)        │
│ • Progress: 40% → 80%                       │
└─────────────┬────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────┐
│ Task 3: finalize-import                      │
│ • Aggiorna job: importati X, errori Y, dup Z │
│ • Elimina file CSV da storage (temporaneo)   │
│ • Se richiesto: triggera inviti WhatsApp/    │
│   Email per i nuovi dipendenti importati     │
│ • Progress: 80% → 100%                      │
└──────────────────────────────────────────────┘
```

#### Error Handling
- **Fast fail**: File non CSV, file vuoto, troppi errori (>50% righe invalide)
- **Partial success**: Importa righe valide, ritorna lista errori per righe invalide
- **Duplicati**: Skip se email o telefono gia esistente, conta come "skipped"
- **User messages**: "Importati 45 dipendenti. 3 righe con errori. 2 duplicati saltati."

---

### 🔄 Workflow 5: Schedule Conflict Resolution

#### Task Chain Diagram

```
[MANAGER/TITOLARE SEGNA MALATTIA O ASSENZA]
        ↓
[Server Action: reportAbsenceAndFindSubstitute()]
  • Marca turno come "scoperto per malattia/assenza"
  • Crea record assenza
  • Triggera Trigger.dev task per trovare sostituti
        ↓
┌──────────────────────────────────────────────┐
│ Task 1: find-best-substitutes                │
│ • Query turno scoperto: locale, giorno,      │
│   fascia oraria, ruolo richiesto             │
│ • Query tutti i dipendenti che:              │
│   - Hanno la mansione richiesta              │
│   - Sono disponibili quel giorno/fascia      │
│   - Non hanno gia un turno sovrapposto       │
│   - Non supererebbero le ore contrattuali    │
│   - Non hanno incompatibilita con colleghi   │
│     presenti in quel turno                   │
│ • Ranking per:                               │
│   1. Ore residue contrattuali (piu = meglio) │
│   2. Sede preferita (match = bonus)          │
│   3. Equita: chi ha lavorato meno questa     │
│      settimana va favorito                   │
│   4. Paga oraria (ottimizzazione costi)      │
│ • Output: top 5 sostituti con ranking score  │
│ • Progress: 0% → 70%                        │
└─────────────┬────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────┐
│ Task 2: prepare-substitute-suggestions       │
│ • Formatta suggerimenti per il frontend      │
│ • Per ogni sostituto: nome, ore residue,     │
│   sede preferita, score, warning eventuali   │
│ • Salva suggerimenti nel database            │
│ • Aggiorna job status: "suggestions_ready"   │
│ • Progress: 70% → 100%                      │
│ • metadata.root.set("suggestions",           │
│   suggerimentiJSON)                          │
└──────────────────────────────────────────────┘
        ↓
[Frontend: mostra popup con sostituti suggeriti]
  • Titolare/Manager seleziona sostituto con un click
  • Server Action: assegna turno al sostituto
  • Triggera Notification Dispatch per notificare il sostituto
```

#### Error Handling
- **No sostituti**: "Nessun dipendente disponibile con la mansione [ruolo] per [giorno]. Considera di assegnare manualmente."
- **Pochi sostituti**: Mostra quelli disponibili + warning "Solo X sostituti trovati"
- **Fast execution**: Questo workflow deve completare in <10 secondi per UX ottimale

---

### 📧 Workflow 6: Accountant Invitation

#### Task Chain Diagram

```
[TITOLARE INSERISCE EMAIL/TELEFONO COMMERCIALISTA]
        ↓
[Server Action: inviteAccountant()]
  • Genera token invito univoco
  • Salva invito nel database con scadenza 7 giorni
  • Triggera Trigger.dev task
        ↓
┌──────────────────────────────────────────────┐
│ Task 1: send-accountant-invite               │
│ • Prepara messaggio personalizzato:          │
│   "[Titolare] ti ha invitato a gestire i     │
│    report del personale di [Attivita] su     │
│    [NomeApp]. Clicca per accedere: [link]"   │
│ • ⚡ Parallel: WhatsApp + Email              │
│   → WhatsApp: template con link portale      │
│   → Email: template HTML con branding        │
│ • Progress: 0% → 80%                        │
└─────────────┬────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────┐
│ Task 2: finalize-invite                      │
│ • Aggiorna stato invito: "sent"              │
│ • Schedula reminder se non accettato in 3 gg │
│ • Progress: 80% → 100%                      │
└──────────────────────────────────────────────┘
```

---

## 🎯 Common Patterns Across All Workflows

All workflows in this application follow these architectural principles:

### 1. Database as Source of Truth
- All state stored in PostgreSQL via Drizzle ORM
- Never rely on task memory or session state
- Always query database for latest job state

### 2. Payload-Based Task Chaining
- Tasks pass data via typed TypeScript interfaces
- Each task is stateless and independently retryable
- No shared memory between tasks

### 3. Progress Tracking
- **Database:** Update job status/progress in job tracking table
- **Metadata:** Use `metadata.root.set()` for real-time UI updates (propagates through nesting)
- **Frontend:** Streaming via `useRealtimeRunWithStreams()` for AI Schedule Generation, polling for others

### 4. Conditional Routing
- Use `tasks.trigger()` with if/else logic
- Keep branching simple and explicit
- Example: AI Schedule Generation branches per locale se sono molti

### 5. Error Isolation
- Each task handles its own errors
- Non-critical failures don't block core workflow (es. notifica fallita non blocca report)
- User-friendly error messages stored in database

### 6. Fire-and-Forget for Non-Blocking
- Notification Dispatch e sempre fire-and-forget quando triggerato da altri workflow
- Non blocca il completamento del workflow principale
- Example: Report Generation triggera notifica al commercialista senza attendere delivery

### 7. Parallel Processing
- WhatsApp + Email inviati in parallelo (Notification Dispatch)
- PDF + CSV + Excel generati in parallelo (Report Generation)
- Ottimizzazione per locale in parallelo se >3 locali (AI Schedule Generation)

### 8. Real-Time Streaming
- `metadata.stream()` usato per preview schedule durante AI generation
- Frontend usa `useRealtimeRunWithStreams()` per mostrare progress live
- Solo per AI Schedule Generation (workflow piu lungo e complesso)

---

## 📝 Implementation Readiness Checklist

Before starting implementation, verify:

### Documentation Complete
- [x] All 6 workflows documented with task chains
- [x] Task payload interfaces defined (TypeScript)
- [x] Database schema requirements identified
- [x] Progress tracking patterns specified
- [x] Error handling strategies documented
- [x] File locations and naming conventions defined

### Environment Setup
- [ ] Trigger.dev v4 account created
- [ ] Project created in Trigger.dev dashboard
- [ ] `TRIGGER_SECRET_KEY` added to `.env.local`
- [ ] OpenAI API key obtained (`OPENAI_API_KEY`)
- [ ] Twilio account created with WhatsApp sandbox (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`)
- [ ] Resend account created (`RESEND_API_KEY`)
- [ ] Supabase storage buckets created (reports, imports, avatars)

### Architecture Understanding
- [x] Dependency chain understood (AI Schedule → Conflict Resolution, Notifications → everything)
- [x] Build order confirmed (6 workflows in priority order)
- [x] Parallel processing opportunities identified (notifications, report files, multi-locale scheduling)
- [x] Real-time streaming requirements clear (only AI Schedule Generation)
- [x] Root metadata pattern understood for nested task chains

### Development Plan
- [x] Phase 1 (MVP): 4 workflows (AI Schedule, Notifications, Conflict Resolution, Reports)
- [x] Phase 2 (Enhancement): 2 workflows (Accountant Invite, CSV Import)
- [x] Phase 3 (Growth): Future workflows documented (Time Clock, Predictive, Payroll Integration)
- [ ] Testing strategy planned (small org 1 locale 5 dip., large org 10 locali 100 dip., error scenarios)

---

## 🔗 Related Documentation

**Workflow Documentation Files:**
- `trigger_workflow_ai_schedule.md` - AI Schedule Generation (4 tasks)
- `trigger_workflow_notifications.md` - Notification Dispatch (3 tasks)
- `trigger_workflow_monthly_report.md` - Monthly Report Generation (4 tasks)
- `trigger_workflow_csv_import.md` - Employee CSV Import (3 tasks)
- `trigger_workflow_conflict_resolution.md` - Schedule Conflict Resolution (2 tasks)
- `trigger_workflow_accountant_invite.md` - Accountant Invitation (2 tasks)

**Trigger.dev Resources:**
- Official Docs: https://trigger.dev/docs
- Tasks Overview: https://trigger.dev/docs/tasks/overview
- Realtime SDK: https://trigger.dev/docs/realtime
- Queue & Concurrency: https://trigger.dev/docs/queue-concurrency

---

## 🎯 Next Steps

**Immediate Next Steps:**
1. **Review all workflow documentation** - Ensure task chains match expectations
2. **Database schema design** - Define tables for organizations, locations, employees, shifts, jobs
3. **Set up Trigger.dev project** - Create account, get secret key
4. **Install dependencies** - `@trigger.dev/sdk`, `@trigger.dev/react-hooks`, `openai`, `twilio`, `resend`, `exceljs`

**Implementation Sequence:**
1. Database migrations (all tables: organizations, locations, employees, shifts, schedules, jobs)
2. Trigger.dev configuration (`trigger.config.ts`)
3. Notification Dispatch workflow (foundation, riusato da tutti)
4. AI Schedule Generation workflow (core value proposition)
5. Conflict Resolution workflow (riusa AI engine)
6. Monthly Report Generation workflow (commercialista value prop)
7. Frontend integration (scheduler drag & drop, progress tracking, report viewer)
8. Testing and refinement

**Success Criteria:**
- ✅ Titolare genera orario settimanale con AI in <30 secondi
- ✅ Progress bar visibile in tempo reale durante generazione
- ✅ Drag & drop funzionante con validazione conflitti
- ✅ Notifiche WhatsApp/Email inviate ai dipendenti dopo pubblicazione
- ✅ Report mensile generato in PDF/CSV/Excel e accessibile dal commercialista
- ✅ Sostituti suggeriti automaticamente in caso di malattia
- ✅ Errori gestiti con messaggi chiari e possibilita di retry

---

**Last Updated:** 2025-02-11
**Total Workflows:** 6
**Total Tasks:** 18 (across all workflows)
**Development Phase:** Design Complete - Ready for Implementation
