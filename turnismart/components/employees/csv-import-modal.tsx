"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { uploadCsvAndCreateImportJob, getImportJobStatus } from "@/app/actions/csv-import";
import { Upload, X } from "lucide-react";

export function CsvImportModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    status: string;
    progress: number;
    totalRows: number;
    result?: { imported?: number; skipped?: number; errors?: Array<{ row: number; reason: string }> };
    error?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setJobId(null);
    setStatus(null);
  }, [open]);

  useEffect(() => {
    if (!jobId || !open) return;
    const interval = setInterval(async () => {
      const s = await getImportJobStatus(jobId);
      if (!s) return;
      setStatus({
        status: s.status,
        progress: s.progress_percentage ?? 0,
        totalRows: s.total_rows ?? 0,
        result: s.result_summary as any,
        error: s.error_message ?? undefined,
      });
      if (s.status === "completed" || s.status === "failed") {
        clearInterval(interval);
        router.refresh();
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [jobId, open, router]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.name.toLowerCase().endsWith(".csv")) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleFile = (file: File) => {
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    startTransition(async () => {
      const result = await uploadCsvAndCreateImportJob(formData);
      if (result.ok) {
        setJobId(result.jobId);
      } else {
        setError(result.error);
      }
    });
  };

  if (!open) return null;

  const isDone = status?.status === "completed" || status?.status === "failed";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Importa CSV dipendenti
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6">
          {!jobId ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="rounded-xl border-2 border-dashed border-zinc-300 p-8 text-center transition dark:border-zinc-600"
            >
              <Upload className="mx-auto size-12 text-zinc-400" />
              <p className="mt-2 font-medium text-zinc-700 dark:text-zinc-300">
                Trascina qui un file CSV o clicca per selezionare
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Colonne supportate: nome, cognome, email, telefono, mansione, contratto, ore_settimanali
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileInput}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={pending}
                className="mt-4 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {pending ? "Caricamento..." : "Scegli file"}
              </button>
            </div>
          ) : (
            <div>
              {status?.status === "pending" && (
                <p className="text-sm text-zinc-500">Avvio import...</p>
              )}
              {(status?.status === "parsing" || status?.status === "creating") && (
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>{status.status === "parsing" ? "Analisi file..." : "Creazione record..."}</span>
                    <span>{status.progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                    <div
                      className="h-full rounded-full bg-[hsl(var(--primary))] transition-all"
                      style={{ width: `${status.progress}%` }}
                    />
                  </div>
                </div>
              )}
              {status?.status === "completed" && status.result && (
                <div className="space-y-2">
                  <p className="font-medium text-green-600 dark:text-green-400">
                    Import completato
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Importati: {status.result.imported ?? 0} · Saltati (duplicati): {status.result.skipped ?? 0}
                    {(status.result.errors?.length ?? 0) > 0 &&
                      ` · Errori: ${status.result.errors!.length}`}
                  </p>
                  {(status.result.errors?.length ?? 0) > 0 && (
                    <div className="max-h-32 overflow-y-auto rounded bg-zinc-100 p-2 text-xs dark:bg-zinc-800">
                      {status.result.errors!.slice(0, 10).map((e, i) => (
                        <div key={i}>
                          Riga {e.row}: {e.reason}
                        </div>
                      ))}
                      {(status.result.errors?.length ?? 0) > 10 && (
                        <div>... altri {(status.result.errors?.length ?? 0) - 10} errori</div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {status?.status === "failed" && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {status.error ?? "Import fallito"}
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          {isDone && (
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-lg border border-zinc-300 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
            >
              Chiudi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
