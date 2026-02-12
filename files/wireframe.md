## Wireframe Reference Doc

### App Summary

**App Type:** Interactive scheduling SaaS multi-ruolo, multi-sede
**Input Pattern:** Configurazione dati (locali, dipendenti, vincoli) + AI generation trigger + drag & drop interattivo
**Output Pattern:** Griglia orario visuale, report PDF/CSV/Excel, notifiche WhatsApp/Email
**Roles:** Titolare (Owner), Manager, Dipendente, Commercialista, Super Admin

---

### ASCII / Markdown Mock-ups

---

#### Landing Page `/`

```
+================================================================+
|  [Logo]                    [Prezzi] [Login] [Prova Gratis]     |
|================================================================|
|                                                                 |
|        Crea gli orari del personale                             |
|        in pochi minuti, non in ore.                             |
|                                                                 |
|   Basta Excel, WhatsApp e fogli di carta.                      |
|   L'AI genera l'orario perfetto per tutti i tuoi locali.       |
|                                                                 |
|        [Prova Gratis per 30 Giorni]                             |
|                                                                 |
|-----------------------------------------------------------------|
|  Come Funziona                                                  |
|  +------------------+ +------------------+ +------------------+ |
|  | 1. Configura     | | 2. Genera con AI | | 3. Pubblica      | |
|  | Aggiungi locali  | | L'AI crea        | | I dipendenti     | |
|  | e dipendenti     | | l'orario ottimale| | ricevono su      | |
|  | in 10 minuti     | | in 30 secondi    | | WhatsApp         | |
|  +------------------+ +------------------+ +------------------+ |
|-----------------------------------------------------------------|
|  Funzionalita                                                   |
|  +------------------+ +------------------+ +------------------+ |
|  | AI Scheduling    | | Multi-Sede       | | Report Auto      | |
|  | Genera orari     | | Gestisci tutti   | | Invia al         | |
|  | ottimali con un  | | i locali da una  | | commercialista   | |
|  | click            | | sola dashboard   | | con un click     | |
|  +------------------+ +------------------+ +------------------+ |
|  +------------------+ +------------------+ +------------------+ |
|  | Drag & Drop      | | WhatsApp         | | Mobile App       | |
|  | Modifica turni   | | Notifiche        | | I dipendenti     | |
|  | trascinando      | | automatiche ai   | | vedono i turni   | |
|  |                  | | dipendenti       | | dal telefono     | |
|  +------------------+ +------------------+ +------------------+ |
|-----------------------------------------------------------------|
|  Prezzi         [Primo Mese Gratis - Tutte le funzionalita]     |
|  +---------------+ +------------------+ +-------------------+   |
|  | Starter       | | Pro              | | Business          |   |
|  | 9.99/mese     | | 24.99/mese       | | 49.99/mese        |   |
|  | 1 sede        | | 5 sedi           | | Illimitato        |   |
|  | 15 dipendenti | | 50 dipendenti    | | Dipendenti illim. |   |
|  | No AI         | | AI Scheduling    | | AI Avanzato       |   |
|  | Report base   | | Report avanzati  | | Integrazioni      |   |
|  | [Prova Gratis]| | [Prova Gratis]*  | | [Prova Gratis]    |   |
|  +---------------+ +------------------+ +-------------------+   |
|-----------------------------------------------------------------|
|  FAQ                                                            |
|  > Posso migrare da Excel?                                      |
|  > E compatibile col mio software paghe?                        |
|  > I miei dati sono al sicuro?                                  |
|  > Posso disdire quando voglio?                                 |
|-----------------------------------------------------------------|
|  [Footer: Privacy | Termini | Rimborsi | Contatti]              |
+================================================================+
```

---

#### Onboarding Wizard `/app/onboarding`

```
Step 1 di 5 - Tipo Attivita
+================================================================+
|  [Logo]          Configurazione Iniziale         Step 1/5       |
|================================================================|
|                                                                 |
|  Che tipo di attivita gestisci?                                 |
|                                                                 |
|  +------------------+ +------------------+ +------------------+ |
|  | [icon]           | | [icon]           | | [icon]           | |
|  | Ristorante       | | Casa di Riposo   | | Bar / Pub        | |
|  | Camerieri, cuochi| | Operatori, OSS   | | Baristi,          | |
|  | lavapiatti       | | infermieri       | | camerieri         | |
|  +------------------+ +------------------+ +------------------+ |
|  +------------------+ +------------------+ +------------------+ |
|  | [icon]           | | [icon]           | | [icon]           | |
|  | Retail / Negozio | | Hotel            | | Altro             | |
|  | Cassieri,        | | Reception,       | | Personalizza      | |
|  | commessi         | | housekeeping     | | i tuoi ruoli      | |
|  +------------------+ +------------------+ +------------------+ |
|                                                                 |
|                                          [Avanti →]            |
+================================================================+

Step 3 di 5 - Fabbisogno Personale
+================================================================+
|  [Logo]          Configurazione Iniziale         Step 3/5       |
|================================================================|
|  Locale: Ristorante Centro                                      |
|  Quante persone servono per ogni ruolo e giorno?                |
|                                                                 |
|  Turno: [Sera ▼]                                               |
|           Lun  Mar  Mer  Gio  Ven  Sab  Dom                    |
|  Camerieri [ 2] [ 2] [ 2] [ 2] [ 3] [ 4] [ 0]                |
|  Cuochi    [ 2] [ 2] [ 2] [ 2] [ 2] [ 3] [ 0]                |
|  Lavapiatti[ 1] [ 1] [ 1] [ 1] [ 2] [ 2] [ 0]                |
|  Baristi   [ 1] [ 1] [ 1] [ 1] [ 1] [ 2] [ 0]                |
|                                                                 |
|  [+ Aggiungi ruolo]                                             |
|  [Copia da: Mattina ▼]  [Copia da altro locale ▼]             |
|                                                                 |
|                              [← Indietro] [Avanti →]           |
+================================================================+
```

