"use client";

import { useState } from "react";
import { CsvImportModal } from "@/components/employees/csv-import-modal";
import { FileDown } from "lucide-react";

export function EmployeesPageClient() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
      >
        <FileDown className="size-4" />
        Import CSV
      </button>
      <CsvImportModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
