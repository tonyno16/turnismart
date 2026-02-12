# App Pages & Functionality Blueprint

### App Summary

**End Goal:** Aiutare titolari e manager di attivita commerciali multi-sede a creare, gestire e ottimizzare gli orari del personale in pochi minuti e inviare automaticamente i report al commercialista per l'elaborazione delle buste paga
**Core Value Proposition:** Scheduling AI-powered che genera orari ottimali in secondi, con drag & drop per modifiche rapide e invio automatico report al commercialista
**Target Users:** Titolari multi-sede (ristoranti, case di riposo, retail), Manager di sede, Dipendenti, Commercialisti
**Template Type:** Interactive scheduling SaaS con AI agent, multi-tenant, multi-role

---

## 🔄 Workflow Overview

### Core Application Flow

Questa app NON segue il pattern classico "upload → background job → risultato". E un'applicazione di **scheduling interattivo multi-ruolo** con questo flusso:

**📥 Inputs (Configurazione)**
- **Dati Strutturali**: Punti vendita con orari di apertura, fabbisogno personale per giorno/fascia oraria, ruoli/mansioni richiesti
- **Dati Personale**: Dipendenti con mansioni multiple, contratti, paga oraria, preferenze sede, incompatibilita colleghi, disponibilita
- **Trigger Scheduling**: Il titolare preme "Genera Orario Settimanale" per attivare l'AI agent
- **Modifiche Live**: Drag & drop per aggiustamenti manuali, gestione imprevisti (malattie, cambi turno)

**⚙️ Processing (AI Scheduling Agent)**
1. Raccolta vincoli: fabbisogno locali, disponibilita dipendenti, preferenze, incompatibilita, contratti
2. Ottimizzazione: distribuzione equa turni, minimizzazione straordinari, rispetto riposi obbligatori
3. Generazione orario completo per tutti i locali della settimana
4. Validazione conflitti: sovrapposizioni, ore massime, riposi, indisponibilita
5. Suggerimenti live: quando l'utente fa drag & drop, l'AI suggerisce alternative ottimali in tempo reale

**📤 Outputs**
- **Orario Visuale**: Griglia settimanale interattiva per locale/dipendente con drag & drop
- **Notifiche**: WhatsApp/Email ai dipendenti quando l'orario viene pubblicato o modificato
- **Report Commercialista**: PDF/CSV/Excel con ore lavorate, tipo ore, paga oraria per dipendente
- **Dashboard Analytics**: KPI su costi personale, straordinari, assenteismo, equita turni

**⚡ Real-Time Requirements**
- **AI Scheduling Generation**: Background job via Trigger.dev (10-30 secondi), progress tracking in tempo reale con streaming
- **Suggerimenti Drag & Drop**: API endpoint veloce (<2 secondi) che valida e suggerisce alternative quando l'utente sposta un turno
- **Notifiche**: Background job per invio batch WhatsApp/Email dopo pubblicazione orario
- **Report Generation**: Background job per compilazione e invio report mensile

---

## 🌐 Universal SaaS Foundation

### Public Marketing Pages

- **Landing Page** — `/`
  - Hero: "Crea gli orari del personale in pochi minuti, non in ore"
  - Problem highlight: "Basta Excel, WhatsApp e fogli di carta. Gestisci tutti i tuoi locali da un'unica piattaforma."
  - Feature showcase:
    - AI che genera l'orario ottimale in secondi
    - Drag & drop per modifiche rapide
    - Gestione multi-sede centralizzata
    - Report automatici per il commercialista
    - App mobile per i dipendenti
  - Pricing section (embedded): 3-tier + primo mese gratis
    - Free Trial: 30 giorni gratis con tutte le funzionalita Pro
    - Starter (9.99 euro/mese): 1 sede, 15 dipendenti
    - Pro (24.99 euro/mese): 5 sedi, 50 dipendenti, AI scheduling
    - Business (49.99 euro/mese): Sedi e dipendenti illimitati, integrazioni
  - FAQ section: Domande su migrazione da Excel, compatibilita software paghe, sicurezza dati
  - CTA: "Prova gratis per 30 giorni"
  - Social proof: Testimonianze di ristoratori e gestori case di riposo

- **Legal Pages** — `/privacy`, `/terms`, `/refunds`
  - Privacy policy (GDPR compliance, trattamento dati dipendenti, data residency EU)
  - Terms of service (SaaS operations, responsabilita dati)
  - Refund policy (rimborso entro 14 giorni)

### Authentication Flow

- **Login** — `/auth/login` (Email/password, OAuth via Google)
- **Sign Up** — `/auth/sign-up` (Registrazione con selezione tipo attivita, auto-assign Free Trial 30 giorni)
- **Forgot Password** — `/auth/forgot-password` (Reset password via email)
- **Email Verification** — `/auth/verify-email` (Conferma email dopo registrazione)

---

## ⚡ Core Application Pages

### Onboarding Wizard (Prima volta dopo signup)

