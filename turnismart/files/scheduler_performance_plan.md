# Piano ottimizzazione performance scheduler

Obiettivo: portare lo scheduler a performance ottimali, il meglio realizzabile con le tecnologie attuali.

---

## Stato attuale (già implementato)

| Ottimizzazione | Stato |
|----------------|-------|
| Virtualizzazione righe (vista employee, >20 dipendenti) | ✅ Fatto |
| Index O(1) per shifts (`shiftIndex`, `shiftIndex`) | ✅ Fatto |
| Index O(1) per coverage (`coverageIndex`) | ✅ Fatto |
| Index O(1) per shift per dipendente (`shiftsByEmployeeSlot`) | ✅ Fatto |
| `useMemo` su filteredEmployees, filteredLocationRoleRows, employeesByRole | ✅ Fatto |
| `useCallback` su handler (delete, notes, times, duplicate, getShiftsInCell) | ✅ Fatto |
| `ShiftCell` con `memo()` | ✅ Fatto |
| Import date-fns tree-shakable | ✅ Fatto |

---

## Fase 1: React – memoizzazione (impatto alto, sforzo basso)

### 1.1 `ShiftCard` con `memo`
- **File:** `components/schedule/shift-card.tsx`
- **Problema:** Ogni cella ha N `ShiftCard`; senza memo si ri-renderizzano quando cambia qualsiasi stato del genitore.
- **Azione:** Esportare `ShiftCard` wrappato in `memo()` con props comparate.
- **Nota:** Le props includono callback; verificare che siano `useCallback` stabili dal genitore (già fatto).

### 1.2 `EmployeeSidebar` con `memo`
- **File:** `components/schedule/employee-sidebar.tsx`
- **Azione:** Wrappare in `memo()` se riceve liste grandi e non cambiano spesso.

### 1.3 `SchedulerFilters` con `memo`
- **File:** `components/schedule/scheduler-filters.tsx`
- **Azione:** Evitare re-render quando cambia solo lo stato interno della griglia (es. viewMode, sidebar).

### 1.4 `navigateWeek` con `useCallback`
- **File:** `scheduler-client.tsx`
- **Problema:** `navigateWeek` viene ricreato ogni render; bottoni potrebbero ri-renderizzare.
- **Azione:** `useCallback(navigateWeek, [router, searchParams, weekStart])`.

---

## Fase 2: Lazy loading modali (impatto medio-alto, sforzo basso)

### 2.1 Dynamic import modali pesanti
- **Modali:** `ExportPdfModal`, `AIGenerationModal`, `ReplicateWeekModal`, `SaveTemplateModal`, `ApplyTemplateModal`, `SickLeavePopup`, `ConflictPopup`, `TimesEditConflict`
- **Problema:** Tutte caricate al primo render dello scheduler (incl. PDF, AI).
- **Azione:**
  - `next/dynamic` con `ssr: false` per modali che si aprono on-demand
  - Esempio: `const ExportPdfModal = dynamic(() => import('@/components/schedule/export-pdf-modal').then(m => ({ default: m.ExportPdfModal })), { ssr: false })`
- **Priorità:** ExportPdfModal (ha lib PDF), AIGenerationModal (logica AI).

---

## Fase 3: Virtualizzazione estesa (impatto alto, sforzo medio)

### 3.1 Virtualizzazione vista `location`
- **Problema:** Con molti `location × role` (es. 5 sedi × 8 ruoli = 40 righe) il DOM diventa pesante.
- **Azione:** Attivare virtualizzazione anche per `filteredLocationRoleRows.length > VIRTUALIZATION_THRESHOLD`.
- **Complessità:** Le celle usano `ShiftCell` con DropTarget; va verificato che DnD funzioni con righe virtualizzate.

### 3.2 Virtualizzazione vista `role`
- **Problema:** Ogni ruolo ha N righe (dipendenti); con molti ruoli/dipendenti la griglia è pesante.
- **Azione:** Virtualizzare per righe “ruolo + dipendente”.

### 3.3 Virtualizzazione orizzontale (opzionale)
- **Problema:** Con molti periodi/giorni, lo scroll orizzontale può diventare costoso.
- **Azione:** Valutare `@tanstack/react-virtual` con `horizontal: true` per colonne, solo se ci sono >14 celle orizzontali e si riscontrano lag.

---

## Fase 4: DOM e CSS (impatto medio, sforzo basso)

### 4.1 `content-visibility` su righe non virtualizzate
- **Target:** Righe della tabella quando non usiamo virtualizzazione (<21 dipendenti).
- **Azione:** `content-visibility: auto` su `<tr>` per righe fuori viewport (supporto browser moderni).

### 4.2 `contain: layout` su celle
- **Azione:** `contain: layout` sulle celle per limitare il calcolo di layout dal browser.

### 4.3 Evitare reflow durante drag
- **Azione:** Usare `transform` per animazioni; il `DragOverlay` è già separato, verificare che non causi reflow.

---

## Fase 5: Ottimizzazione handler e stato (impatto medio, sforzo medio)

### 5.1 Debounce filtri
- **Problema:** Cambio filtro ruolo/sede causa ricalcoli immediati.
- **Azione:** Debounce 150–200ms su `setFilters` (solo per campi testuali se aggiunti; i select sono già istantanei).

