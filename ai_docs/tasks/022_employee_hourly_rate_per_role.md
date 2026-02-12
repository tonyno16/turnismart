# Task 022: Paga Oria per Mansione (employee_roles)

---

## 1. Task Overview

### Task Title
**Title:** Paga Oria per Mansione – Ogni dipendente può avere paga diversa per ogni mansione

### Goal Statement
**Goal:** Permettere di impostare una paga oraria specifica per ogni mansione assegnata al dipendente. Es: Mario come Cameriere 12€/h, come Lavapiatti 10€/h. Se non specificata, usa la paga base del dipendente (employees.hourly_rate).

---

## 2. Context & Problem Definition

### Problem Statement
Attualmente la paga oraria è solo su `employees` (globale). Un dipendente con più mansioni ha una paga unica. Serve paga diversa per mansione (es. cuoco pagato di più, lavapiatti meno).

### Success Criteria
- [x] Colonna `hourly_rate` (numeric, nullable) su `employee_roles`
- [x] Sezione Mansioni nel profilo dipendente: input paga per ogni mansione (opzionale)
- [x] Se null: usa `employees.hourly_rate`
- [x] Report e calcolo ore usano la paga corretta per mansione quando assegnano i turni

---

## 3. Data & Database

### Migration

#### `employee_roles`
- Aggiungere `hourly_rate` numeric(8,2) nullable
- Se null → usa employees.hourly_rate per calcoli

```sql
ALTER TABLE employee_roles ADD COLUMN hourly_rate numeric(8,2);
```

---

## 4. Backend

### Schema
- `drizzle/schema/employee-roles.ts`: aggiungere `hourly_rate: numeric("hourly_rate", { precision: 8, scale: 2 })`

### Server Actions

#### `app/actions/employees.ts` – `updateEmployeeRoles`
- Estendere firma: `updateEmployeeRoles(employeeId, roleIds: string[], hourlyRates?: Record<string, string>)` 
  - Oppure: `roleData: Array<{ roleId: string; hourlyRate?: string }>`
- Inserire/aggiornare anche `hourly_rate` per ogni riga (null se vuoto)

---

## 5. Frontend

### `app/(protected)/employees/[id]/roles-section.tsx`
- Per ogni mansione (1, 2, 3): aggiungere input "Paga (€)" opzionale accanto al select
- Placeholder: "Uguale a base" o valore da employees.hourly_rate
- Salvataggio insieme alle mansioni

---

## 6. Report / Calcolo ore
- Quando si calcola il costo di un turno: 
  - Shift ha `role_id` → cerca employee_roles per (employee_id, role_id) → se hourly_rate presente, usa quello; altrimenti employees.hourly_rate

---

## 7. Implementation Plan

### Phase 1: Schema
- [x] **1.1** Migration: ADD COLUMN hourly_rate su employee_roles
- [x] **1.2** Aggiornare schema Drizzle

### Phase 2: Backend
- [x] **2.1** Modificare updateEmployeeRoles per accettare e salvare hourly_rate per mansione
- [x] **2.2** getEmployeeDetail: includere hourly_rate nelle roles restituite

### Phase 3: Frontend
- [x] **3.1** EmployeeRolesSection: input paga per ogni slot mansione
- [x] **3.2** Submit con dati paga

### Phase 4: Report (se già esiste calcolo ore)
- [x] **4.1** Usare paga per mansione nel calcolo costo turni

---

## 8. Edge Cases

- hourly_rate negativo → validazione, rifiutare
- CSV import: eventualmente supportare paga per mansione in una colonna (future)

---

*Est. Effort: 1-2 giorni*
