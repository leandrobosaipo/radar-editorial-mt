import { AuditEntry } from "@/types/dashboard";
import { formatCuiabaTime, humanizeElapsed } from "@/lib/time";

interface Props {
  entries: AuditEntry[];
}

export function AuditTable({ entries }: Props) {
  if (entries.length === 0) return null;

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
              {entries.map((entry, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="px-4 py-3 font-mono text-xs">{entry.site}</td>
                  <td className="px-4 py-3 font-mono text-xs">{entry.category}</td>
                  <td className="px-4 py-3 font-mono text-xs text-status-amber">
                    {formatCuiabaTime(entry.lastPublication)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {humanizeElapsed(entry.lastPublication)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="rounded bg-status-delay/20 px-2 py-0.5 font-mono text-xs font-bold text-status-delay">
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
