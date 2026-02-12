import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Informativa sulla privacy di TurniSmart. Trattamento dati personali, GDPR, dati dipendenti e data residency UE.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Ultimo aggiornamento: febbraio 2025
      </p>

      <div className="prose prose-zinc mt-8 dark:prose-invert">
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            1. Titolare del trattamento
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Il titolare del trattamento dei dati personali è TurniSmart (in
            seguito &quot;noi&quot;, &quot;nostro&quot;). Per esercitare i tuoi
            diritti puoi contattarci all&apos;indirizzo email indicato nel sito
            o nella sezione Contatti.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            2. Dati che raccogliamo
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Raccogliamo i dati necessari per erogare il servizio di gestione
            orari:
          </p>
          <ul className="mt-2 list-inside list-disc text-zinc-600 dark:text-zinc-400">
            <li>
              <strong>Account e contatto:</strong> email, nome, cognome (e
              eventuale numero di telefono se fornito) per l&apos;account del
              titolare/manager.
            </li>
            <li>
              <strong>Dati aziendali:</strong> nome attività, sedi, orari di
              apertura, fabbisogni di personale.
            </li>
            <li>
              <strong>Dati dipendenti:</strong> nome, cognome, email e/o numero
              di telefono, mansioni, contratti, disponibilità e preferenze
              inseriti dall&apos;utente per la gestione degli orari.
            </li>
            <li>
              <strong>Dati di utilizzo:</strong> log di accesso, azioni
              effettuate sulla piattaforma, per sicurezza e miglioramento del
              servizio.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            3. Base giuridica e finalità
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Trattiamo i dati in base al contratto (esecuzione del servizio
            SaaS), al consenso ove richiesto (es. marketing), e agli obblighi
            di legge. Le finalità sono: erogazione del servizio, fatturazione,
            supporto, sicurezza, miglioramento del prodotto e (solo con consenso)
            comunicazioni commerciali.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            4. Conservazione e data residency
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            I dati sono conservati su infrastrutture situate nell&apos;Unione
            Europea (UE/SEE). Non trasferiamo dati personali in paesi terzi
            senza garanzie adeguate (es. decisioni di adeguatezza o clausole
            contrattuali tipo). I dati sono conservati per il tempo necessario
            alla finalità del trattamento e agli obblighi di legge; in caso di
            cancellazione account, i dati sono eliminati o anonimizzati secondo
            le nostre procedure.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            5. Condivisione con terzi
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Non vendiamo né cediamo i tuoi dati a terzi per scopi di marketing.
            Possiamo condividere dati con: fornitori di servizi (hosting, email,
            pagamenti, notifiche) che agiscono come responsabili del
            trattamento; autorità competenti se richiesto dalla legge.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            6. Diritti (GDPR)
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            In base al Regolamento UE 2016/679 (GDPR) hai diritto ad: accesso,
            rettifica, cancellazione, limitazione del trattamento, portabilità
            dei dati, opposizione e revoca del consenso ove applicabile. Puoi
            presentare reclamo all&apos;autorità di controllo (Garante per la
            protezione dei dati personali – Italia).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            7. Sicurezza
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Adottiamo misure tecniche e organizzative adeguate per proteggere i
            dati da accessi non autorizzati, perdita o alterazione (es.
            crittografia, accessi limitati, monitoraggio).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            8. Modifiche
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Questa informativa può essere aggiornata. La data &quot;Ultimo
            aggiornamento&quot; indica l&apos;ultima revisione. Ti invitiamo a
            consultarla periodicamente.
          </p>
        </section>
      </div>
    </article>
  );
}
