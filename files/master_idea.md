## Master Idea Document

### End Goal

"La nostra app aiuta **titolari e manager di attivita commerciali multi-sede** (ristoranti, case di riposo, catene retail) a **creare, gestire e ottimizzare gli orari del personale in pochi minuti** e **inviare automaticamente i report al commercialista per l'elaborazione delle buste paga**, utilizzando un **agente AI di scheduling intelligente** che distribuisce i turni in modo ottimale."

### Specific Problem

I titolari e manager di attivita commerciali con piu punti vendita perdono **5-10 ore a settimana** nella creazione manuale degli orari del personale su fogli Excel o carta. Devono bilanciare manualmente le esigenze di ogni locale (numero di camerieri, cuochi, lavapiatti diverso per giorno e fascia oraria), le preferenze dei dipendenti (locale preferito, incompatibilita con colleghi), i diversi tipi di contratto e le paghe orarie differenti. Quando si verificano malattie, cambi turno o imprevisti, l'intero orario deve essere ricalcolato a mano. Inoltre, la comunicazione dei dati al commercialista per le buste paga avviene tramite email, WhatsApp o fogli cartacei, causando errori, ritardi e costi aggiuntivi stimati in **500-1500 euro/mese** per attivita tra ore perse, errori in busta paga e inefficienze operative.

### All User Types

#### Titolare / Owner (Utente Primario)

- **Chi:** Proprietario di una o piu attivita commerciali (ristoranti, case di riposo, negozi, bar) con 2-20+ punti vendita e 10-200+ dipendenti
- **Frustrazioni:**
  - Ore sprecate ogni settimana a creare orari su Excel o carta
  - Impossibile bilanciare preferenze dipendenti, esigenze locali e vincoli contrattuali contemporaneamente
  - Ogni imprevisto (malattia, cambio turno) richiede ricalcolo manuale dell'intero orario
  - Comunicazione caotica con il commercialista (WhatsApp, email, fogli sparsi)
  - Errori nelle buste paga dovuti a dati imprecisi o incompleti
  - Nessuna visibilita centralizzata su tutti i punti vendita
- **Obiettivi Urgenti:**
  - Creare orari settimanali per tutti i locali in meno di 15 minuti
  - Avere un sistema che suggerisca automaticamente la distribuzione ottimale dei turni
  - Gestire cambi turno e imprevisti con drag & drop in tempo reale
  - Inviare report automatici e strutturati al commercialista ogni mese

#### Manager / Responsabile di Sede

- **Chi:** Responsabile di un singolo punto vendita che gestisce il personale giornaliero
- **Frustrazioni:**
  - Non ha visibilita sulla disponibilita dei dipendenti condivisi tra piu sedi
  - Deve chiamare o mandare messaggi per confermare ogni cambio turno
  - Non riesce a trovare velocemente sostituti in caso di assenza
  - Perde tempo a contare ore manualmente per i report
- **Obiettivi Urgenti:**
  - Visualizzare e modificare l'orario della propria sede in autonomia
  - Ricevere notifiche automatiche su cambi turno e assenze
  - Trovare sostituti disponibili con un click
  - Avere il conteggio ore automatico e sempre aggiornato

#### Dipendente / Staff

- **Chi:** Lavoratore (cameriere, cuoco, lavapiatti, cassiere, operatore, ecc.) che lavora in uno o piu punti vendita
- **Frustrazioni:**
  - Non sa il suo orario fino all'ultimo momento
  - Non puo comunicare facilmente le sue preferenze di orario e sede
  - Non ha modo di segnalare incompatibilita con colleghi
  - Non puo richiedere cambi turno o ferie in modo strutturato
  - Non ha visibilita chiara sulle ore lavorate e la paga attesa
- **Obiettivi Urgenti:**
  - Vedere il proprio orario settimanale/mensile in tempo reale dal telefono
  - Indicare disponibilita, preferenze di sede e giorni di riposo
  - Richiedere cambi turno o permessi direttamente dall'app
  - Verificare le ore lavorate e i turni effettuati

#### Commercialista / Consulente del Lavoro

- **Chi:** Professionista esterno che elabora le buste paga basandosi sui dati di presenza
- **Frustrazioni:**
  - Riceve dati in formati diversi (foto, WhatsApp, Excel, email) da ogni cliente
  - Deve rielaborare manualmente i dati per inserirli nel software paghe
  - Errori e ritardi causati da informazioni incomplete o illeggibili
  - Nessuna standardizzazione tra i diversi clienti
