# Task 020: Azioni Bulk Dipendenti

---

## 1. Task Overview

### Task Title
**Title:** Azioni Bulk sui Dipendenti

### Goal Statement
**Goal:** Permettere di selezionare più dipendenti e applicare azioni in batch: disattiva, cambia mansione, export CSV.

---

## 2. Context & Problem Definition

### Problem Statement
Con molti dipendenti, operazioni ripetitive (es. disattivare 5 stagionali a fine stagione, aggiungere mansione "Lavapiatti" a 10 persone) sono lente.

### Success Criteria
- [ ] Checkbox per selezione multipla nella lista dipendenti
- [ ] Barra azioni quando 1+ selezionati: [Disattiva], [Aggiungi mansione], [Esporta CSV]
- [ ] Modal conferma per azioni distruttive
- [ ] Toast con risultato (es. "3 dipendenti disattivati")

---

## 3. Data & Backend

### Nessuna migration
Usa strutture esistenti.

### Server Actions

#### `app/actions/employees.ts`
- **bulkDeactivate(employeeIds: string[])** - Per ogni id: update is_active = false
- **bulkAddRole(employeeIds: string[], roleId: string)** - Per ogni id: insert employee_roles se non esiste (priority = max+1 o 3)
- **bulkRemoveRole(employeeIds: string[], roleId: string)** - Rimuove mansione dai selezionati

### Export CSV
- **exportEmployeesCsv(employeeIds?: string[])** - Se ids: filtra, altrimenti tutti
- Ritorna CSV come string o Response con Content-Disposition
- Colonne: nome, cognome, email, telefono, mansioni, contratto, ore settimanali, sede preferita

---

## 4. Frontend

### Lista Dipendenti
- **employees-page-client.tsx** o **employees/page.tsx**
  - Checkbox su ogni riga
  - Checkbox header "Seleziona tutti" (solo pagina corrente)
  - Stato selezione: `selectedIds: Set<string>`

### Barra Azioni
- Quando `selectedIds.size > 0`: barra flottante o sotto la tabella
  - [Disattiva N dipendenti] → modal "Sei sicuro?" → bulkDeactivate
  - [Aggiungi mansione] → select ruolo → bulkAddRole
  - [Rimuovi mansione] → select ruolo → bulkRemoveRole
  - [Esporta CSV] → exportEmployeesCsv(selectedIds) → download

---

## 5. Implementation Plan

### Phase 1: Selezione
- [ ] **1.1** Aggiungere checkbox a ogni riga tabella
- [ ] **1.2** State selectedIds, toggle singolo, select all
- [ ] **1.3** Stile barra selezione

### Phase 2: Azioni
- [ ] **2.1** bulkDeactivate action + UI
- [ ] **2.2** bulkAddRole, bulkRemoveRole + modal select ruolo
- [ ] **2.3** exportEmployeesCsv + download link

### Phase 3: Conferme
- [ ] **3.1** Modal conferma per disattiva
- [ ] **3.2** Toast risultati

---

## 6. Edge Cases

- bulkAddRole: dipendente ha già 3 mansioni → skip con messaggio
- bulkAddRole: dipendente ha già quella mansione → skip
- Export: nessun campo obbligatorio, gestire null

---

*Est. Effort: 1 giorno*
