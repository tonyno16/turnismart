# Task 018: Preferenze Dipendente (Giorni, Mattina/Sera, Eccezioni)

---

## 1. Task Overview

### Task Title
**Title:** Preferenze Avanzate Dipendente - Giorni Preferiti, Preferenza Mattina/Sera, Eccezioni Puntuali

### Goal Statement
**Goal:** Arricchire la disponibilità dipendente con preferenze per giorno (preferito/evitare), preferenza mattina vs sera, e eccezioni puntuali ("questa settimana no giovedì").

---

## 2. Context & Problem Definition

### Problem Statement
`employee_availability` ha solo status: available, unavailable, preferred. Serve:
- Per ogni giorno: preferito / ok / da evitare (più granulare)
- Preferenza globale: mattina o sera
- Eccezioni: "dal 10 al 17 febbraio non posso il mercoledì"

### Success Criteria
- [ ] Griglia disponibilità: per ogni cella (giorno × fascia) stato: Disponibile | Preferito | Evitare | Non disponibile
- [ ] Toggle "Preferisco mattina" / "Preferisco sera" / "Nessuna preferenza"
- [ ] Sezione "Eccezioni": date range + giorni da escludere (es. 10-17 feb, no mercoledì)
- [ ] AI scheduler e validazione usano questi dati

---

## 3. Data & Database

### Schema Changes

#### `employee_availability` (esistente)
- Status già: available, unavailable, preferred
- Estendere a: `available | preferred | avoid | unavailable`
  - **preferred** = preferisco questo slot
  - **avoid** = evita se possibile
  - **unavailable** = non posso
  - **available** = ok

#### Nuova tabella `employee_preferences` (o colonne su employees)
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | uuid | PK |
| employee_id | uuid | FK employees |
| period_preference | text | 'morning' \| 'evening' \| null |
| max_shifts_per_week | integer | null = nessun limite |
| created_at, updated_at | timestamptz | |

Alternativa: `period_preference` direttamente su `employees` (1 colonna).

#### Nuova tabella `employee_availability_exceptions`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | uuid | PK |
| employee_id | uuid | FK employees |
| start_date | date | Inizio periodo |
| end_date | date | Fine periodo |
| day_of_week | integer | 0-6, giorno da escludere |
| created_at | timestamptz | |

---

## 4. Backend

### Migration
- [ ] Aggiungere `avoid` a enum status in employee_availability (se non esiste)
- [ ] Aggiungere `period_preference` a employees (text, nullable)
- [ ] Creare employee_availability_exceptions

### Server Actions
- **updateEmployeePreferences(employeeId, { periodPreference, maxShiftsPerWeek })**
- **addAvailabilityException(employeeId, startDate, endDate, dayOfWeek)**
- **removeAvailabilityException(id)**

### Validazione / AI
- **lib/schedule-validation.ts**: controllare eccezioni in checkAvailability
- **lib/ai-schedule.ts**: includere period_preference e avoid nel prompt, filtrare per eccezioni

---

## 5. Frontend

### Griglia Disponibilità (employee/[id])
- Aggiornare **availability-grid.tsx**: 4 stati per cella (Disponibile, Preferito, Evitare, Non disponibile)
- UI: click ciclo stati o 4 bottoni/preset

### Preferenza Mattina/Sera
- Radio o select: "Preferisco mattina" | "Preferisco sera" | "Nessuna preferenza"
- Salvataggio in employees.period_preference

### Eccezioni
- Lista eccezioni con [Aggiungi]
- Form: date range (start, end) + checkbox giorni (Lun-Mar-Mer-...)
- Tabella: "10-17 Feb, no Mercoledì" [Rimuovi]

---

## 6. Implementation Plan

### Phase 1: Status Avoid
- [ ] **1.1** Aggiungere 'avoid' a availabilityStatuses se necessario
- [ ] **1.2** Aggiornare griglia per mostrare 4 stati

### Phase 2: Period Preference
- [ ] **2.1** Migration: period_preference su employees
- [ ] **2.2** Form in profile/availability
- [ ] **2.3** Usare in AI (peso preferenza)

### Phase 3: Eccezioni
- [ ] **3.1** Migration: employee_availability_exceptions
- [ ] **3.2** CRUD actions
- [ ] **3.3** UI sezione eccezioni
- [ ] **3.4** Integrare in schedule-validation e ai-schedule

---

## 7. Edge Cases

- Eccezione sovrapposta a time_off: time_off ha priorità
- Period_preference: AI può ignorare se necessario per coprire

---

*Est. Effort: 2 giorni*
