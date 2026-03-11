import { useMemo } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { portalShort } from "@/lib/portal";

type Rule = { category: string; start: number; end: number; kind: "hourly" | "meta" | "ondemand" };

function rulesByPortal(code: string): Rule[] {
  if (code === "PMT") {
    return [
      { category: "Notícia", start: 8, end: 22, kind: "hourly" },
      { category: "Vovô de Olho", start: 8, end: 22, kind: "hourly" },
      { category: "Política", start: 12, end: 22, kind: "hourly" },
      { category: "Esporte", start: 12, end: 22, kind: "hourly" },
      { category: "Memes", start: 0, end: 23, kind: "ondemand" },
    ];
  }
  if (code === "OMT") {
    return [
      { category: "MT Notícias", start: 8, end: 22, kind: "hourly" },
      { category: "Política", start: 12, end: 22, kind: "hourly" },
      { category: "Esporte", start: 12, end: 22, kind: "hourly" },
      { category: "Entretenimento", start: 0, end: 23, kind: "ondemand" },
      { category: "Artigos de opinião", start: 0, end: 23, kind: "ondemand" },
    ];
  }
  if (code === "ROO") {
    return [
      { category: "Rondonópolis", start: 0, end: 23, kind: "meta" },
      { category: "MT Notícias", start: 0, end: 23, kind: "meta" },
      { category: "Brasil e Mundo", start: 0, end: 23, kind: "meta" },
      { category: "Esporte", start: 0, end: 23, kind: "meta" },
      { category: "Política", start: 0, end: 23, kind: "meta" },
    ];
  }
  return [
    { category: "MT Notícias", start: 0, end: 23, kind: "meta" },
    { category: "Brasil e Mundo", start: 0, end: 23, kind: "meta" },
    { category: "Esporte", start: 0, end: 23, kind: "meta" },
    { category: "Política", start: 0, end: 23, kind: "meta" },
  ];
}

function inHour(iso: string, hour: number) {
  const d = new Date(iso);
  const h = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Cuiaba",
      hour: "2-digit",
      hour12: false,
    }).format(d)
  );
  return h === hour;
}

export default function Agenda() {
  const { data, isLoading } = useDashboardData();

  const view = useMemo(() => {
    if (!data) return [] as any[];
    return data.portals.map((p) => {
      const code = portalShort(p.name, p.url);
      const rules = rulesByPortal(code);
      const hours = Array.from({ length: 15 }, (_, i) => i + 8);

      const hourlyGrid = rules
        .filter((r) => r.kind === "hourly")
        .map((r) => ({
          ...r,
          rows: hours.map((h) => {
            const active = h >= r.start && h <= r.end;
            const posted = active
              ? p.latestPosts.some((lp) =>
                  (lp.category || "").toLowerCase().includes(r.category.toLowerCase().split(" ")[0]) && inHour(lp.datetime, h)
                )
              : false;
            return { hour: h, active, posted };
          }),
        }));

      const metaRows = rules.filter((r) => r.kind === "meta").map((r) => {
        const count = p.latestPosts.filter((lp) => (lp.category || "").toLowerCase().includes(r.category.toLowerCase().split(" ")[0])).length;
        const target = 3;
        return { category: r.category, count, target };
      });

      return { portal: p, code, hourlyGrid, metaRows };
    });
  }, [data]);

  if (isLoading) return <div className="p-6">Carregando agenda semanal…</div>;

  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-2xl font-bold">Agenda Semanal de Publicações</h1>
      <p className="text-sm text-muted-foreground">Calendário operacional (Cuiabá). Marcações com base nos posts do dia atual no feed.</p>

      {view.map(({ portal, code, hourlyGrid, metaRows }) => (
        <section key={portal.name} className="rounded-lg border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{code} — {portal.name}</h2>
            <span className="text-xs text-muted-foreground">Regra semanal / status diário</span>
          </div>

          {hourlyGrid.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left pr-2">Categoria</th>
                    {Array.from({ length: 15 }, (_, i) => i + 8).map((h) => (
                      <th key={h} className="px-1">{h}h</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hourlyGrid.map((row: any) => (
                    <tr key={row.category} className="border-t">
                      <td className="py-1 pr-2 font-medium">{row.category}</td>
                      {row.rows.map((cell: any) => (
                        <td key={cell.hour} className="text-center">
                          {!cell.active ? (
                            <span className="text-slate-500">—</span>
                          ) : cell.posted ? (
                            <span className="rounded bg-green-500/20 px-1 text-green-300">OK</span>
                          ) : (
                            <span className="rounded bg-red-500/20 px-1 text-red-300">PEND</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {metaRows.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Metas diárias (hoje)</h3>
              <div className="flex flex-wrap gap-2">
                {metaRows.map((m: any) => (
                  <span
                    key={m.category}
                    className={`rounded px-2 py-1 text-xs ${m.count >= m.target ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}`}
                  >
                    {m.category}: {m.count}/{m.target}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
