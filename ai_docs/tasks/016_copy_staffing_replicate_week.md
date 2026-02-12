# Task 016: Copy Fabbisogno & Replica Settimana

---

## 1. Task Overview

### Task Title
**Title:** Copy Fabbisogno da Sede + Replica Settimana Precedente

### Goal Statement
**Goal:** Ridurre il tempo di setup permettendo di copiare il fabbisogno personale da un'altra sede o di replicare i turni della settimana precedente.

---

## 2. Context & Problem Definition

### Problem Statement
Ogni settimana il titolare deve ricompilare fabbisogno e turni da zero. Per sedi simili o settimane ricorrenti, è inefficiente.

### Success Criteria
- [x] **Copy fabbisogno da sede:** Bottone in locations/[id] che copia staffing da un'altra sede selezionata
- [x] **Replica settimana precedente:** Bottone nello scheduler che replica tutti i turni della settimana scorsa nella settimana corrente (stesso dipendente, stesso ruolo, stesso orario, stessi giorni)

---

## 3. Data & Backend

### Server Actions

#### `app/actions/locations.ts`
- **copyStaffingFromLocation(targetLocationId, sourceLocationId)** 
  - Legge staffing_requirements della sede sorgente
  - Per ogni riga: INSERT nella sede target (stesso role_id, day_of_week, shift_period, required_count)
  - Usa upsert/onConflict per non duplicare se esiste già
  - revalidatePath

#### `app/actions/shifts.ts`
- **replicatePreviousWeek(scheduleId, targetWeekStart)**
  - Calcola weekStart precedente (targetWeekStart - 7 giorni)
  - Trova schedule della settimana precedente (stessa org)
  - Per ogni shift attivo: crea nuovo shift con stessa location_id, employee_id, role_id, date (shiftata), start_time, end_time
  - Validazione: dipendente ancora attivo? ruolo ancora valido? disponibilità?

---

## 4. Frontend

### Copy Fabbisogno
- **locations/[id]/page.tsx**
  - Sezione "Copia da altra sede" con select sedi (escludi corrente)
  - Bottone [Copia fabbisogno]
  - Toast conferma / errore

### Replica Settimana
- **schedule/page.tsx** o **scheduler-client.tsx**
  - Bottone toolbar: [Replica settimana precedente]
  - Modal conferma: "Replicherai X turni dalla settimana scorsa. Procedere?"
  - Progress/loading durante operazione
  - Toast risultato: "Y turni replicati, Z saltati (conflitti)"

---

## 5. Implementation Plan

### Phase 1: Copy Staffing
- [x] **1.1** Aggiungere `copyStaffingFromLocation` in `app/actions/locations.ts`
- [x] **1.2** UI in `locations/[id]/page.tsx`: select sede + bottone
- [x] **1.3** Gestire conflitti: sovrascrivi (delete existing + insert)

### Phase 2: Replica Week
- [x] **2.1** Aggiungere `replicatePreviousWeek` in `app/actions/shifts.ts`
- [x] **2.2** Logica: get schedule precedente, iterare shifts, insert con validazione per ognuno
- [x] **2.3** UI: bottone toolbar + modal conferma
- [x] **2.4** Gestire skip: conflitti, dipendente inattivo → toast "Y replicati, Z saltati"

---

## 6. Edge Cases

- Sede sorgente senza fabbisogno → messaggio "Nessun fabbisogno da copiare"
- Settimana precedente inesistente → messaggio "Nessuna settimana precedente"
- Ruolo o dipendente eliminato → skip quel turno
- Quota dipendenti/location già al limite → N/A (non creiamo nuovi)

---

*Est. Effort: 1-2 giorni*