- **Setup Guidato** — `/app/onboarding`
  - **Step 1 - Tipo Attivita**:
    - Selezione template settoriale: Ristorante, Casa di Riposo, Bar/Pub, Retail/Negozio, Hotel, Altro
    - Caricamento automatico ruoli e configurazioni tipiche del settore
  - **Step 2 - Punti Vendita**:
    - Aggiunta primo locale: nome, indirizzo, orari apertura per giorno
    - Possibilita di aggiungere altri locali (skip e aggiungi dopo)
  - **Step 3 - Fabbisogno Personale**:
    - Per ogni locale: quanti dipendenti per ruolo per giorno/fascia oraria
    - Griglia visuale: righe = ruoli, colonne = giorni, celle = numero persone richieste
    - Differenziazione mattina/pomeriggio/sera per ogni giorno
  - **Step 4 - Primi Dipendenti**:
    - Aggiunta rapida dipendenti: nome, cognome, telefono, email, mansioni, tipo contratto
    - Import CSV per chi ha gia una lista (opzionale)
    - Invito dipendenti via WhatsApp/Email per accesso alla loro area
  - **Step 5 - Genera Primo Orario**:
    - CTA: "Genera il tuo primo orario con l'AI"
    - Demo del risultato con possibilita di modificare via drag & drop
    - Completamento onboarding

### Dashboard Principale (Titolare)

- **Dashboard** — `/app/dashboard`
  - **Overview Cards** (Top section):
    - Dipendenti attivi oggi (per locale)
    - Turni scoperti questa settimana (alert rosso se > 0)
    - Ore totali pianificate questa settimana
    - Costo personale stimato settimana corrente
  - **Vista Rapida Settimana** (Centro):
    - Mini-calendario con indicatori per ogni locale (verde = tutto coperto, giallo = quasi coperto, rosso = turni scoperti)
    - Click su un giorno/locale apre direttamente lo scheduler
  - **Notifiche e Alert** (Sidebar o sezione):
    - Richieste cambio turno in attesa di approvazione
    - Segnalazioni malattia recenti
    - Richieste ferie/permessi pendenti
    - Dipendenti senza turni assegnati questa settimana
  - **Azioni Rapide**:
    - "Genera Orario Settimana Prossima" (AI)
    - "Pubblica Orario" (invia notifiche a tutti)
    - "Genera Report Mese" (per commercialista)

### Scheduler (Cuore dell'App)

- **Scheduler** — `/app/schedule`
  - **Toolbar** (Top):
    - Selettore settimana: frecce avanti/indietro + date picker
    - Selettore vista: "Per Locale" / "Per Dipendente" / "Per Ruolo"
    - Filtro locale: dropdown per selezionare un locale specifico o "Tutti"
    - Filtro ruolo: dropdown per filtrare per mansione
    - Pulsante "Genera con AI" (lancia AI scheduling agent)
    - Pulsante "Pubblica Orario" (invia notifiche dipendenti)
    - Stato: "Bozza" / "Pubblicato" / "Modificato dopo pubblicazione"
  - **Vista Per Locale** (Default):
    - Griglia: righe = dipendenti assegnati al locale, colonne = giorni della settimana (Lun-Dom)
    - Ogni cella mostra il turno: orario inizio-fine, ruolo, colore per tipo mansione
    - Header colonne: giorno + fabbisogno (es. "Lunedi - Serve: 2 camerieri, 2 cuochi")
    - Indicatore copertura: barra che mostra quanti ruoli sono coperti vs richiesti
    - Turni scoperti evidenziati in rosso con pulsante "+ Assegna"
  - **Vista Per Dipendente**:
    - Griglia: righe = tutti i dipendenti, colonne = giorni
    - Ogni cella mostra: locale + turno + ruolo
    - Utile per verificare che nessun dipendente sia sovraccaricato
    - Contatore ore settimanali per dipendente nella colonna finale
    - Indicatori: ore contrattuali vs ore assegnate, alert straordinari
  - **Vista Per Ruolo**:
    - Griglia raggruppata per mansione (camerieri, cuochi, lavapiatti, ecc.)
    - Per ogni ruolo: quanti servono vs quanti assegnati per giorno/locale
    - Utile per individuare velocemente carenze di copertura
  - **Drag & Drop Interaction**:
    - Trascinare un turno da una cella a un'altra per spostare dipendente/giorno
    - Trascinare un dipendente dalla lista laterale alla griglia per assegnarlo
    - Resize del turno (trascinare bordi) per modificare orario inizio/fine
    - Al drop: validazione automatica conflitti (Server Action < 2 secondi)
    - Se conflitto: popup con spiegazione + suggerimento AI alternativo
    - Se valido: aggiornamento immediato con animazione di conferma
  - **Sidebar Dipendenti Disponibili** (Pannello laterale):
    - Lista dipendenti filtrabili per mansione e disponibilita
    - Per ogni dipendente: nome, mansioni (badge colorati), ore assegnate/contrattuali
    - Indicatore disponibilita per il giorno selezionato (verde/giallo/rosso)
    - Drag dalla sidebar alla griglia per assegnare rapidamente
    - Filtro: "Mostra solo disponibili", "Mostra solo con mansione X"
  - **AI Scheduling Features**:
    - **Generazione Completa**: Pulsante "Genera con AI" lancia background job (Trigger.dev)
      - Progress bar in tempo reale: "Analisi vincoli..." → "Ottimizzazione turni..." → "Validazione..." → "Completato"
      - Risultato: orario completo pre-compilato, l'utente puo accettare o modificare
      - Opzioni: "Rigenera solo turni scoperti", "Rigenera tutto", "Rigenera solo locale X"
    - **Suggerimenti Live**: Quando l'utente trascina un turno
      - Popup con suggerimenti: "Potresti anche assegnare Mario qui, ha 10 ore libere"
      - Warning: "Attenzione: Luca ha indicato incompatibilita con Marco in questo turno"
      - Validazione: "Anna supererebbe le 40 ore settimanali con questo turno"
    - **Auto-Fill Turni Scoperti**: Pulsante per chiedere all'AI di riempire solo i turni mancanti
  - **Gestione Imprevisti**:
    - Click su un turno assegnato → Menu contestuale:
      - "Segna Malattia" → turno diventa rosso, cerca sostituto automaticamente
      - "Cambio Turno" → apre selezione sostituto con filtro mansione/disponibilita
      - "Elimina Turno" → rimuove assegnazione
      - "Modifica Orario" → cambia inizio/fine
    - "Segna Malattia" workflow:
      - Il turno viene marcato come "scoperto per malattia"
      - L'AI suggerisce i 3 migliori sostituti (per mansione, disponibilita, ore residue)
      - Un click per assegnare il sostituto e inviare notifica WhatsApp/Email
  - **Empty State** (Primo utilizzo senza dati):
    - "Configura i tuoi locali e aggiungi i dipendenti per iniziare"
    - Link diretto all'onboarding wizard

