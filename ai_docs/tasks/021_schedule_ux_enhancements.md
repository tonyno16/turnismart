# Task 021: Schedule UX - Duplica Turno, Note, Export PDF, Equità

---

## 1. Task Overview

### Task Title
**Title:** Schedule UX Enhancements - Duplica Turno, Note, Export PDF, Indicatore Equità

### Goal Statement
**Goal:** Migliorare l'usabilità dello scheduler con duplicazione turni, note su singolo turno, export PDF per stampa, e indicatore di equità nella distribuzione.

---

## 2. Context & Problem Definition

### Problem Statement
- Duplicare un turno su altro giorno richiede ricrearlo manualmente
- Non c'è modo di aggiungere note a un turno (es. "Evento speciale")
- L'orario va stampato/distribuito: serve export PDF
- Equità: chi ha pochi turni vs chi ne ha troppi non è visibile

### Success Criteria
- [ ] **Duplica turno:** Azione su shift (menu contestuale o drag) per duplicare su altro giorno
- [ ] **Note su turno:** Campo note su shifts, visibile in UI e editabile
- [ ] **Export PDF:** Bottone "Esporta PDF" che genera orario stampabile (per sede o per dipendente)
- [ ] **Indicatore equità:** Badge o colore su dipendente che indica se sotto/sopra media turni

---

## 3. Data & Database

### Schema `shifts`
- Aggiungere `notes` (text, nullable) se non esiste

### Nessun'altra migration
Export PDF e equità sono calcolati a runtime.

---

## 4. Backend

### Server Actions

#### `app/actions/shifts.ts`
- **duplicateShift(shiftId, targetDate)** - Crea nuovo shift con stessi employee, location, role, start/end time, date = targetDate
- **updateShiftNotes(shiftId, notes)** - Update solo campo notes

#### `app/actions/reports.ts` o nuovo file
- **exportSchedulePdf(scheduleId, mode: 'by_location' | 'by_employee')** - Genera PDF con @react-pdf/renderer
  - by_location: tabella per sede (giorni × fasce × turni)
  - by_employee: scheda per dipendente con i suoi turni

### Calcolo equità
- Media turni = totalShifts / activeEmployees
- Per dipendente: shiftCount vs media
- Sotto media (es. < 80%): badge "Pochi turni"
- Sopra media (es. > 120%): badge "Molti turni"

---

## 5. Frontend

### Duplica Turno
- Menu contestuale su shift card (click destro o icona ⋮)
  - [Duplica su...] → date picker o select giorno settimana
  - Crea shift e refresh

### Note su Turno
- Su shift card: icona nota, al click input/tooltip
- Edit inline o popover

### Export PDF
- Toolbar scheduler: [Esporta PDF]
  - Modal: "Per sede" | "Per dipendente"
  - Genera e download

### Indicatore Equità
- Employee sidebar: sotto nome, piccolo badge
  - Verde: nella media
  - Giallo: sotto media (pochi turni)
  - Rosso: sopra media (troppi turni)
- Tooltip: "X turni (media Y)"

---

## 6. Implementation Plan

### Phase 1: Note su Turno
- [ ] **1.1** Migration: notes su shifts (se manca)
- [ ] **1.2** updateShiftNotes action
- [ ] **1.3** UI: edit note su shift card

### Phase 2: Duplica Turno
- [ ] **2.1** duplicateShift action
- [ ] **2.2** Menu contestuale o dropdown su shift
- [ ] **2.3** Date picker per giorno target

### Phase 3: Export PDF
- [ ] **3.1** exportSchedulePdf con @react-pdf/renderer
- [ ] **3.2** Layout per vista sede e dipendente
- [ ] **3.3** Bottone + modal opzioni + download

### Phase 4: Indicatore Equità
- [ ] **4.1** Calcolare media turni e per-dipendente
- [ ] **4.2** Badge su EmployeeSidebar
- [ ] **4.3** Soglie configurabili (80%, 120%)

---

## 7. Edge Cases

- Duplica su giorno con conflitto → validazione, messaggio
- PDF con molti dati → paginazione o split
- Equità con 0 turni (settimana vuota) → nascondere badge

---

*Est. Effort: 2 giorni*