### 5.2 `handleDragStart` / `handleDragEnd` ottimizzati
- **Problema:** Durante il drag, `activeEmployee` causa re-render.
- **Azione:** `DragOverlay` deve essere il più leggero possibile; attualmente mostra `ShiftCard` – considerare una versione “semplificata” (solo nome + ruolo) durante il drag.

### 5.3 Ridurre stato condiviso
- **Problema:** Molti `useState` nello stesso componente causano re-render ad ogni aggiornamento.
- **Azione:** Raggruppare stato correlato in oggetti (es. `modalState: { replicate: bool, saveTemplate: bool, ... }`) o usare `useReducer`; oppure estrarre sezioni in sottocomponenti con stato locale.

---

## Fase 6: Dati e caricamento (impatto alto su TTI, sforzo medio)

### 6.1 Ottimizzazione query lato server
- **File:** `lib/schedules.ts`, `app/(protected)/schedule/page.tsx`
- **Azione:**
  - Limitare colonne restituite dove possibile
  - Usare indici DB su (schedule_id, date, location_id, role_id)
  - Valutare `Promise.all` / parallelizzazione già presente (già usato in page.tsx)

### 6.2 Streaming / Suspense (avanzato)
- **Azione:** Wrappare `SchedulerClient` in `<Suspense>` e usare streaming per dati secondari (es. stats, coverage) se disponibile in Next.js.

### 6.3 Caching / revalidation
- **Azione:** Configurare `revalidate` o `staleTime` appropriati per la pagina schedule; evitare refresh completi dopo ogni azione se non strettamente necessario.

---

## Fase 7: DnD e drag overlay (impatto medio su UX, sforzo medio)

### 7.1 Drag overlay leggero
- **Problema:** Durante il drag si mostra l’intera `ShiftCard` con tutti i pulsanti.
- **Azione:** Creare `ShiftCardPreview` minimale: solo nome dipendente, ruolo, orario – nessun menu, nessun popover.

### 7.2 Throttle sensori DnD
- **Azione:** Verificare che @dnd-kit non aggiorni troppo spesso; documentazione per `activationConstraint` o limiti di polling se presenti.

---

## Fase 8: Bundle e dipendenze (impatto su FCP/LCP)

### 8.1 Analisi bundle ✅
- **Azione:** `npm run build:analyze` – usa @next/bundle-analyzer con `--webpack` (Turbopack default in Next 16 non supporta il plugin). Report in `next/analyze/` (client.html, nodejs.html).

### 8.2 Import lucide-react
- **Azione:** Verificare import tree-shakable: `import { Clock } from 'lucide-react'` (già corretto in shift-card).

### 8.3 PDF
- **Azione:** `ExportPdfModal` e `schedule-pdf-document` caricano librerie PDF; già candidati per lazy load (Fase 2).

---

## Fase 9: Virtualizzazione righe employee – affinamenti

### 9.1 Misurazione altezza righe (opzionale)
- **Problema:** `ROW_HEIGHT_ESTIMATE = 52` può essere impreciso.
- **Azione:** Valutare `measureElement` di TanStack Virtual per altezze dinamiche (aumenta complessità).

### 9.2 Overscan
- **Attuale:** `overscan: 5`
- **Azione:** Testare con 3–10 in base a device (mobile vs desktop) per bilanciare smoothness vs nodi DOM.

---

## Priorità e ordine di esecuzione

| Ordine | Fase | Impatto | Sforzo | Consiglio |
|--------|------|---------|--------|-----------|
| 1 | 1.1 ShiftCard memo | Alto | Basso | Subito |
| 2 | 1.4 navigateWeek useCallback | Medio | Basso | Subito |
| 3 | 2.1 Lazy load modali (PDF, AI) | Medio-alto | Basso | Subito |
| 4 | 1.2–1.3 memo Sidebar, Filters | Medio | Basso | Dopo 1.1 |
| 5 | 7.1 Drag overlay leggero | Medio | Medio | Dopo Fase 1–2 |
| 6 | 3.1 Virtualizzazione vista location | Alto | Medio | Se >20 righe sede/ruolo |
| 7 | 5.2–5.3 Ottimizzazioni stato | Medio | Medio | Se si notano re-render |
| 8 | 4.1 content-visibility | Medio | Basso | Nice-to-have |
| 9 | 3.2 Virtualizzazione vista role | Alto | Medio | Se molti ruoli/dipendenti |
| 10 | 6.x Ottimizzazioni dati | Alto (TTI) | Medio | Se caricamento lento |

---

## Metriche da monitorare

- **LCP** (Largest Contentful Paint): < 2.5s
- **INP** (Interaction to Next Paint): < 200ms per click/drag
- **FCP** (First Contentful Paint): < 1.8s
- **Tempo di scroll** con 50+ dipendenti: fluido, senza jank
- **Bundle size** pagina `/schedule`: monitorare dopo ogni fase

---

## Note tecniche

- **ShiftCell** riceve `getShiftsInCell` indirettamente via `shifts` calcolati nel parent; la funzione è `useCallback`, quindi stabile.
- **DnD** con virtualizzazione: i droppable hanno id fissi `cell:loc:role:day:period`; le righe virtualizzate non hanno droppable nella vista employee (solo celle con turni), quindi nessun conflitto attuale.
- **Vista location** usa `ShiftCell` che è droppable: con virtualizzazione bisogna assicurarsi che le celle fuori viewport esistano comunque nel DOM per il drop (TanStack Virtual con `overscan` le rende).