### Gestione Locali

- **Locali** — `/app/locations`
  - **Lista Locali** (Griglia cards):
    - Card per ogni locale: nome, indirizzo, orari apertura, numero dipendenti assegnati
    - Badge stato: "Configurato" / "Incompleto" (manca fabbisogno)
    - Quick stats: dipendenti attivi, turni questa settimana, costo settimanale
    - Azioni: "Modifica", "Vedi Orario", "Elimina"
  - **Pulsante "Aggiungi Locale"**:
    - Form: nome, indirizzo, telefono
    - Orari apertura per giorno (con possibilita giorno chiuso)
    - Differenziazione turni: mattina, pomeriggio, sera (orari personalizzabili)

- **Dettaglio Locale** — `/app/locations/[locationId]`
  - **Info Locale** (Header):
    - Nome, indirizzo, telefono, orari apertura
    - Pulsante "Modifica Info"
  - **Fabbisogno Personale** (Sezione principale):
    - Griglia editabile: righe = ruoli (cameriere, cuoco, lavapiatti, ecc.), colonne = giorni
    - Ogni cella: numero persone richieste per turno mattina/pomeriggio/sera
    - Esempio: Lunedi Sera → Camerieri: 2, Cuochi: 2, Lavapiatti: 1
    - Pulsante "Copia da altro giorno" per velocizzare configurazione
    - Pulsante "Copia da altro locale" per locali simili
  - **Dipendenti Assegnati** (Lista):
    - Dipendenti che hanno questo locale come sede preferita o assegnata
    - Possibilita di aggiungere/rimuovere dipendenti dal locale
  - **Statistiche Locale**:
    - Ore totali settimanali pianificate
    - Costo personale settimanale/mensile
    - Tasso copertura turni (% turni coperti vs richiesti)

### Gestione Dipendenti

- **Dipendenti** — `/app/employees`
  - **Lista Dipendenti** (Tabella con ricerca e filtri):
    - Colonne: Nome, Mansioni (badge colorati), Sede preferita, Tipo contratto, Ore settimanali, Stato
    - Ricerca per nome
    - Filtri: per mansione, per locale, per tipo contratto, per stato (attivo/inattivo)
    - Ordinamento: per nome, ore assegnate, data assunzione
    - Azioni inline: "Modifica", "Vedi Orario", "Disattiva"
  - **Pulsante "Aggiungi Dipendente"**:
    - Form rapido: nome, cognome, telefono, email
    - Selezione mansioni multiple (checkbox): cameriere, cuoco, lavapiatti, barista, cassiere, ecc.
    - Mansioni personalizzabili dal titolare (aggiungere nuovi ruoli)
    - Tipo contratto: full-time, part-time, a chiamata, stagionale
    - Ore contrattuali settimanali
    - Paga oraria (per tipo ore: ordinarie, straordinarie, festive)
    - Sede preferita (dropdown locali)
    - Opzione: "Invia invito al dipendente" (WhatsApp/Email)
  - **Import CSV** (Opzionale):
    - Upload file CSV con lista dipendenti
    - Mapping colonne automatico + anteprima
    - Import batch

- **Dettaglio Dipendente** — `/app/employees/[employeeId]`
  - **Profilo Dipendente** (Header):
    - Nome, foto, contatti, mansioni, contratto, paga oraria
    - Stato: Attivo/Inattivo/In malattia
    - Pulsante "Modifica"
  - **Preferenze e Vincoli**:
    - Sede preferita (selezionabile)
    - Giorni di indisponibilita ricorrenti (es. "mai il martedi")
    - Incompatibilita colleghi: lista colleghi con cui preferisce non lavorare
    - Note speciali (testo libero per il titolare)
  - **Orario Personale** (Calendario):
    - Vista settimanale/mensile dei turni assegnati
    - Totale ore per settimana/mese
    - Distinzione ore ordinarie/straordinarie/festive
  - **Storico**:
    - Ore lavorate per mese (ultimi 6 mesi)
    - Assenze (malattia, ferie, permessi)
    - Turni effettuati per locale

### Gestione Contratti e Ruoli