- **Obiettivi Urgenti:**
  - Ricevere un report mensile standardizzato, completo e digitale
  - Avere accesso diretto ai dati tramite un portale dedicato
  - Ridurre il tempo di elaborazione buste paga del 50%+
  - Eliminare errori dovuti a trascrizione manuale

#### Amministratore di Sistema / Super Admin

- **Chi:** Team tecnico o power user che configura e gestisce la piattaforma SaaS
- **Frustrazioni:**
  - Difficolta nel monitorare l'utilizzo e i costi della piattaforma
  - Gestione complessa degli accessi e dei permessi utente
  - Necessita di configurare integrazioni con sistemi esterni
- **Obiettivi Urgenti:**
  - Monitorare lo stato della piattaforma e l'attivita degli utenti
  - Gestire piani di abbonamento e limiti di utilizzo
  - Configurare integrazioni e personalizzazioni per clienti enterprise

### Business Model & Revenue Strategy

- **Modello:** Subscription Tiers (SaaS mensile/annuale) - Mercato: Italia
- **Struttura Prezzi:**
  - **Free (primo mese gratis):** Tutte le funzionalita del piano Pro sbloccate per 30 giorni. Nessuna carta di credito richiesta. Scopo: far provare il prodotto completo e dimostrare valore immediato.
  - **Starter (9.99 euro/mese):** 1 punto vendita, fino a 15 dipendenti, scheduling manuale con drag & drop, report base commercialista (PDF/CSV), notifiche dipendenti.
  - **Pro (24.99 euro/mese):** Fino a 5 punti vendita, 50 dipendenti, AI scheduling agent con ottimizzazione turni, portale commercialista dedicato, gestione multi-manager, analytics base.
  - **Business (49.99 euro/mese):** Punti vendita e dipendenti illimitati, AI scheduling avanzato con ottimizzazione costi, analytics avanzati e previsioni, integrazioni software paghe (Zucchetti, TeamSystem), supporto prioritario, template settoriali personalizzabili.
- **Razionale Revenue:** Un titolare che risparmia 5-10 ore/settimana (valore 150-400 euro/mese in tempo manager) e riduce errori buste paga (500+ euro/anno) puo facilmente giustificare 10-50 euro/mese. Il prezzo accessibile (max 50 euro) favorisce adozione rapida nel mercato italiano PMI, dove la sensibilita al prezzo e alta. Il primo mese gratis elimina la barriera all'ingresso.
- **Revenue aggiuntivo:** Piano Commercialista (19.99 euro/mese) per gestione multi-cliente, creando un loop virale: il commercialista consiglia la piattaforma ai suoi altri clienti per standardizzare i report.

### Core Functionalities by Role (MVP)

- **Titolare / Owner**
  - Creare e gestire piu punti vendita con orari di apertura diversi
  - Definire il fabbisogno di personale per ogni locale, giorno e fascia oraria (es. lunedi sera: 2 camerieri, 2 cuochi, 2 lavapiatti; sabato mattina: 3 camerieri, 2 cuochi)
  - Aggiungere dipendenti con mansioni multiple (es. un dipendente puo fare sia cameriere che lavapiatti)
  - Configurare tipi di contratto diversi con paga oraria differente
  - Definire se il conteggio ore e per shift fissi o ore effettive
  - Lanciare l'AI scheduling agent che genera automaticamente l'orario ottimale
  - Modificare l'orario generato tramite drag & drop intuitivo
  - Gestire imprevisti (malattia, cambio turno, assenze) in tempo reale
  - Generare e inviare report mensili al commercialista con un click
  - Visualizzare dashboard con panoramica su tutti i punti vendita

- **Manager / Responsabile di Sede**
  - Visualizzare e modificare l'orario del proprio punto vendita
  - Segnalare assenze e trovare sostituti disponibili
  - Approvare o rifiutare richieste di cambio turno dei dipendenti
  - Visualizzare conteggio ore e presenze della propria sede

- **Dipendente / Staff**
  - Consultare il proprio orario settimanale/mensile da mobile
  - Impostare preferenze: sede preferita, giorni di riposo, incompatibilita colleghi
  - Richiedere cambi turno, permessi o ferie
  - Visualizzare riepilogo ore lavorate

- **Commercialista**
  - Accedere a un portale dedicato con i report di tutti i clienti collegati
  - Scaricare report mensili standardizzati (PDF, CSV, Excel)
  - Visualizzare riepilogo ore per dipendente, tipo contratto e paga oraria
  - Ricevere notifiche quando un nuovo report e pronto

