# Design: Orari turni configurabili

## Problema attuale

Oggi gli orari sono **fissi e uguali per tutti**:
- **Mattina** = 08:00–14:00 (tutti)
- **Sera** = 14:00–23:00 (tutti)

Non è realistico: il cuoco può fare 10–15, il cameriere 11–16, il barista 09–13. Ogni ruolo può avere orari diversi e talvolta anche per sede.

---

## Cosa serve

1. **Orari variabili per ruolo** – Cuoco 10–15, Cameriere 11–16, ecc.
2. **Modifica singolo turno** – Eccezioni: oggi Mario fa 10–14 invece del solito 11–16.
3. **Gestione centralizzata** – Impostare “Cameriere mattina = 11–16” una volta, non 14 volte.
4. **Mix template + eccezioni** – Default dal template, ma modificabile per singolo turno.

---

## Strategia proposta (per fasi)

### Fase 1 – Quick win (1–2 giorni, nessuna migrazione DB)

**A) Modifica orari singolo turno** ✅ *Implementato*

- Il backend (`updateShift`) **già supporta** `startTime` e `endTime`.
- Manca solo l’UI: clic sul turno → modale “Modifica orari” con due campi ora (es. 11:00, 16:00).
- Posizione: aggiungere un pulsante/azione nella `ShiftCard` (es. icona orologio) che apre un popover/modal.

**B) Default organizzazione** ✅ *Implementato*

- Salvati in `work_rules.shift_times`; UI in Impostazioni → Regole di lavoro.
- Creazione turni (drag, AI) usa i tempi configurati; fallback a 08–14 / 14–23 se non impostati.

**Risultato Fase 1:**  
- Orari modificabili turno per turno.  
- Default configurabili a livello organizzazione (se si implementa il punto B).

---

### Fase 2 – Orari per ruolo (1 migrazione + UI)

**Schema**

- Estendere `roles` o creare `role_shift_times`:
  - `role_id`, `shift_period` (morning/evening), `start_time`, `end_time`
  - Esempio: Cameriere + mattina → 11:00–16:00, Cuoco + mattina → 10:00–15:00

**Logica di creazione turno**

```
1. Cercare role_shift_times per (role_id, period)
2. Se trovato → usare quei tempi
3. Altrimenti → default organizzazione (Fase 1B) o PERIOD_TIMES
```

**UI**

- Nella pagina **Ruoli** (o nella sezione Mansioni): per ogni ruolo, campi “Mattina” e “Sera” con orario inizio/fine.
- Esempio:  
  - Cameriere: Mattina 11:00–16:00, Sera 16:00–23:00  
  - Cuoco: Mattina 10:00–15:00, Sera 15:00–22:00  

**Risultato Fase 2:**  
- Orari predefiniti per ruolo.  
- Un’impostazione centrale, nessuna duplicazione.

---

### Fase 3 – Orari per sede+ruolo (opzionale)

Se servono orari diversi per sede (es. Pinerolo 11–16, Piosacco 10–15):

**Schema**

- Nuova tabella `location_role_shift_times`:
  - `location_id`, `role_id`, `shift_period`, `start_time`, `end_time`
  - Override rispetto a `role_shift_times`

**Logica**

```
1. Cercare location_role_shift_times per (location_id, role_id, period)
2. Se trovato → usare
3. Altrimenti → role_shift_times (Fase 2)
4. Altrimenti → default org → PERIOD_TIMES
```

**UI**

- Nella pagina **Sede > Fabbisogno**: sotto ogni ruolo, opzione “Orari personalizzati per questa sede” con campi ora.

---

## Riepilogo priorità

| Priorità | Cosa | Effort | Valore |
|----------|------|--------|--------|
| **1** | UI modifica orari singolo turno (ShiftCard) | Basso | Alto – eccezioni immediate |
| **2** | Default organizzazione (org_settings) | Basso | Medio – un’unica configurazione base |
| **3** | Orari per ruolo (role_shift_times) | Medio | Alto – cuoco ≠ cameriere |
| **4** | Orari per sede+ruolo | Alto | Medio – multi-sede con orari diversi |

---

## Risposta alle domande

**“Parte a turni, parte a ore?”**  
- **Template (turni):** Mattina/Sera con orari predefiniti (per ruolo/sede).  
- **Ore:** Ogni singolo turno può avere orari diversi (modifica manuale).  
- Il sistema usa i template alla creazione e permette override turno per turno.

**“Tutti i giorni uguali?”**  
- Sì, con Fase 2 e 3: un’impostazione vale per tutta la settimana.  
- **Orari per giorno** ✅: `day_of_week` in role_shift_times e location_role_shift_times (0–6 = giorno, 7 = tutti). UI Mansioni: "Orari sabato e domenica".

**“Dove configuro?”**  
- **Impostazioni org:** Default Mattina/Sera (Fase 1B).  
- **Ruoli:** Orari per ruolo (Fase 2).  
- **Sede > Fabbisogno:** Override per sede (Fase 3).  
- **Griglia programmazione:** Modifica singolo turno cliccando sul turno (Fase 1A).

---

## Note tecniche

- `shifts.start_time` e `shifts.end_time` sono già presenti: ogni turno può avere orari propri.
- `updateShift` accetta già `startTime` e `endTime`: serve solo l’UI.
- `PERIOD_TIMES` in `lib/schedules.ts` è usato da: `createShift`, `ai-schedule`, `schedule-templates`. Tutti andranno aggiornati per usare la gerarchia: ruolo > org default > hardcoded.