- **Impostazioni Lavoro** — `/app/settings/work`
  - **Ruoli/Mansioni** (Sezione):
    - Lista ruoli attivi: cameriere, cuoco, lavapiatti, barista, cassiere, ecc.
    - Pulsante "Aggiungi Ruolo": nome, colore badge, icona
    - Modifica/Elimina ruolo esistente
    - Ruoli pre-caricati dal template settoriale (modificabili)
  - **Tipi Contratto** (Sezione):
    - Lista contratti: Full-time, Part-time, A chiamata, Stagionale, ecc.
    - Per ogni contratto: ore settimanali standard, ore massime, giorni riposo minimi
    - Paga oraria default per tipo contratto (sovrascrivibile per singolo dipendente)
    - Regole straordinari: dopo quante ore scatta lo straordinario
  - **Regole Turni** (Sezione):
    - Durata minima/massima turno
    - Pausa obbligatoria tra turni (es. minimo 11 ore)
    - Massimo giorni consecutivi lavorati
    - Regole festivi e domeniche

### Area Dipendente (Mobile-First)

- **Il Mio Orario** — `/app/my-schedule`
  - **Vista Settimanale** (Default, ottimizzata mobile):
    - Lista giorni con turni assegnati
    - Per ogni turno: locale, orario, ruolo, colleghi in turno
    - Settimana corrente evidenziata, navigazione avanti/indietro
    - Pull-to-refresh per aggiornamenti
  - **Vista Mensile** (Calendario):
    - Calendario con indicatori turni per giorno
    - Tap su giorno per vedere dettaglio turni
  - **Riepilogo Ore** (Footer fisso):
    - Ore lavorate questa settimana / questo mese
    - Ore contrattuali vs ore assegnate
    - Ore straordinarie evidenziate

- **Le Mie Preferenze** — `/app/my-preferences`
  - **Disponibilita**:
    - Griglia settimanale: per ogni giorno/fascia indicare disponibile/non disponibile/preferito
    - Giorni fissi di indisponibilita (ricorrenti)
    - Periodi di ferie/permesso (date specifiche)
  - **Sede Preferita**:
    - Selezione locale preferito (o "nessuna preferenza")
    - Locali in cui puo lavorare vs locali esclusi
  - **Incompatibilita Colleghi**:
    - Lista colleghi con cui preferisce non lavorare nello stesso turno
    - Motivo (opzionale, testo libero)

- **Le Mie Richieste** — `/app/my-requests`
  - **Nuova Richiesta**:
    - Tipo: Cambio turno, Permesso, Ferie, Malattia
    - Cambio turno: seleziona turno da scambiare + collega proposto (opzionale)
    - Permesso/Ferie: date + motivo
    - Malattia: data inizio + durata stimata + certificato (upload opzionale)
  - **Storico Richieste**:
    - Lista richieste con stato: In attesa, Approvata, Rifiutata
    - Dettaglio per ogni richiesta

### Portale Commercialista

- **Area Commercialista** — `/app/accountant`
  - **Dashboard Commercialista** (Multi-cliente se piano Commercialista):
    - Lista clienti (attivita) collegati
    - Stato report: "Pronto", "In elaborazione", "Non ancora generato"
    - Notifica badge per nuovi report disponibili
  - **Report Mensile per Cliente** — `/app/accountant/[clientId]/[month]`
    - **Riepilogo Generale**:
      - Periodo di riferimento
      - Totale dipendenti attivi
      - Totale ore lavorate (ordinarie + straordinarie + festive)
      - Costo totale personale stimato
    - **Dettaglio per Dipendente** (Tabella):
      - Nome, Tipo contratto, Paga oraria
      - Ore ordinarie, Ore straordinarie, Ore festive, Ore malattia, Ore ferie/permesso
      - Totale ore, Costo lordo stimato
    - **Dettaglio per Punto Vendita** (Tabella):
      - Locale, Totale ore, Totale costo, Numero dipendenti
    - **Export Options**:
      - Download PDF (report formattato)
      - Download CSV (dati tabellari per import software paghe)
      - Download Excel (report completo con fogli multipli)
      - Formati compatibili: Zucchetti, TeamSystem, Wolters Kluwer (Phase 2)
  - **Impostazioni Commercialista**:
    - Formato report preferito
    - Frequenza notifiche: quando report pronto, reminder mensile
    - Canale notifiche: Email + WhatsApp

### Collegamento Commercialista (Lato Titolare)

- **Impostazioni Commercialista** — `/app/settings/accountant`
  - **Collega Commercialista**:
    - Inserisci email commercialista → invio invito
    - Oppure: genera link di collegamento da inviare via WhatsApp/Email
    - Il commercialista crea account (gratuito se invitato da cliente pagante) o accede se gia registrato
  - **Gestione Report**:
    - Generazione automatica report a fine mese: On/Off
    - Data generazione automatica: giorno del mese (default: 1)
    - Invio automatico notifica al commercialista: On/Off
    - Anteprima report prima dell'invio: On/Off
  - **Dati per Busta Paga**:
    - Metodo conteggio ore: Per shift (orario pianificato) / Per ore effettive (timbratura, Phase 2)
    - Inclusione straordinari automatica: On/Off
    - Note aggiuntive per il commercialista (testo libero mensile)

### Notifiche e Comunicazioni