- **Super Admin**
  - Gestire account utente e permessi
  - Monitorare utilizzo piattaforma e metriche
  - Configurare piani di abbonamento e limiti

### Key User Stories

#### Titolare / Owner

1. **Configurazione Multi-Sede**
   _Come_ titolare,
   _voglio_ aggiungere i miei 4 ristoranti con orari di apertura e fabbisogno personale diversi per ogni giorno,
   _cosi che_ il sistema conosca esattamente le esigenze di ogni locale.

2. **Generazione Orario AI**
   _Come_ titolare,
   _voglio_ premere un pulsante e ottenere l'orario settimanale ottimale generato dall'AI,
   _cosi che_ risparmi ore di pianificazione manuale ogni settimana.

3. **Drag & Drop Orario**
   _Come_ titolare,
   _voglio_ spostare un dipendente da un turno a un altro trascinandolo con il mouse,
   _cosi che_ possa fare aggiustamenti rapidi senza rifare tutto da zero.

4. **Gestione Imprevisto Malattia**
   _Come_ titolare,
   _voglio_ segnare un dipendente come malato e ricevere suggerimenti automatici di sostituti disponibili,
   _cosi che_ il locale non rimanga scoperto.

5. **Invio Report Commercialista**
   _Come_ titolare,
   _voglio_ generare e inviare il report mensile al commercialista con un click,
   _cosi che_ le buste paga siano elaborate senza errori e ritardi.

6. **Gestione Mansioni Multiple**
   _Come_ titolare,
   _voglio_ assegnare piu mansioni a un dipendente (es. cameriere + barista),
   _cosi che_ l'AI possa posizionarlo dove serve di piu.

7. **Configurazione Contratti Diversi**
   _Come_ titolare,
   _voglio_ impostare diversi tipi di contratto con paghe orarie differenti,
   _cosi che_ il conteggio costi e il report per il commercialista siano precisi.

#### Manager / Responsabile di Sede

1. **Vista Orario Sede**
   _Come_ manager,
   _voglio_ vedere l'orario completo della mia sede con tutti i turni e i ruoli coperti,
   _cosi che_ sappia immediatamente se manca qualcuno.

2. **Gestione Sostituto Rapida**
   _Come_ manager,
   _voglio_ cercare un sostituto disponibile filtrando per mansione e disponibilita,
   _cosi che_ possa coprire un turno scoperto in pochi minuti.

3. **Approvazione Cambi Turno**
   _Come_ manager,
   _voglio_ approvare o rifiutare le richieste di cambio turno dei dipendenti,
   _cosi che_ le modifiche siano tracciate e autorizzate.

#### Dipendente / Staff

1. **Consultazione Orario Mobile**
   _Come_ dipendente,
   _voglio_ aprire l'app sul telefono e vedere i miei turni della settimana,
   _cosi che_ sappia sempre dove e quando devo lavorare.

2. **Preferenze e Disponibilita**
   _Come_ dipendente,
   _voglio_ indicare la mia sede preferita, i giorni in cui non posso lavorare e i colleghi con cui preferisco non essere in turno,
   _cosi che_ l'orario rispetti le mie esigenze dove possibile.

3. **Richiesta Cambio Turno**
   _Come_ dipendente,
   _voglio_ richiedere uno scambio di turno con un collega direttamente dall'app,
   _cosi che_ non debba fare telefonate o mandare messaggi informali.

4. **Riepilogo Ore Lavorate**
   _Come_ dipendente,
   _voglio_ vedere il totale delle ore lavorate nel mese,
   _cosi che_ possa verificare che la busta paga sia corretta.

#### Commercialista

1. **Portale Report Dedicato**
   _Come_ commercialista,
   _voglio_ accedere a un portale dove trovo i report mensili di tutti i miei clienti,
   _cosi che_ non debba piu raccogliere dati da fonti diverse.

2. **Download Report Standardizzato**
   _Come_ commercialista,
   _voglio_ scaricare il report in formato CSV/Excel compatibile con il mio software paghe,
   _cosi che_ possa importarlo direttamente senza trascrizione manuale.

3. **Notifica Report Pronto**
   _Come_ commercialista,
   _voglio_ ricevere una notifica email quando un cliente completa il report del mese,
   _cosi che_ possa elaborare le buste paga tempestivamente.

#### System / Background