---

#### Dashboard Titolare `/app/dashboard`

```
+================================================================+
| Sidebar          |  Dashboard                                   |
|------------------|----------------------------------------------|
| [Logo App]       |                                              |
|                  |  +----------+ +----------+ +----------+      |
| 🏠 Dashboard     |  | 👥 32    | | ⚠️ 3     | | 🕐 245h  |      |
| 📅 Orario        |  | Attivi   | | Turni    | | Pianific. |      |
| 🏪 Locali        |  | oggi     | | scoperti | | settimana |      |
| 👥 Dipendenti    |  +----------+ +----------+ +----------+      |
| 📊 Report        |  +----------+                                |
| ⚙️ Impostazioni  |  | €4,230   |                                |
|                  |  | Costo    |                                |
|                  |  | stimato  |                                |
| ─────────────    |  +----------+                                |
| Sedi: 3/5       |                                              |
| Dip.: 28/50     |  Vista Rapida Settimana                      |
| Piano: Pro      |  +------------------------------------------+|
| [████████░░] 56%|  |      Lun  Mar  Mer  Gio  Ven  Sab  Dom  ||
|                  |  | Centro 🟢   🟢   🟢   🟢   🟡   🔴   ⚫  ||
|                  |  | Nord   🟢   🟢   🟡   🟢   🟢   🟢   ⚫  ||
|                  |  | Sud    🟢   🟢   🟢   🟢   🟢   🟡   ⚫  ||
|                  |  +------------------------------------------+|
|                  |  🟢 Coperto  🟡 Quasi  🔴 Scoperto  ⚫ Chiuso|
|                  |                                              |
|                  |  Notifiche e Alert                           |
|                  |  +------------------------------------------+|
|                  |  | ⚠️ 2 richieste cambio turno in attesa     ||
|                  |  | 🤒 Marco R. - malattia da oggi            ||
|                  |  | 📅 3 dipendenti senza turni settimana     ||
|                  |  +------------------------------------------+|
|                  |                                              |
|                  |  Azioni Rapide                               |
|                  |  [🤖 Genera Orario Prossima Sett.]           |
|                  |  [📢 Pubblica Orario]                        |
|                  |  [📊 Genera Report Mese]                     |
+==================+==============================================+
```

---

#### Scheduler - Vista Per Locale `/app/schedule`

