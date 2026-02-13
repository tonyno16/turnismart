# Task 017: Scheduler - Vista per Dipendente, Filtri, Alert Straordinari

---

## 1. Task Overview

### Task Title
**Title:** Vista per Dipendente, Vista per Ruolo, Filtri, Alert Straordinari

### Goal Statement
**Goal:** Aggiungere viste alternative allo scheduler (per dipendente, per ruolo), filtri per dipendenti, e indicatore visivo quando un dipendente supera le ore contrattuali.

---

## 2. Context & Problem Definition

### Problem Statement
La vista attuale è solo "per sede" (righe = giorni/fasce, colonne = ...). Serve anche:
- Vista "per dipendente": riga = dipendente, colonne = giorni
- Vista "per ruolo": raggruppa per mansione
- Filtri per trovare rapidamente chi può lavorare
- Alert quando qualcuno va in straordinario

### Success Criteria
- [x] Toggle vista: Per Sede (attuale) | Per Dipendente | Per Ruolo
- [x] Filtri: mansione, sede preferita, toggle Solo scoperti
- [x] Employee sidebar: badge/indicatore rosso quando ore settimanali > weekly_hours
- [x] Toolbar con filtri collassabili

---

## 3. Data & Backend

### Query Changes

#### `lib/schedules.ts`
- **getWeekSchedule** già restituisce shifts per location. Per vista dipendente: raggruppa lato client o aggiungere opzione `groupBy: 'employee' | 'location' | 'role'`
- Oppure: stessa query, trasformare lato client

### Nessuna migration
Tutti i dati già disponibili. Calcolo ore per dipendente: somma da shifts.

---

## 4. Frontend

### Vista per Dipendente
- **scheduler-client.tsx** / **schedule-grid.tsx**
  - Riga = dipendente (nome + barra ore)
  - Colonna = giorno (o giorno + fascia mattina/sera)
  - Celle = shift assegnato (location, ruolo, orario)
  - DnD: stesso contesto, cambia solo rendering

### Vista per Ruolo
- Riga = ruolo (es. Cameriere, Cuoco)
  - Sotto-righe = dipendenti con quel ruolo
- Colonna = giorno
- Celle = shift

### Filtri
- **components/schedule/scheduler-filters.tsx**
  - Select mansione (ruolo) → filtra dipendenti sidebar + griglia
  - Select sede preferita → filtra per preferred_location_id
  - Toggle "Solo scoperti" → evidenzia celle sotto required_count

### Alert Straordinari
- **employee-sidebar.tsx**
  - Calcolo: `weekMinutes / 60 > weekly_hours` → badge rosso "Straordinario" o icona ⚠️
  - Tooltip: "X ore su Y contrattuali"

---

## 5. Implementation Plan

### Phase 1: Filtri
- [x] **1.1** Creare `SchedulerFilters` component con select mansione, sede, toggle scoperti
- [x] **1.2** Filtrare lato client (employeeRoleIds, preferred_location_id)
- [x] **1.3** Integrare in scheduler toolbar

### Phase 2: Alert Straordinari
- [x] **2.1** In EmployeeSidebar: calcolare ore per dipendente da shifts
- [x] **2.2** Mostrare badge/warning se > weekly_hours
- [x] **2.3** Stile: bordo rosso, badge "Straordinario"

### Phase 3: Vista per Dipendente
- [x] **3.1** Refactor grid: state `viewMode: 'location' | 'employee' | 'role'`
- [x] **3.2** Render griglia con righe = dipendenti, celle = turni
- [x] **3.3** Vista sola lettura (DnD in vista Per sede)

### Phase 4: Vista per Ruolo
- [x] **4.1** Raggruppare dipendenti per ruolo (employeesByRole)
- [x] **4.2** Render griglia con riga header ruolo + sotto-righe dipendenti

---

## 6. Edge Cases

- Nessun dipendente con mansione selezionata → messaggio "Nessun risultato"
- Vista per ruolo con dipendenti multi-mansione → mostrare in tutti i ruoli o solo nel primo?
- Performance: con 50+ dipendenti considerare virtualizzazione (Task 017 separato o post)

---

*Est. Effort: 2-3 giorni*