1. **AI Scheduling Engine** - Quando il titolare richiede la generazione dell'orario, il sistema analizza: fabbisogno di ogni locale per giorno/fascia oraria, mansioni e disponibilita dei dipendenti, preferenze di sede e incompatibilita, vincoli contrattuali (ore massime, riposi obbligatori), storico turni per equita nella distribuzione. Genera l'orario ottimale e lo presenta per approvazione.

2. **Calcolo Automatico Ore** - Ad ogni modifica dell'orario, il sistema ricalcola automaticamente le ore totali per dipendente, distinguendo tra ore ordinarie, straordinarie e festive, in base al tipo di contratto.

3. **Generazione Report Mensile** - A fine mese (o su richiesta), il sistema compila automaticamente il report con: ore lavorate per dipendente, tipo di ore (ordinarie, straordinarie, festive, malattia, ferie, permessi), paga oraria e costo totale per dipendente, riepilogo per punto vendita. Il report viene reso disponibile al commercialista collegato.

4. **Notifiche Push e Email** - Il sistema invia notifiche ai dipendenti quando l'orario viene pubblicato o modificato, ai manager quando ci sono richieste di cambio turno, ai titolari quando ci sono turni scoperti, e ai commercialisti quando i report sono pronti.

5. **Conflitti e Validazione** - Il sistema verifica automaticamente che non ci siano conflitti: stesso dipendente su due turni sovrapposti, superamento ore massime contrattuali, violazione riposi obbligatori, turni assegnati durante giorni di indisponibilita del dipendente.

### Value-Adding Features (Advanced)

- **AI Scheduling Agent con Ottimizzazione Costi:** L'agente AI non solo distribuisce i turni in modo equo, ma ottimizza anche i costi del personale, suggerendo combinazioni che minimizzano straordinari e massimizzano l'uso di contratti part-time. Include anche l'apprendimento dai pattern storici (es. "il sabato sera questo locale ha sempre bisogno di un cameriere extra").
  _Perche rilevante:_ Differenziatore principale dal mercato. Le soluzioni esistenti fanno scheduling statico, non ottimizzazione intelligente.

- **Portale Commercialista Multi-Cliente:** Un'area dedicata dove il commercialista accede ai report di tutti i suoi clienti che usano la piattaforma, con dashboard aggregata e download batch.
  _Perche rilevante:_ Crea un loop virale: il commercialista consiglia la piattaforma ai suoi altri clienti per standardizzare i report. Canale di acquisizione a costo zero.

- **App Mobile Nativa per Dipendenti (PWA):** Progressive Web App ottimizzata per mobile dove i dipendenti consultano orari, impostano disponibilita e richiedono cambi turno.
  _Perche rilevante:_ L'80%+ dei dipendenti accede solo da smartphone. Esperienza mobile nativa aumenta adozione e riduce chiamate/messaggi al manager.

- **Template Settoriali Pre-configurati:** Template pronti per ristoranti, case di riposo, retail, bar, hotel con ruoli, turni tipici e fabbisogni pre-impostati. L'utente seleziona il tipo di attivita e parte con una configurazione gia ottimizzata.
  _Perche rilevante:_ Riduce drasticamente il time-to-value. Un ristoratore puo avere il primo orario generato in 10 minuti.

- **Integrazione Diretta Software Paghe:** Connessione API con i principali software di elaborazione paghe italiani (Zucchetti, TeamSystem, Wolters Kluwer) per import diretto dei dati senza export/import manuale.
  _Perche rilevante:_ Feature enterprise che giustifica il tier piu alto e crea lock-in con i commercialisti.

- **Dashboard Analytics e Previsioni:** Dashboard con KPI come costo del personale per punto vendita, ore straordinarie, tasso di assenteismo, distribuzione equita turni, e previsioni di fabbisogno basate su storico e stagionalita.
  _Perche rilevante:_ Trasforma il tool da operativo a strategico, aumentando il valore percepito e la willingness-to-pay dei titolari.

- **Gestione Scambio Turni Peer-to-Peer:** I dipendenti possono proporre scambi turno direttamente tra loro, con approvazione automatica se i vincoli sono rispettati (stessa mansione, nessun conflitto).
  _Perche rilevante:_ Riduce il carico di lavoro del manager del 30%+ e aumenta la soddisfazione dei dipendenti.

- **Time Clock Digitale:** Possibilita per i dipendenti di timbrare entrata/uscita dall'app (con geolocalizzazione opzionale), cosi che le ore effettive vengano registrate automaticamente e confrontate con quelle pianificate.
  _Perche rilevante:_ Completa il ciclo pianificazione-esecuzione-report, eliminando la necessita di sistemi di timbratura separati.