```
+================================================================+
| Sidebar          |  Orario Settimanale                          |
|------------------|----------------------------------------------|
| [Logo App]       |  Toolbar:                                    |
|                  |  [← Sett.] 10-16 Feb 2025 [Sett. →]        |
| 🏠 Dashboard     |  Vista: [Per Locale*] [Per Dip.] [Per Ruolo]|
| 📅 Orario *      |  Locale: [Ristorante Centro ▼]               |
| 🏪 Locali        |  Ruolo: [Tutti ▼]                            |
| 👥 Dipendenti    |  [🤖 Genera AI] [📢 Pubblica] Stato: Bozza  |
| 📊 Report        |  ─────────────────────────────────────────── |
| ⚙️ Impostazioni  |                                              |
|                  |  Fabbisogno: Camerieri 2/2 ✅ Cuochi 2/2 ✅  |
|                  |              Lavapiatti 1/2 ⚠️               |
|                  |                                              |
|                  |  +------------------------------------------+|
|                  |  |        | Lun    | Mar    | Mer    | ...  ||
|                  |  |--------|--------|--------|--------|------||
|                  |  | Marco  |[18-23] |        |[18-23] |      ||
|                  |  | 🍽️ Cam |  Cam   |        |  Cam   |      ||
|                  |  |--------|--------|--------|--------|------||
|                  |  | Anna   |[18-23] |[18-23] |        |      ||
|                  |  | 🍽️ Cam |  Cam   |  Cam   |        |      ||
|                  |  |--------|--------|--------|--------|------||
|                  |  | Luigi  |[17-23] |[17-23] |[17-23] |      ||
|                  |  | 👨‍🍳 Cuo|  Cuoco |  Cuoco |  Cuoco |      ||
|                  |  |--------|--------|--------|--------|------||
|                  |  | [SCOPERTO]      |        |        |      ||
|                  |  | 🧹 Lav | ⚠️ 🔴  |        |        |      ||
|                  |  |        |[+Assegna]       |        |      ||
|                  |  +------------------------------------------+|
|                  |                                              |
| Dipendenti       |  📊 Riepilogo: 32h cam | 24h cuochi | ...  |
| Disponibili      |                                              |
| +──────────────+ |                                              |
| | 🔍 Cerca...  | |                                              |
| | Ruolo:[Tutti▼]| |                                              |
| |──────────────| |                                              |
| | Paolo M.     | |                                              |
| | 🍽️ Cam 🧹 Lav| |                                              |
| | 12h / 40h    | |                                              |
| | 🟢 Disponibile| |                                              |
| |──────────────| |                                              |
| | Sara L.      | |                                              |
| | 👨‍🍳 Cuoco    | |                                              |
| | 24h / 30h    | |                                              |
| | 🟡 Pref. altro| |                                              |
| |──────────────| |                                              |
| | [Trascina    | |                                              |
| |  sulla griglia| |                                              |
| |  per assegnare]| |                                              |
| +──────────────+ |                                              |
+==================+==============================================+
```

---

#### Scheduler - Vista Per Dipendente `/app/schedule` (tab)

```
+================================================================+
|  Vista: [Per Locale] [Per Dip.*] [Per Ruolo]                    |
|  Locale: [Tutti ▼]                                              |
|================================================================|
|                                                                 |
|  +------------------------------------------------------------+|
|  |           | Lun      | Mar      | Mer     | ... | Tot.Ore  ||
|  |-----------|----------|----------|---------|-----|----------||
|  | Marco R.  | Centro   |          | Centro  |     | 18h/40h  ||
|  | 🍽️ Cam    | 18-23    |          | 18-23   |     | [OK]     ||
|  |-----------|----------|----------|---------|-----|----------||
|  | Anna B.   | Centro   | Centro   | Nord    |     | 28h/30h  ||
|  | 🍽️ Cam    | 18-23    | 18-23    | 12-18   |     | [⚠️ -2h] ||
|  |-----------|----------|----------|---------|-----|----------||
|  | Luigi T.  | Centro   | Centro   | Centro  |     | 36h/40h  ||
|  | 👨‍🍳 Cuoco | 17-23    | 17-23    | 17-23   |     | [OK]     ||
|  |-----------|----------|----------|---------|-----|----------||
|  | Sara L.   |          |          |         |     | 0h/30h   ||
|  | 👨‍🍳 Cuoco |          |          |         |     | [⚠️ 0h!] ||
|  +------------------------------------------------------------+|
|                                                                 |
|  Legenda: 🟢 Sotto ore | 🟡 Vicino limite | 🔴 Straordinario   |
+================================================================+
```

---

#### AI Schedule Generation - Progress Overlay

```
+================================================================+
|                                                                 |
|  +----------------------------------------------------------+  |
|  |           🤖 Generazione Orario in Corso                  |  |
|  |                                                            |  |
|  |  [████████████████░░░░░░░░░░░░░░] 45%                    |  |
|  |                                                            |  |
|  |  Step: Ottimizzazione turni per Ristorante Centro...      |  |
|  |                                                            |  |
|  |  ✅ Raccolta vincoli (12 dipendenti, 3 locali)            |  |
|  |  ✅ Analisi disponibilita completata                      |  |
|  |  🔄 Ottimizzazione turni... (locale 1 di 3)              |  |
|  |  ⬜ Validazione conflitti                                 |  |
|  |  ⬜ Salvataggio risultati                                 |  |
|  |                                                            |  |
|  |  Tempo stimato: ~15 secondi                               |  |
|  |                                                            |  |
|  |  [Annulla]                                                |  |
|  +----------------------------------------------------------+  |
|                                                                 |
+================================================================+
```

---

#### Drag & Drop - Popup Conflitto/Suggerimento

```
+================================================================+
|  [Utente trascina "Marco" su Martedi sera al Centro]           |
|                                                                 |
|  +----------------------------------------------------------+  |
|  |  ⚠️ Attenzione                                            |  |
|  |                                                            |  |
|  |  Marco ha segnalato incompatibilita con Luigi,            |  |
|  |  che e gia in turno Martedi sera al Centro.               |  |
|  |                                                            |  |
|  |  💡 Suggerimenti AI:                                      |  |
|  |  • Sposta Marco a Mercoledi sera (slot libero)            |  |
|  |  • Assegna Paolo al posto di Marco (stesso ruolo, disp.)  |  |
|  |  • Sposta Luigi al Nord per Martedi (coprirebbe la anche) |  |
|  |                                                            |  |
|  |  [Assegna Comunque] [Accetta Suggerimento 1] [Annulla]    |  |
|  +----------------------------------------------------------+  |
|                                                                 |
+================================================================+
```

