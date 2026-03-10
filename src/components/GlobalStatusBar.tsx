interface Props {
  lastUpdate: string;
}

import { formatCuiabaTime } from "@/lib/time";

export function GlobalStatusBar({ lastUpdate }: Props) {
  return (
    <header className="border-b border-border px-4 py-6 md:px-8">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Radar Editorial MT
        </h1>
        <p className="mt-1 text-sm text-muted-foreground font-sans">
          Monitor de Publicações — Fuso America/Cuiaba
        </p>
        <p className="mt-1 text-xs font-sans italic text-muted-foreground">
          Publicou? Apareceu. Atrasou? Alertou.
        </p>
        <p className="mt-3 text-xs font-mono text-status-amber">
          Última atualização: {formatCuiabaTime(lastUpdate)}
        </p>
      </div>
    </header>
  );
}
