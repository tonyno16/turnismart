"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg border border-red-200 bg-red-50 p-8 dark:border-red-800 dark:bg-red-950/30">
          <AlertTriangle className="size-12 text-red-600 dark:text-red-400" />
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Qualcosa è andato storto
          </h2>
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            Si è verificato un errore. Prova a ricaricare la pagina.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm text-white hover:opacity-90"
          >
            Riprova
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