---

#### Gestione Malattia - Popup Sostituti

```
+================================================================+
|  [Click su turno Marco → "Segna Malattia"]                     |
|                                                                 |
|  +----------------------------------------------------------+  |
|  |  🤒 Malattia - Marco Rossi                                |  |
|  |  Turno scoperto: Lunedi 18-23, Cameriere, Centro          |  |
|  |                                                            |  |
|  |  🤖 Sostituti Suggeriti (ranking AI):                     |  |
|  |                                                            |  |
|  |  1. ⭐ Paolo M. - Cameriere                               |  |
|  |     12h/40h questa sett. | Sede pref: Centro | Score: 95 |  |
|  |     [Assegna + Notifica WhatsApp]                         |  |
|  |                                                            |  |
|  |  2. Sara L. - Cameriere + Lavapiatti                      |  |
|  |     8h/30h questa sett. | Sede pref: Nord | Score: 78    |  |
|  |     [Assegna + Notifica WhatsApp]                         |  |
|  |                                                            |  |
|  |  3. Giulia F. - Cameriere                                 |  |
|  |     20h/40h questa sett. | Nessuna pref. | Score: 65     |  |
|  |     [Assegna + Notifica WhatsApp]                         |  |
|  |                                                            |  |
|  |  [Lascia Scoperto] [Cerca Manualmente]                    |  |
|  +----------------------------------------------------------+  |
|                                                                 |
+================================================================+
```

---

#### Gestione Locali `/app/locations`

```
+================================================================+
| Sidebar          |  I Miei Locali                               |
|------------------|----------------------------------------------|
|                  |  [+ Aggiungi Locale]                         |
|                  |                                              |
|                  |  +------------------+ +------------------+   |
|                  |  | 🏪 Ristorante    | | 🏪 Ristorante    |   |
|                  |  | Centro           | | Nord             |   |
|                  |  | Via Roma 15      | | Via Milano 8     |   |
|                  |  | Orario: 12-15    | | Orario: 18-24    |   |
|                  |  |         18-24    | |                  |   |
|                  |  | 👥 12 dipendenti | | 👥 8 dipendenti  |   |
|                  |  | 📅 45 turni/sett | | 📅 28 turni/sett |   |
|                  |  | ✅ Configurato   | | ⚠️ Incompleto    |   |
|                  |  | [Modifica]       | | [Completa Setup] |   |
|                  |  | [Vedi Orario]    | | [Vedi Orario]    |   |
|                  |  +------------------+ +------------------+   |
|                  |                                              |
|                  |  +------------------+                        |
|                  |  | 🏪 Ristorante    |                        |
|                  |  | Sud              |                        |
|                  |  | Via Napoli 22    |                        |
|                  |  | Orario: 12-15    |                        |
|                  |  |         18-24    |                        |
|                  |  | 👥 10 dipendenti |                        |
|                  |  | 📅 35 turni/sett |                        |
|                  |  | ✅ Configurato   |                        |
|                  |  | [Modifica]       |                        |
|                  |  | [Vedi Orario]    |                        |
|                  |  +------------------+                        |
+==================+==============================================+
```

---

#### Dettaglio Locale - Fabbisogno `/app/locations/[id]`

```
+================================================================+
| ← Torna ai Locali                                              |
|================================================================|
| Ristorante Centro                                               |
| Via Roma 15, Milano | Tel: 02-1234567                           |
| Orari: Lun-Sab 12:00-15:00, 18:00-24:00 | Dom: Chiuso         |
| [Modifica Info]                                                 |
|----------------------------------------------------------------|
|                                                                 |
| Fabbisogno Personale                                            |
| Turno: [Mattina] [Sera*]                                       |
|                                                                 |
|  +------------------------------------------------------------+|
|  |            | Lun | Mar | Mer | Gio | Ven | Sab | Dom       ||
|  |------------|-----|-----|-----|-----|-----|-----|------------||
|  | Camerieri  | [2] | [2] | [2] | [2] | [3] | [4] | [Chiuso] ||
|  | Cuochi     | [2] | [2] | [2] | [2] | [2] | [3] | [Chiuso] ||
|  | Lavapiatti | [1] | [1] | [1] | [1] | [2] | [2] | [Chiuso] ||
|  | Baristi    | [1] | [1] | [1] | [1] | [1] | [2] | [Chiuso] ||
|  +------------------------------------------------------------+|
|  [+ Aggiungi Ruolo]                                             |
|  [Copia da Turno Mattina] [Copia da altro Locale]              |
|  [Salva Modifiche]                                              |
|                                                                 |
|----------------------------------------------------------------|
| Dipendenti Assegnati (12)                                       |
| Marco R. (Cam) | Anna B. (Cam) | Luigi T. (Cuoco) | ...       |
| [+ Assegna Dipendente]                                          |
|----------------------------------------------------------------|
| Statistiche: 45 turni/sett | €2,100 costo stim. | 92% coperti |
+================================================================+
```