- **Centro Notifiche** — `/app/notifications`
  - **Lista Notifiche** (Tutte):
    - Tipo: Orario pubblicato, Cambio turno, Richiesta ricevuta, Report pronto, Alert turno scoperto
    - Stato: Letta/Non letta
    - Filtri per tipo e data
  - **Impostazioni Notifiche** — `/app/settings/notifications`
    - Per ogni tipo di evento, selezionare canale: In-app, Email, WhatsApp, Nessuno
    - Orario preferito per notifiche non urgenti (es. "non prima delle 8:00")
    - Lingua notifiche: Italiano (default)

### Profilo e Account

- **Profile** — `/app/profile`
  - **Account Information Card**:
    - Nome attivita, nome utente, email, telefono
    - Logo attivita (upload)
    - Cambio password
    - Elimina account (con conferma)
  - **Billing Management Card**:
    - Piano attuale (dalla Stripe API): Free Trial / Starter / Pro / Business
    - Giorni rimanenti trial (se in Free Trial)
    - Data rinnovo, metodo pagamento
    - "Gestisci Abbonamento" → Stripe Customer Portal
  - **Usage Statistics Card**:
    - Sedi attive: X / Y (limite piano)
    - Dipendenti attivi: X / Y (limite piano)
    - Orari generati con AI questo mese
    - Report inviati al commercialista
  - **Subscription Plans Card**:
    - Starter (9.99 euro/mese): 1 sede, 15 dipendenti, scheduling manuale + drag & drop, report base
    - Pro (24.99 euro/mese): 5 sedi, 50 dipendenti, AI scheduling, portale commercialista, badge: "Piu Popolare"
    - Business (49.99 euro/mese): Illimitato, AI avanzato, analytics, integrazioni
    - Pulsanti upgrade → Stripe Checkout

---

## 👥 Admin Features

### Admin Section (Role-Based Access, Solo Super Admin)

- **Admin Dashboard** — `/admin/dashboard`
  - **System Metrics**:
    - Totale account registrati, account attivi, account trial
    - Totale dipendenti gestiti sulla piattaforma
    - Totale orari generati (oggi/settimana/mese)
    - Revenue mensile ricorrente (MRR)
  - **Usage Charts** (Ultimi 30 giorni):
    - Nuove registrazioni per giorno
    - Orari generati con AI per giorno
    - Conversioni trial → pagante
  - **System Health**:
    - Stato AI scheduling engine
    - Stato invio notifiche (WhatsApp/Email)
    - Coda job Trigger.dev
    - Errori recenti

- **Analytics** — `/admin/analytics`
  - Time range selector (7/30/90 giorni)
  - Revenue vs Costi chart
  - Breakdown costi: AI API, WhatsApp API, infrastruttura, storage
  - Distribuzione utenti per piano
  - Conversion funnel: Signup → Onboarding completo → Primo orario → Pagante
  - Churn rate mensile
  - Metriche per settore (ristoranti vs case di riposo vs retail)

- **Users** — `/admin/users`
  - Ricerca per email/nome attivita
  - Filtri: piano, settore, numero sedi, stato
  - Tabella utenti: Nome attivita, email, piano, sedi, dipendenti, data registrazione
  - Azioni: Visualizza dettaglio, Sospendi, Estendi trial, Modifica piano
  - Dettaglio utente: info account, storico pagamenti, utilizzo, log attivita

---

## 📱 Navigation Structure

### Main Sidebar - Titolare/Owner (Responsive)

- 🏠 **Dashboard** — Panoramica rapida, alert, azioni veloci
- 📅 **Orario** — Scheduler principale con drag & drop e AI
- 🏪 **Locali** — Gestione punti vendita e fabbisogno
- 👥 **Dipendenti** — Anagrafica, mansioni, contratti, preferenze
- 📊 **Report** — Generazione e invio report al commercialista
- ⚙️ **Impostazioni** — Ruoli, contratti, regole turni, commercialista, notifiche
- 👤 **Profilo** — Account, abbonamento, utilizzo

### Main Navigation - Manager di Sede

- 🏠 **Dashboard** — Panoramica del proprio locale
- 📅 **Orario** — Scheduler del proprio locale (modifica limitata)
- 👥 **Dipendenti** — Vista dipendenti del proprio locale
- 🔔 **Richieste** — Approvazione cambi turno e richieste
- 👤 **Profilo** — Account personale

### Main Navigation - Dipendente (Mobile Bottom Tab Bar)

- 📅 **Orario** — I miei turni (vista settimanale/mensile)
- ✏️ **Preferenze** — Disponibilita, sede, incompatibilita
- 📝 **Richieste** — Cambi turno, permessi, ferie
- 👤 **Profilo** — Account personale

### Main Navigation - Commercialista

- 📊 **Report** — Dashboard multi-cliente, report mensili
- ⚙️ **Impostazioni** — Formato preferito, notifiche
- 👤 **Profilo** — Account personale

### Admin Navigation (Super Admin Only)

- 📊 **Admin Dashboard** — Metriche sistema
- 📈 **Analytics** — Revenue, costi, conversioni
- 👥 **Users** — Gestione utenti piattaforma

### Usage Stats Box (Sidebar Footer)

- Sedi: "X / Y sedi attive"
- Dipendenti: "X / Y dipendenti"
- Piano: "Pro" con badge colore
- Barra progresso quota

### Mobile Navigation

