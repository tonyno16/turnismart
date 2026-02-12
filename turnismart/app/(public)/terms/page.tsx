import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termini di servizio",
  description:
    "Termini e condizioni di utilizzo del servizio TurniSmart. Contratto SaaS, responsabilità e uso accettabile.",
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
        Termini di servizio
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Ultimo aggiornamento: febbraio 2025
      </p>

      <div className="prose prose-zinc mt-8 dark:prose-invert">
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            1. Accettazione dei termini
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            L&apos;utilizzo della piattaforma TurniSmart (&quot;Servizio&quot;)
            implica l&apos;accettazione dei presenti Termini di servizio. Se non
            accetti questi termini, non utilizzare il Servizio.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            2. Descrizione del servizio
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            TurniSmart è un servizio SaaS per la gestione degli orari del
            personale: creazione e modifica di turni, gestione multi-sede,
            generazione assistita da intelligenza artificiale, report e
            notifiche. Le funzionalità possono variare in base al piano
            sottoscritto e possono essere aggiornate nel tempo.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            3. Account e responsabilità
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Sei responsabile della veridicità dei dati inseriti e della
            custodia delle credenziali di accesso. Sei responsabile del
            trattamento dei dati dei dipendenti che inserisci nella piattaforma
            in qualità di titolare o responsabile del trattamento, nel rispetto
            del GDPR e della normativa applicabile. TurniSmart agisce come
            fornitore del mezzo e, ove applicabile, come responsabile del
            trattamento secondo le istruzioni del cliente.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            4. Abbonamento e pagamento
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            L&apos;abbonamento è regolato dal piano scelto e dalle condizioni
            di fatturazione indicate al momento della sottoscrizione. I
            pagamenti sono gestiti tramite provider di pagamento sicuro (es.
            Stripe). Il mancato pagamento può comportare sospensione o
            cessazione del Servizio. Le tariffe possono essere modificate con
            preavviso; il proseguimento dell&apos;uso dopo la modifica
            costituisce accettazione.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            5. Uso accettabile
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Ti impegni a utilizzare il Servizio in modo lecito e in conformità
            con questi Termini. È vietato: utilizzare il Servizio per scopi
            illeciti; violare diritti di terzi; tentare di accedere a sistemi o
            dati non autorizzati; sovraccaricare o compromettere
            l&apos;infrastruttura; rivendere o sublicenziare il Servizio senza
            accordo scritto. La violazione può comportare sospensione o
            chiusura dell&apos;account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            6. Proprietà intellettuale e dati
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Il software, il marchio e i materiali di TurniSmart restano di
            proprietà di TurniSmart o dei suoi licenzianti. I dati che inserisci
            restano tuoi; ci concedi le licenze necessarie per erogare il
            Servizio (hosting, backup, elaborazione). In caso di cessazione,
            potrai esportare i tuoi dati secondo le modalità previste.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            7. Limitazione di responsabilità
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Il Servizio è fornito &quot;as is&quot;. Nei limiti consentiti dalla
            legge, TurniSmart non è responsabile per danni indiretti,
            consequenziali, punitivi o per perdita di dati o mancati guadagni.
            La responsabilità complessiva è limitata all&apos;importo pagato
            dall&apos;utente negli ultimi 12 mesi per il Servizio. Non
            escludiamo né limitiamo la responsabilità ove non consentito dalla
            legge.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            8. Risoluzione e recesso
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Puoi chiudere l&apos;account in qualsiasi momento dalla sezione
            account o contattandoci. La risoluzione per inadempienza è regolata
            dalla legge applicabile. In caso di cessazione, il diritto
            d&apos;uso cessa; le disposizioni che per natura sopravvivono
            (es. limitazione di responsabilità, legge applicabile) restano
            valide.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            9. Legge applicabile e foro
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            I presenti Termini sono regolati dalla legge italiana. Per le
            controversie è competente il foro del consumatore o, per utenti
            professionali, il foro di Milano, salvo diversa disposizione
            inderogabile di legge.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            10. Modifiche
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Possiamo modificare questi Termini con preavviso (anche tramite
            comunicazione in-app o email). Il proseguimento dell&apos;uso dopo
            la decorrenza delle modifiche costituisce accettazione. In caso di
            modifiche sostanziali, potremo offrirti il diritto di recedere.
          </p>
        </section>
      </div>
    </article>
  );
}