---

#### Gestione Dipendenti `/app/employees`

```
+================================================================+
| Sidebar          |  Dipendenti (28)                             |
|------------------|----------------------------------------------|
|                  |  [+ Aggiungi] [📥 Import CSV] [🔍 Cerca...] |
|                  |  Filtri: [Mansione ▼] [Locale ▼] [Contr. ▼] |
|                  |                                              |
|                  |  +------------------------------------------+|
|                  |  | Nome       | Mansioni    | Sede  | Ore  ||
|                  |  |------------|-------------|-------|------||
|                  |  | Marco R.   | 🍽️ Cam      | Centro| 40h  ||
|                  |  | Anna B.    | 🍽️ Cam      | Centro| 30h  ||
|                  |  | Luigi T.   | 👨‍🍳 Cuoco   | Centro| 40h  ||
|                  |  | Sara L.    | 👨‍🍳 Cuo 🍽️ Ca| Nord  | 30h  ||
|                  |  | Paolo M.   | 🍽️ Cam 🧹 Lav| Centro| 40h  ||
|                  |  | Giulia F.  | 🍽️ Cam      | --    | 20h  ||
|                  |  | ...        |             |       |      ||
|                  |  +------------------------------------------+|
|                  |  Pagina 1 di 2  [1] [2] [→]                  |
+==================+==============================================+
```

---

#### Dettaglio Dipendente `/app/employees/[id]`

```
+================================================================+
| ← Torna ai Dipendenti                                          |
|================================================================|
| [Avatar] Marco Rossi                    Stato: 🟢 Attivo       |
| Tel: +39 333 1234567 | Email: marco@email.com                  |
| Mansioni: 🍽️ Cameriere                                         |
| Contratto: Full-time | 40h/settimana | €10.50/h                |
| Sede preferita: Centro                                          |
| [Modifica Profilo]                                              |
|----------------------------------------------------------------|
|                                                                 |
| Preferenze e Vincoli                                            |
| +----------------------------------------------------------+   |
| | Indisponibilita ricorrenti: Martedi (tutto il giorno)     |   |
| | Incompatibilita: Luigi T. (motivo: personale)             |   |
| | Note: Preferisce turni serali                             |   |
| | [Modifica Preferenze]                                     |   |
| +----------------------------------------------------------+   |
|                                                                 |
| Orario Corrente (Settimana 10-16 Feb)                          |
| +----------------------------------------------------------+   |
| | Lun: Centro 18-23 (Cam) | Mar: -- | Mer: Centro 18-23   |   |
| | Gio: Nord 18-23 (Cam) | Ven: Centro 18-24 | Sab: Centro |   |
| | Totale: 34h / 40h contrattuali                           |   |
| +----------------------------------------------------------+   |
|                                                                 |
| Storico Ultimi 3 Mesi                                          |
| +----------------------------------------------------------+   |
| | Gen 2025: 160h (152 ord + 8 straord) | €1,722            |   |
| | Dic 2024: 155h (150 ord + 5 straord) | €1,665            |   |
| | Nov 2024: 148h (148 ord + 0 straord) | €1,554            |   |
| | Assenze: 2 gg malattia (Gen) | 0 ferie                   |   |
| +----------------------------------------------------------+   |
+================================================================+
```

---

#### Report Commercialista `/app/reports`

```
+================================================================+
| Sidebar          |  Report Commercialista                       |
|------------------|----------------------------------------------|
|                  |  Commercialista: Dott. Bianchi (collegato ✅) |
|                  |  [⚙️ Impostazioni Commercialista]             |
|                  |                                              |
|                  |  [📊 Genera Report Mese Corrente]            |
|                  |                                              |
|                  |  Report Generati                             |
|                  |  +------------------------------------------+|
|                  |  | Gennaio 2025              ✅ Inviato     ||
|                  |  | 28 dipendenti | 4,320 ore | €45,360     ||
|                  |  | [📄 PDF] [📊 CSV] [📗 Excel] [👁 Vedi]  ||
|                  |  |------------------------------------------||
|                  |  | Dicembre 2024             ✅ Inviato     ||
|                  |  | 26 dipendenti | 4,050 ore | €42,525     ||
|                  |  | [📄 PDF] [📊 CSV] [📗 Excel] [👁 Vedi]  ||
|                  |  |------------------------------------------||
|                  |  | Novembre 2024             ✅ Inviato     ||
|                  |  | 25 dipendenti | 3,800 ore | €39,900     ||
|                  |  | [📄 PDF] [📊 CSV] [📗 Excel] [👁 Vedi]  ||
|                  |  +------------------------------------------+|
+==================+==============================================+
```