- **Titolare/Manager**: Sidebar collassabile + header con logo e avatar
- **Dipendente**: Bottom tab bar (Orario, Preferenze, Richieste, Profilo)
- **Commercialista**: Bottom tab bar (Report, Impostazioni, Profilo)
- Push notifications per tutti i ruoli

---

## 🔧 Next.js App Router Structure

### Layout Groups

```
app/
├── (public)/              # Marketing e legal pages (no auth)
├── (auth)/                # Authentication flow
├── (protected)/           # App principale (tutti i ruoli autenticati)
│   ├── (owner)/           # Pages solo titolare
│   ├── (manager)/         # Pages solo manager
│   ├── (employee)/        # Pages solo dipendente
│   ├── (accountant)/      # Pages solo commercialista
│   └── (shared)/          # Pages condivise tra ruoli
└── (admin)/               # Super admin only
```

### Complete Route Mapping

**🌐 Public Routes (No Auth Required)**

- `/` → Landing page con pricing embedded
- `/privacy` → Privacy policy
- `/terms` → Terms of service
- `/refunds` → Refund policy

**🔐 Auth Routes (Redirect if Authenticated)**

- `/auth/login` → Login
- `/auth/sign-up` → Registrazione
- `/auth/forgot-password` → Reset password
- `/auth/verify-email` → Verifica email
- `/auth/invite/[token]` → Accettazione invito (dipendente/commercialista)

**🛡️ Protected Routes - Titolare/Owner**

- `/app/onboarding` → Setup guidato prima volta
- `/app/dashboard` → Dashboard principale con overview
- `/app/schedule` → Scheduler con drag & drop e AI
- `/app/locations` → Lista locali
- `/app/locations/[locationId]` → Dettaglio e fabbisogno locale
- `/app/employees` → Lista dipendenti
- `/app/employees/[employeeId]` → Dettaglio dipendente
- `/app/reports` → Generazione e gestione report commercialista
- `/app/reports/[reportId]` → Dettaglio e anteprima report
- `/app/settings/work` → Ruoli, contratti, regole turni
- `/app/settings/accountant` → Collegamento e impostazioni commercialista
- `/app/settings/notifications` → Preferenze notifiche
- `/app/notifications` → Centro notifiche
- `/app/profile` → Profilo, abbonamento, utilizzo

**🛡️ Protected Routes - Manager**

- `/app/dashboard` → Dashboard del proprio locale
- `/app/schedule` → Scheduler del proprio locale (permessi limitati)
- `/app/employees` → Dipendenti del proprio locale
- `/app/requests` → Approvazione richieste dipendenti
- `/app/notifications` → Centro notifiche
- `/app/profile` → Profilo personale

**🛡️ Protected Routes - Dipendente**

- `/app/my-schedule` → I miei turni
- `/app/my-preferences` → Disponibilita, sede, incompatibilita
- `/app/my-requests` → Le mie richieste (cambio turno, ferie, malattia)
- `/app/notifications` → Le mie notifiche
- `/app/profile` → Profilo personale

**🛡️ Protected Routes - Commercialista**

- `/app/accountant` → Dashboard multi-cliente
- `/app/accountant/[clientId]/[month]` → Report mensile cliente
- `/app/settings/notifications` → Preferenze notifiche
- `/app/profile` → Profilo personale

**👑 Admin Routes (Super Admin Only)**

- `/admin/dashboard` → System metrics
- `/admin/analytics` → Revenue e cost analytics
- `/admin/users` → User management

**🔧 Backend Architecture**

**API Endpoints (External Communication Only)**

- `/api/webhooks/stripe/route.ts` → Stripe subscription webhooks
- `/api/webhooks/trigger/route.ts` → Trigger.dev job status callbacks
- `/api/webhooks/whatsapp/route.ts` → WhatsApp delivery status callbacks
- `/api/ai/suggest/route.ts` → AI suggerimenti drag & drop (endpoint veloce < 2s)
- `/api/cron/monthly-report/route.ts` → Generazione automatica report mensili
- `/api/invite/[token]/route.ts` → Validazione token invito dipendente/commercialista

**Server Actions (Internal App Functionality)**

- `app/actions/schedule.ts` → CRUD turni, genera AI schedule, pubblica orario, gestisci imprevisti
- `app/actions/locations.ts` → CRUD locali, fabbisogno personale, orari apertura
- `app/actions/employees.ts` → CRUD dipendenti, preferenze, incompatibilita, inviti
- `app/actions/reports.ts` → Genera report, esporta PDF/CSV/Excel, invia a commercialista
- `app/actions/requests.ts` → Crea richiesta, approva/rifiuta, cambio turno
- `app/actions/notifications.ts` → Invia notifiche WhatsApp/Email, segna come letta
- `app/actions/subscription.ts` → Create checkout session, Stripe Portal link
- `app/actions/profile.ts` → Update account, change password, delete account
- `app/actions/onboarding.ts` → Setup wizard steps, import CSV, template settoriale
- `app/actions/admin.ts` → User management, quota adjustments, system metrics

**Lib Queries (Database & Business Logic)**

