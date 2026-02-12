import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica di rimborso",
  description:
    "Politica di rimborso TurniSmart. Rimborso entro 14 giorni dalla sottoscrizione del piano a pagamento.",
};

export default function RefundPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
        Politica di rimborso
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Ultimo aggiornamento: febbraio 2025
      </p>

      <div className="prose prose-zinc mt-8 dark:prose-invert">
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            1. Diritto di recesso (14 giorni)
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Hai diritto a recedere dal contratto di abbonamento a pagamento
            entro <strong>14 giorni</strong> dalla data di sottoscrizione del
            piano, senza fornire motivazione. In tal caso avrai diritto al
            rimborso integrale dell&apos;importo già versato per il periodo
            coperto da tale pagamento, salvo quanto previsto per i servizi
            già resi (vedi sotto).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            2. Come richiedere il rimborso
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Per esercitare il diritto di recesso e richiedere il rimborso,
            invia una comunicazione inequivocabile (es. email all&apos;indirizzo
            indicato in sito o nell&apos;area account) con l&apos;indicazione
            di voler recedere e, se possibile, il riferimento alla
            fattura/abbonamento. Il termine di 14 giorni si considera rispettato
            se la comunicazione viene inviata prima della scadenza.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            3. Esecuzione del rimborso
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Procederemo al rimborso senza indebito ritardo e in ogni caso
            entro 14 giorni dal momento in cui abbiamo ricevuto la tua
            comunicazione di recesso. Il rimborso sarà effettuato con lo
            stesso mezzo di pagamento utilizzato per la transazione originale,
            salvo accordo diverso (es. bonifico). Non saranno addebitate
            spese per il rimborso.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            4. Servizi già resi
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Se hai richiesto l&apos;inizio dell&apos;esecuzione del servizio
            durante il periodo di recesso (es. hai usato attivamente il piano
            a pagamento), in base alla normativa consumer potremmo trattenere
            un importo proporzionale ai servizi già forniti fino al momento
            del recesso. In assenza di uso significativo nel periodo di
            recesso, il rimborso sarà integrale.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            5. Periodo di prova gratuita
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Durante il periodo di prova gratuita (es. 30 giorni) non sono
            previsti addebiti. Se non desideri continuare, puoi semplicemente
            non sottoscrivere un piano a pagamento o cancellare l&apos;account
            prima della scadenza della prova; in tal caso non è dovuto alcun
            importo e non si applica la richiesta di rimborso.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            6. Contatti
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Per richieste di rimborso o chiarimenti su questa politica,
            contattaci tramite l&apos;indirizzo email indicato nel sito o
            nella sezione Contatti/Supporto dell&apos;applicazione.
          </p>
        </section>
      </div>
    </article>
  );
}