---

#### Anteprima Report `/app/reports/[id]`

```
+================================================================+
| ← Torna ai Report                                              |
|================================================================|
| Report Gennaio 2025 - Ristorante Rossi S.r.l.                  |
| Generato: 01/02/2025 | Stato: Inviato al commercialista        |
| [📄 PDF] [📊 CSV] [📗 Excel] [📧 Reinvia al Commercialista]   |
|----------------------------------------------------------------|
|                                                                 |
| Riepilogo Generale                                              |
| +----------------------------------------------------------+   |
| | Dipendenti attivi: 28 | Ore totali: 4,320               |   |
| | Ore ordinarie: 4,050 | Ore straordinarie: 180            |   |
| | Ore festive: 90 | Malattia: 48h | Ferie: 120h           |   |
| | Costo stimato: €45,360                                   |   |
| +----------------------------------------------------------+   |
|                                                                 |
| Dettaglio per Dipendente                                        |
| +----------------------------------------------------------+   |
| | Nome      | Contr. | Ord. | Str. | Fest.| Mal.| Tot | €  |   |
| |-----------|--------|------|------|------|-----|-----|-----|   |
| | Marco R.  | FT 40h | 160  | 8    | 0    | 0   | 168 |1764|   |
| | Anna B.   | PT 30h | 120  | 0    | 5    | 8   | 133 |1430|   |
| | Luigi T.  | FT 40h | 155  | 5    | 0    | 0   | 160 |1785|   |
| | ...       |        |      |      |      |     |     |    |   |
| +----------------------------------------------------------+   |
|                                                                 |
| Dettaglio per Locale                                            |
| +----------------------------------------------------------+   |
| | Locale     | Ore Totali | Costo    | Dipendenti           |   |
| |------------|------------|----------|----------------------|   |
| | Centro     | 1,850h     | €19,425  | 12                   |   |
| | Nord       | 1,280h     | €13,440  | 8                    |   |
| | Sud        | 1,190h     | €12,495  | 10                   |   |
| +----------------------------------------------------------+   |
+================================================================+
```

---

#### Area Dipendente - Il Mio Orario (Mobile) `/app/my-schedule`

```
+================================+
| [Logo]     Il Mio Orario   [🔔]|
|================================|
| ← 10-16 Febbraio 2025 →       |
|                                |
| LUNEDI 10                      |
| +----------------------------+ |
| | 🏪 Ristorante Centro       | |
| | 🕐 18:00 - 23:00           | |
| | 🍽️ Cameriere                | |
| | Colleghi: Anna B., Luigi T.| |
| +----------------------------+ |
|                                |
| MARTEDI 11                     |
| +----------------------------+ |
| | 🔵 Giorno libero           | |
| +----------------------------+ |
|                                |
| MERCOLEDI 12                   |
| +----------------------------+ |
| | 🏪 Ristorante Centro       | |
| | 🕐 18:00 - 23:00           | |
| | 🍽️ Cameriere                | |
| | Colleghi: Paolo M., Sara L.| |
| +----------------------------+ |
|                                |
| GIOVEDI 13                     |
| +----------------------------+ |
| | 🏪 Ristorante Nord         | |
| | 🕐 18:00 - 23:00           | |
| | 🍽️ Cameriere                | |
| +----------------------------+ |
|                                |
| ... (scroll per altri giorni)  |
|                                |
| ┌──────────────────────────┐   |
| | Ore settimana: 25h / 40h |   |
| | Ore mese: 98h / 160h     |   |
| └──────────────────────────┘   |
|================================|
| [📅 Orario] [✏️ Pref.] [📝 Rich.] [👤] |
+================================+
```

---

#### Area Dipendente - Preferenze (Mobile) `/app/my-preferences`

```
+================================+
| [Logo]    Le Mie Preferenze [🔔]|
|================================|
|                                |
| Disponibilita Settimanale      |
| +----------------------------+ |
| |      | Matt | Pom  | Sera  | |
| |------|------|------|-------| |
| | Lun  |  ✅  |  ✅  |  ✅   | |
| | Mar  |  ❌  |  ❌  |  ❌   | |
| | Mer  |  ✅  |  ✅  |  ✅   | |
| | Gio  |  ✅  |  ✅  |  ✅   | |
| | Ven  |  ✅  |  ✅  |  ⭐   | |
| | Sab  |  ✅  |  ✅  |  ⭐   | |
| | Dom  |  ❌  |  ❌  |  ❌   | |
| +----------------------------+ |
| ✅ Disponibile ❌ No ⭐ Preferito|
|                                |
| Sede Preferita                 |
| [Ristorante Centro ▼]         |
|                                |
| Sedi Escluse                   |
| [ ] Ristorante Nord           |
| [ ] Ristorante Sud            |
|                                |
| Incompatibilita Colleghi       |
| +----------------------------+ |
| | Luigi T. [x rimuovi]       | |
| | [+ Aggiungi collega]       | |
| +----------------------------+ |
|                                |
| [Salva Preferenze]             |
|================================|
| [📅 Orario] [✏️ Pref.*] [📝 Rich.] [👤] |
+================================+
```