- `lib/queries/schedule.ts` → Get turni per settimana/locale/dipendente, calcola copertura, conflitti
- `lib/queries/locations.ts` → Get locali, fabbisogno, statistiche
- `lib/queries/employees.ts` → Get dipendenti, disponibilita, ore lavorate, preferenze
- `lib/queries/reports.ts` → Compila report mensile, calcola ore per tipo, costi
- `lib/queries/requests.ts` → Get richieste pendenti, storico
- `lib/queries/usage.ts` → Check quotas (sedi, dipendenti), track usage
- `lib/queries/subscriptions.ts` → Get subscription status from Stripe
- `lib/queries/admin.ts` → System metrics, revenue analytics, conversion funnel
- `lib/queries/ai-scheduling.ts` → Logica AI: vincoli, ottimizzazione, suggerimenti, validazione

**Background Jobs (Trigger.dev)**

- `jobs/generate-schedule.ts` → AI scheduling agent: genera orario settimanale completo (10-30s)
- `jobs/send-notifications.ts` → Invio batch notifiche WhatsApp/Email dopo pubblicazione orario
- `jobs/generate-report.ts` → Compilazione report mensile per commercialista
- `jobs/monthly-report-cron.ts` → Cron job: genera report automatici a fine mese
- `jobs/send-whatsapp.ts` → Invio singolo messaggio WhatsApp via API
- `jobs/import-employees.ts` → Import batch dipendenti da CSV

**Architecture Flow**

- **Internal operations**: Frontend → Server Actions → Lib Queries → Database (Supabase)
- **AI Scheduling**: Frontend → Server Action → Trigger.dev Job → AI Engine → Database → Real-time update UI
- **AI Suggestions**: Frontend (drag event) → API Endpoint → AI Engine → Response < 2s
- **Notifications**: Server Action → Trigger.dev Job → WhatsApp API / Email Service → Delivery webhook
- **Reports**: Server Action → Trigger.dev Job → Query ore/turni → Generate PDF/CSV → Notify commercialista
- **Webhooks**: External Service → API Webhook → Server Action → Lib Queries → Database
- **Cron**: Vercel Cron → API Route → Trigger.dev Job → Report generation → Notification

---

## 💰 Business Model Integration

### Subscription Tiers & Quota Enforcement

**Free Trial (primo mese, 0 euro)**
- Tutte le funzionalita del piano Pro per 30 giorni
- Fino a 5 sedi, 50 dipendenti
- AI scheduling illimitato
- Report commercialista inclusi
- Nessuna carta di credito richiesta
- Dopo 30 giorni: downgrade a Starter o scelta piano

**Starter (9.99 euro/mese)**
- 1 punto vendita
- Fino a 15 dipendenti
- Scheduling manuale con drag & drop
- NO AI scheduling agent (solo manuale)
- Report commercialista base (PDF/CSV)
- Notifiche Email (no WhatsApp)
- Quota enforcement:
  - Blocco aggiunta sedi oltre 1
  - Blocco aggiunta dipendenti oltre 15
  - Nascondi pulsante "Genera con AI"
  - Nascondi WhatsApp notifications

**Pro (24.99 euro/mese)**
- Fino a 5 punti vendita
- Fino a 50 dipendenti
- AI scheduling agent completo (generazione + suggerimenti)
- Portale commercialista dedicato
- Report avanzati (PDF/CSV/Excel)
- Notifiche WhatsApp + Email
- Gestione multi-manager
- Analytics base
- Quota enforcement:
  - Blocco aggiunta sedi oltre 5
  - Blocco aggiunta dipendenti oltre 50

**Business (49.99 euro/mese)**
- Punti vendita illimitati
- Dipendenti illimitati
- AI scheduling avanzato con ottimizzazione costi
- Analytics avanzati e previsioni
- Tutti i formati export (incluso compatibilita software paghe)
- Supporto prioritario
- Template settoriali personalizzabili
- Quota enforcement:
  - Nessun limite su sedi/dipendenti
  - Tutte le feature sbloccate

**Piano Commercialista (19.99 euro/mese)**
- Accesso portale multi-cliente
- Dashboard aggregata tutti i clienti
- Download batch report
- Notifiche automatiche report pronti
- Gratuito se invitato da un cliente pagante (fino a 5 clienti)

### Stripe Integration Architecture

**Subscription Flow**:
1. User si registra → Auto-assign Free Trial 30 giorni (tutte feature Pro)
2. Giorno 25 → Email reminder: "Il tuo trial scade tra 5 giorni"
3. Giorno 30 → Scelta piano obbligatoria o downgrade a Starter limitato
4. User sceglie piano → Stripe Checkout session
5. Pagamento completato → Stripe webhook aggiorna status
6. Rinnovo mensile → Stripe auto-charge
7. Cancellazione → Attivo fino a fine periodo, poi downgrade a Starter

**Database Schema**:
- `organizations` table: info attivita, stripe_customer_id, piano, settore
- `users` table: info utente, ruolo (owner/manager/employee/accountant), organization_id
- `locations` table: punti vendita con orari e fabbisogno
- `employees` table: dipendenti con mansioni, contratti, preferenze
- `schedules` table: orari settimanali con stato (bozza/pubblicato)
- `shifts` table: singoli turni assegnati (dipendente, locale, giorno, orario, ruolo)
- `requests` table: richieste cambio turno, ferie, malattia
- `reports` table: report mensili generati con link file
- `notifications` table: notifiche inviate con stato delivery
- `usage_tracking` table: organization_id, month, ai_generations_count

