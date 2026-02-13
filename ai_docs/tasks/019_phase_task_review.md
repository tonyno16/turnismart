# Task Review – Task 019: Template settimanale & Shift template

> Checklist adattata al progetto Turnismart (Next.js + Drizzle).  
> File coinvolti: `schedule-templates.ts`, `save-template-modal.tsx`, `apply-template-modal.tsx`, `scheduler-client.tsx`.

---

## 1. Type Safety (TypeScript)

### 1.1 No `any` Types
- [x] Nessun `any` nei file modificati (schedule-templates, save-template-modal, apply-template-modal, scheduler-client)
- [x] Nessun `any` implicito da tipi mancanti

### 1.2 Explicit Return Types
- [x] `createScheduleTemplate`: `Promise<{ ok: true; id: string } | { ok: false; error: string }>`
- [x] `listScheduleTemplates`: `Promise<Array<{ id: string; name: string }>>`
- [x] `applyScheduleTemplate`: tipo di ritorno esplicito con union
- [x] `deleteScheduleTemplate`: `Promise<{ ok: true } | { ok: false; error: string }>`

### 1.3 Type Assertions
- [x] `tpl.week_data as ScheduleTemplateWeekData` – giustificato: JSONB dal DB con tipo definito nello schema
- [x] `s.shift_period as "morning" | "evening"` – restringe tipo string a enum

---

## 2. Drizzle ORM

### 2.1 Type-Safe Operators
- [x] Uso di `eq`, `and`, `inArray` – nessun raw SQL
- [x] Operatori Drizzle corretti ovunque

### 2.2 Transazioni
- [ ] **Suggerimento**: `applyScheduleTemplate` esegue delete + insert multipli. Se serve atomicità, valutare `db.transaction(async (tx) => { ... })` per delete schedule/shifts + insert schedule + insert shifts.

### 2.3 Select Only Needed Columns
- [x] `select({ id: schedules.id })`, `select({ id: employees.id })`, ecc.
- [x] Nessun `select().from()` su tabelle grandi

---

## 3. Server Actions

### 3.1 Struttura e Auth
- [x] `'use server'` presente
- [x] `requireOrganization()` in tutte le action
- [x] Input validati (trim del nome, check esistenza schedule/template)

### 3.2 Return Types
- [x] Formato consistente: `{ ok: true; ... } | { ok: false; error: string }`
- [x] Modali gestiscono correttamente `result.ok` e `result.error`

---

## 4. Next.js / Client

### 4.1 Server/Client Separation
- [x] Action in `app/actions/` (server)
- [x] Modali come Client Components (`'use client'`)
- [x] Nessun import server-only in componenti client

### 4.2 Data Fetching
- [x] `listScheduleTemplates` chiamato da `useEffect` nel modal
- [x] Nessun async client component

---

## 5. Sicurezza

### 5.1 Auth
- [x] `requireOrganization()` in create, list, apply, delete
- [x] Check `organization_id` su schedule e template

### 5.2 Input
- [x] `scheduleId`, `templateId` verificati contro org
- [x] `targetWeekStart` usato solo come date string (formato yyyy-MM-dd da date-fns)
- [ ] **Opzionale**: validare `targetWeekStart` con regex o `parseISO` + `isValid`

---

## 6. Error Handling

### 6.1 Risposte
- [x] Errori restituiti con `{ ok: false, error: string }`
- [x] Messaggi chiari: "Template non trovato", "Programmazione non trovata", ecc.

### 6.2 Client
- [x] `SaveTemplateModal`: `if (!result.ok) toast.error(result.error)`
- [x] `ApplyTemplateModal`: stesso pattern
- [x] `ApplyTemplateModal`: gestione catch su `listScheduleTemplates` con toast

---

## 7. Code Quality

### 7.1 TODO/FIXME
- [x] Nessun TODO/FIXME nei file modificati

### 7.2 Console
- [x] Nessun `console.log` nei file della task (solo in script esterni)

### 7.3 Naming
- [x] File: kebab-case
- [x] Componenti: PascalCase
- [x] Funzioni: camelCase

---

## 8. revalidatePath

- [x] `revalidatePath("/schedule")` – path statico, parametro type non richiesto
- [x] `revalidatePath("/locations")` – stesso caso
- [x] Nessuna route dinamica (`/path/[id]`) – nessun fix necessario

---

## 9. Testing Checklist (manuale)

| Scenario | Stato |
|----------|-------|
| Salva template con nome valido | Da verificare |
| Salva template senza nome (toast errore) | Da verificare |
| Applica template a settimana vuota | Da verificare |
| Applica template su settimana già occupata (sovrascrittura) | Da verificare |
| Applica template quando non esistono template (messaggio vuoto) | Da verificare |
| Redirect dopo applica a `/schedule?week=...` | Da verificare |

---

## 10. Riepilogo

| Categoria | Esito |
|-----------|-------|
| Type Safety | OK |
| Drizzle | OK (possibile miglioramento con transazione) |
| Server Actions | OK |
| Sicurezza | OK |
| Error Handling | OK |
| Code Quality | OK |
| revalidatePath | OK |

**Conclusione**: Implementazione conforme allo standard. Nessun blocco critico. Suggerimento opzionale: transazione in `applyScheduleTemplate` per garantire atomicità delete+insert.
