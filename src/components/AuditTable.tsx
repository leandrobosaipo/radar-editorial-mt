import { AuditEntry } from "@/types/dashboard";
import { formatCuiabaTime, humanizeElapsed } from "@/lib/time";
import { portalRank, portalShort } from "@/lib/portal";

interface Props {
  entries: AuditEntry[];
}

export function AuditTable({ entries }: Props) {
  if (entries.length === 0) return null;

  const sortedEntries = [...entries].sort((a, b) => {
    const rankDiff = portalRank(a.site) - portalRank(b.site);
    if (rankDiff !== 0) return rankDiff;
    return new Date(a.lastPublication).getTime() - new Date(b.lastPublication).getTime();
  });

  return (
    <div className="px-4 pb-8 md:px-8">
      <div className="container mx-auto max-w-7xl">
        <h2 className="mb-4 text-lg font-bold">Auditoria de Atrasos</h2>
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-sans text-xs uppercase tracking-wider text-muted-foreground">Site</th>
                <th className="px-4 py-3 text-left font-sans text-xs uppercase tracking-wider text-muted-foreground">Categoria</th>
                <th className="px-4 py-3 text-left font-sans text-xs uppercase tracking-wider text-muted-foreground">Última Publicação</th>
                <th className="px-4 py-3 text-left font-sans text-xs uppercase tracking-wider text-muted-foreground">Tempo Decorrido</th>
                <th className="px-4 py-3 text-right font-sans text-xs uppercase tracking-wider text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map((entry, i) => {
                const isMemes = /meme/i.test(entry.category);
                return (
                  <tr key={i} className="border-b border-border/50">
                    <td className="px-4 py-3 font-mono text-xs" title={entry.site}>{portalShort(entry.site)}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {entry.category}
                      {isMemes && (
                        <span className="ml-2 rounded bg-status-ok/20 px-1.5 py-0.5 text-[10px] font-bold text-status-ok">SOB DEMANDA</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-status-amber">
                      {formatCuiabaTime(entry.lastPublication)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {humanizeElapsed(entry.lastPublication)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`rounded px-2 py-0.5 font-mono text-xs font-bold ${isMemes ? "bg-status-ok/20 text-status-ok" : "bg-status-delay/20 text-status-delay"}`}>
                        {isMemes ? "SOB DEMANDA" : entry.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