---

#### Portale Commercialista `/app/accountant`

```
+================================================================+
| Sidebar          |  Portale Commercialista                      |
|------------------|----------------------------------------------|
| [Logo App]       |  Benvenuto, Dott. Bianchi                    |
|                  |                                              |
| 📊 Report        |  I Tuoi Clienti (3)                          |
| ⚙️ Impostazioni  |                                              |
| 👤 Profilo       |  +------------------------------------------+|
|                  |  | 🏪 Ristorante Rossi S.r.l.               ||
|                  |  | 3 sedi | 28 dipendenti                   ||
|                  |  | Ultimo report: Gennaio 2025 ✅            ||
|                  |  | [📄 PDF] [📊 CSV] [📗 Excel]             ||
|                  |  | Febbraio 2025: ⏳ Non ancora generato     ||
|                  |  |------------------------------------------||
|                  |  | 🏪 Bar Sport S.r.l.                      ||
|                  |  | 1 sede | 8 dipendenti                    ||
|                  |  | Ultimo report: Gennaio 2025 ✅            ||
|                  |  | [📄 PDF] [📊 CSV] [📗 Excel]             ||
|                  |  |------------------------------------------||
|                  |  | 🏪 Casa Serena RSA                       ||
|                  |  | 2 sedi | 45 dipendenti                   ||
|                  |  | Ultimo report: Gennaio 2025 🆕 Nuovo!    ||
|                  |  | [📄 PDF] [📊 CSV] [📗 Excel]             ||
|                  |  +------------------------------------------+|
|                  |                                              |
|                  |  [📥 Scarica Tutti i Report Gennaio]         |
+==================+==============================================+
```

---

#### Profilo e Abbonamento `/app/profile`

```
+================================================================+
| Sidebar          |  Il Mio Profilo                              |
|------------------|----------------------------------------------|
|                  |                                              |
|                  |  Account                                     |
|                  |  +------------------------------------------+|
|                  |  | [Logo] Ristorante Rossi S.r.l.           ||
|                  |  | Nome: Mario Rossi                        ||
|                  |  | Email: mario@ristoranterossi.it           ||
|                  |  | Tel: +39 02 1234567                      ||
|                  |  | [Modifica] [Cambia Password]              ||
|                  |  +------------------------------------------+|
|                  |                                              |
|                  |  Abbonamento                                  |
|                  |  +------------------------------------------+|
|                  |  | Piano: Pro (24.99 €/mese)                ||
|                  |  | Rinnovo: 15 Marzo 2025                   ||
|                  |  | Metodo: Visa ****4242                    ||
|                  |  | [Gestisci Abbonamento] → Stripe Portal   ||
|                  |  +------------------------------------------+|
|                  |                                              |
|                  |  Utilizzo                                    |
|                  |  +------------------------------------------+|
|                  |  | Sedi: 3 / 5     [██████████░░░░] 60%     ||
|                  |  | Dipendenti: 28 / 50 [████████████░] 56%  ||
|                  |  | AI Gen. mese: 8 generazioni               ||
|                  |  | Report inviati: 1 questo mese             ||
|                  |  +------------------------------------------+|
|                  |                                              |
|                  |  Piani Disponibili                           |
|                  |  +------------+ +-------------+ +-----------+|
|                  |  | Starter    | | Pro ⭐      | | Business  ||
|                  |  | 9.99/mese  | | 24.99/mese  | | 49.99/m  ||
|                  |  | 1 sede     | | 5 sedi      | | Illimit. ||
|                  |  | 15 dip.    | | 50 dip.     | | Illimit. ||
|                  |  | No AI      | | AI ✅       | | AI++ ✅  ||
|                  |  | [Attuale]  | | [Piano Att.]| | [Upgrade]||
|                  |  +------------+ +-------------+ +-----------+|
+==================+==============================================+
```

---

### Navigation Flow Map