**Quota Enforcement**:
- Check piano prima di aggiunta sede/dipendente (Server Action)
- Validazione limiti su frontend (nascondere/disabilitare) + backend (bloccare)
- Feature flags per AI scheduling, WhatsApp, analytics avanzati
- Upgrade prompts contestuali quando l'utente raggiunge un limite

---

## 🎯 MVP Functionality Summary

Questo blueprint realizza il core value proposition: **Creare gli orari del personale in pochi minuti con AI, gestire imprevisti con drag & drop, e inviare report automatici al commercialista.**

**Phase 1 (Launch Ready):**

- Universal SaaS foundation (auth, legal, responsive design, GDPR)
- Onboarding wizard con template settoriali
- Gestione multi-sede: locali, orari apertura, fabbisogno personale per giorno/fascia
- Gestione dipendenti: mansioni multiple, contratti, preferenze, incompatibilita
- Scheduler interattivo con 3 viste (locale/dipendente/ruolo) e drag & drop
- AI Scheduling Agent: generazione orario completo + suggerimenti live + auto-fill turni scoperti
- Gestione imprevisti: malattia con suggerimento sostituto, cambio turno rapido
- Area dipendente mobile-first: vista orario, preferenze, richieste
- Report commercialista: generazione PDF/CSV/Excel, portale dedicato
- Notifiche WhatsApp + Email per pubblicazione orario e cambi
- Sistema inviti per dipendenti e commercialisti
- 4 tier subscription con Stripe (Free Trial + Starter + Pro + Business)
- Quota enforcement e usage tracking
- Admin monitoring: metriche, analytics, user management
- Mobile-responsive design con navigation role-based

**Phase 2 (Growth Features):**

- Time Clock digitale (timbratura entrata/uscita con geolocalizzazione)
- Integrazione diretta software paghe (Zucchetti, TeamSystem, Wolters Kluwer)
- Dashboard analytics avanzati con previsioni stagionalita
- Scambio turni peer-to-peer tra dipendenti con approvazione automatica
- AI learning da storico (pattern stagionali, previsione fabbisogno)
- App nativa iOS/Android (attualmente PWA)
- Piano annuale con sconto
- Affiliate/referral program per commercialisti
- Multi-lingua (per catene internazionali)
- Calendario ferie annuale con pianificazione automatica

**Technology Stack:**

- **Frontend**: Next.js 15, React, Tailwind CSS v4, DnD Kit (drag & drop), FullCalendar o custom grid
- **Backend**: Next.js Server Actions, API Routes (webhooks + AI suggestions)
- **Database**: Supabase (PostgreSQL) con Row Level Security per multi-tenant
- **Auth**: Supabase Auth (email/password + OAuth Google) con ruoli custom
- **Storage**: Supabase Storage (report PDF, foto profilo, certificati malattia)
- **Background Jobs**: Trigger.dev (AI scheduling, notifiche batch, report generation)
- **AI Engine**: OpenAI GPT-4 / Claude API per scheduling optimization + constraint solving
- **Payments**: Stripe (Checkout, Customer Portal, Webhooks)
- **Notifications**: WhatsApp Business API (via Twilio o Meta Cloud API) + Resend (email)
- **Real-Time**: Trigger.dev streaming (progress AI) + Supabase Realtime (aggiornamenti schedule)
- **Deployment**: Vercel (frontend + API) + Supabase (database + auth + storage)
- **Cron**: Vercel Cron (report mensili automatici, reminder trial)

**Key Design Decisions:**

- ✅ Multi-role navigation: ogni ruolo vede solo le pagine rilevanti
- ✅ Scheduler come pagina centrale con 3 viste e drag & drop nativo
- ✅ AI agent ibrido: generazione batch (Trigger.dev) + suggerimenti live (API endpoint)
- ✅ Mobile-first per area dipendente (bottom tab bar, touch-optimized)
- ✅ Portale commercialista integrato nell'app (non sistema separato)
- ✅ Inviti via WhatsApp/Email per onboarding dipendenti e commercialisti
- ✅ Template settoriali per ridurre time-to-value dell'onboarding
- ✅ Stripe come single source of truth per abbonamenti
- ✅ Multi-tenant con organization_id per isolamento dati tra attivita
- ✅ Row Level Security Supabase per sicurezza dati dipendenti
- ✅ Notifiche WhatsApp come canale primario (standard nel settore horeca italiano)
- ✅ Report compatibili con formati standard commercialisti italiani
- ✅ No separate billing pages: Stripe Customer Portal gestisce tutto
- ✅ Onboarding wizard per ridurre abbandono post-registrazione

> **Next Step:** Workflow Breakdown: dettagliare i Trigger.dev tasks per AI scheduling, notifiche e report generation

---

**Total Pages: 28+ pages**

- Public: 4 pages (landing con pricing, privacy, terms, refunds)
- Auth: 5 pages (login, sign-up, forgot-password, verify-email, invite acceptance)
- Protected Owner: 12 pages (onboarding, dashboard, schedule, locations, location detail, employees, employee detail, reports, report detail, settings work, settings accountant, settings notifications)
- Protected Manager: 5 pages (dashboard, schedule, employees, requests, notifications) - riutilizzano componenti owner con permessi limitati
- Protected Employee: 4 pages (my-schedule, my-preferences, my-requests, notifications)
- Protected Accountant: 3 pages (accountant dashboard, report detail, settings notifications)
- Shared: 2 pages (profile, notifications center)
- Admin: 3 pages (dashboard, analytics, users)
