# Task 019: Template Settimanale & Shift Template

---

## 1. Task Overview

### Task Title
**Title:** Template Settimanale e Shift Template

### Goal Statement
**Goal:** Salvare una "settimana tipo" come template e applicarla rapidamente a una nuova settimana. Definire turni standard (es. Pranzo 12-15) riutilizzabili.

---

## 2. Context & Problem Definition

### Problem Statement
Molte attività hanno un orario ricorrente settimana dopo settimana. Invece di ricreare da zero o replicare manualmente, il titolare può salvare un template e applicarlo con un click.

### Success Criteria
- [ ] **Template settimanale:** Salva la struttura della settimana corrente (fabbisogno + turni) con un nome
- [ ] **Applica template:** Seleziona template e settimana target → crea fabbisogno e turni
- [ ] **Shift template (opzionale):** Turni predefiniti (Pranzo 12-15, Cena 18-23) selezionabili con un click nello scheduler

---

## 3. Data & Database

### Nuova tabella `schedule_templates`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | uuid | PK |
| organization_id | uuid | FK organizations |
| name | text | "Settimana tipo Centro" |
| week_data | jsonb | { staffing: [...], shifts: [...] } |
| created_at, updated_at | timestamptz | |

Struttura `week_data`:
```json
{
  "staffing": [{ "location_id", "role_id", "day_of_week", "shift_period", "required_count" }],
  "shifts": [{ "location_id", "role_id", "employee_id", "day_of_week", "start_time", "end_time" }]
}
```

### Tabella `shift_templates` (opzionale, più semplice)
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | uuid | PK |
| organization_id | uuid | FK |
| name | text | "Pranzo", "Cena" |
| start_time | time | |
| end_time | time | |
| default_role_id | uuid | nullable |
| created_at | timestamptz | |

---

## 4. Backend

### Server Actions

#### `app/actions/schedule-templates.ts`
- **createScheduleTemplate(name, scheduleId)** - Salva da schedule esistente
- **listScheduleTemplates()** - Lista template org
- **applyScheduleTemplate(templateId, targetWeekStart)** - Crea schedule + staffing + shifts
- **deleteScheduleTemplate(id)**

#### Per shift template (semplificato)
- In `organization_settings` o tabella dedicata
- **createShiftTemplate**, **listShiftTemplates**, **applyShiftTemplate** (crea shift con orario predefinito)

---

## 5. Frontend

### Template Settimanale
- **schedule/page.tsx** o modal
  - Bottone [Salva come template] → input nome → salva
  - Bottone [Applica template] → select template + select settimana → conferma → applica
  - Lista template in settings o nello scheduler

### Shift Template (quick-win)
- Nello scheduler: dropdown "Turni rapidi" con "Pranzo 12-15", "Cena 18-23"
- Click su cella + selezione template → crea shift con quell'orario (manca employee, da assegnare con DnD)

---

## 6. Implementation Plan

### Phase 1: Schedule Template
- [ ] **1.1** Migration: schedule_templates
- [ ] **1.2** createScheduleTemplate, listScheduleTemplates
- [ ] **1.3** applyScheduleTemplate (creare schedule, staffing, shifts)
- [ ] **1.4** UI: Salva template, Applica template (modal)

### Phase 2: Shift Template (opzionale)
- [ ] **2.1** Tabella shift_templates
- [ ] **2.2** CRUD + UI "Turni rapidi" nello scheduler

---

## 7. Edge Cases

- Template con dipendente/location/ruolo eliminato → skip o warning
- Settimana target già ha dati → sovrascrivi o merge? (sovrascrivi = delete + insert)
- Quota: rispettare limiti piano

---

*Est. Effort: 2-3 giorni*