```
===============================================================
                      FLUSSO PUBBLICO
===============================================================

Landing (/) → [Prova Gratis] → Signup (/auth/sign-up)
                               → Login (/auth/login)
    ↓
Signup → Verify Email → Onboarding Wizard (5 steps)
    ↓                        ↓
Login ─────────────→ Dashboard (/app/dashboard)


===============================================================
                   FLUSSO TITOLARE (Owner)
===============================================================

Dashboard (/app/dashboard)
  ├─ [Genera Orario] → Scheduler (/app/schedule)
  ├─ [Pubblica Orario] → Trigger Notification Dispatch
  ├─ [Genera Report] → Reports (/app/reports)
  └─ [Alert turno scoperto] → Scheduler (filtrato)

Scheduler (/app/schedule)
  ├─ [Genera con AI] → AI Background Job (10-30s)
  │    ↓ (progress bar real-time)
  │    → Griglia popolata con orario generato (stato: Bozza)
  ├─ [Drag & Drop turno] → Validazione conflitti (<2s)
  │    ↓ (se conflitto)
  │    → Popup suggerimenti AI
  ├─ [Segna Malattia] → Conflict Resolution Job (3-10s)
  │    ↓
  │    → Popup sostituti suggeriti
  │    ↓ (click "Assegna")
  │    → Notification WhatsApp al sostituto
  ├─ [Pubblica] → Notification Dispatch Job
  │    ↓
  │    → WhatsApp + Email a tutti i dipendenti
  └─ Vista: [Per Locale] ↔ [Per Dipendente] ↔ [Per Ruolo]

Locali (/app/locations)
  ├─ [+ Aggiungi] → Form nuovo locale
  └─ [Card locale] → Dettaglio (/app/locations/[id])
       ├─ Fabbisogno personale (griglia editabile)
       ├─ Dipendenti assegnati
       └─ Statistiche locale

Dipendenti (/app/employees)
  ├─ [+ Aggiungi] → Form nuovo dipendente
  ├─ [Import CSV] → CSV Upload → Import Job (background)
  └─ [Riga dipendente] → Dettaglio (/app/employees/[id])
       ├─ Profilo e contratto
       ├─ Preferenze e vincoli
       ├─ Orario personale
       └─ Storico ore/assenze

Report (/app/reports)
  ├─ [Genera Report] → Report Generation Job (15-45s)
  │    ↓
  │    → PDF + CSV + Excel generati
  │    ↓
  │    → Notifica al commercialista (fire-and-forget)
  └─ [Vedi Report] → Anteprima (/app/reports/[id])
       └─ [Download PDF/CSV/Excel] [Reinvia]

Impostazioni (/app/settings/*)
  ├─ /work → Ruoli, contratti, regole turni
  ├─ /accountant → Collega commercialista, formato report
  └─ /notifications → Preferenze canali notifica

Profilo (/app/profile)
  ├─ Account info
  ├─ Abbonamento → [Gestisci] → Stripe Portal
  ├─ Utilizzo (sedi/dipendenti/AI gen.)
  └─ Piani → [Upgrade] → Stripe Checkout


===============================================================
                   FLUSSO MANAGER
===============================================================

Dashboard (/app/dashboard) [filtrato per proprio locale]
  ├─ Scheduler (/app/schedule) [solo proprio locale, modifica limitata]
  ├─ Dipendenti (/app/employees) [solo proprio locale]
  ├─ Richieste (/app/requests) [approva/rifiuta]
  └─ Notifiche + Profilo


===============================================================
                   FLUSSO DIPENDENTE (Mobile)
===============================================================

Bottom Tab Bar:

[📅 Orario] → /app/my-schedule
  └─ Vista settimanale/mensile dei propri turni

[✏️ Preferenze] → /app/my-preferences
  ├─ Griglia disponibilita (giorno × fascia)
  ├─ Sede preferita
  └─ Incompatibilita colleghi

[📝 Richieste] → /app/my-requests
  ├─ [+ Nuova Richiesta] → Form (cambio turno / ferie / malattia)
  └─ Storico richieste con stato

[👤 Profilo] → /app/profile
  └─ Info personali


===============================================================
                   FLUSSO COMMERCIALISTA
===============================================================

Dashboard (/app/accountant)
  ├─ Lista clienti con stato report
  ├─ [Download Report] → PDF/CSV/Excel
  ├─ [Vedi Report] → Dettaglio (/app/accountant/[clientId]/[month])
  └─ [Scarica Tutti] → ZIP con tutti i report del mese

Accesso:
  Invito via WhatsApp/Email con link → /auth/invite/[token]
  → Registrazione/Login → Portale Commercialista


===============================================================
                   FLUSSO ADMIN (Super Admin)
===============================================================

/admin/dashboard → Metriche sistema, salute, errori
/admin/analytics → Revenue, costi, conversioni, churn
/admin/users → Gestione utenti, piani, sospensioni
```

---

### Responsive Breakpoints

```
Desktop (>1024px):
  Titolare/Manager: Sidebar fissa + contenuto principale + sidebar dipendenti (scheduler)
  Commercialista: Sidebar fissa + contenuto principale

Tablet (768-1024px):
  Sidebar collassabile (hamburger menu)
  Scheduler: griglia scrollabile orizzontalmente
  Sidebar dipendenti: drawer dal basso

Mobile (<768px):
  Dipendente: Bottom tab bar, no sidebar
  Titolare/Manager: Bottom tab bar + hamburger per menu completo
  Scheduler: vista giornaliera (swipe per cambiare giorno)
  Cards stack verticalmente
```
