import { useMemo } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { portalShort } from "@/lib/portal";

type Rule = { category: string; start: number; end: number; kind: "hourly" | "meta" | "ondemand"; days: number[]; target?: number };

function rulesByPortal(code: string): Rule[] {
  if (code === "PMT") {
    return [
      { category: "Notícia", start: 8, end: 22, kind: "hourly", days: [1,2,3,4,5,6,7] },
      { category: "Vovô de Olho", start: 8, end: 22, kind: "hourly", days: [1,2,3,4,5,6,7] },
      { category: "Política", start: 12, end: 22, kind: "hourly", days: [1,2,3,4,5] },
      { category: "Esporte", start: 12, end: 22, kind: "hourly", days: [1,2,3,4,5] },
      { category: "Política", start: 0, end: 23, kind: "meta", days: [6,7], target: 2 },
      { category: "Esporte", start: 0, end: 23, kind: "meta", days: [6], target: 2 },
      { category: "Esporte", start: 15, end: 22, kind: "meta", days: [7], target: 4 },
      { category: "Memes", start: 0, end: 23, kind: "ondemand", days: [1,2,3,4,5,6,7] },
    ];
  }
  if (code === "OMT") {
    return [
      { category: "MT Notícias", start: 8, end: 22, kind: "hourly", days: [1,2,3,4,5] },
      { category: "Política", start: 12, end: 22, kind: "hourly", days: [1,2,3,4,5] },
      { category: "Esporte", start: 12, end: 22, kind: "hourly", days: [1,2,3,4,5] },
      { category: "MT Notícias", start: 8, end: 20, kind: "hourly", days: [6,7] },
      { category: "Política", start: 0, end: 23, kind: "meta", days: [6,7], target: 2 },
      { category: "Esporte", start: 0, end: 23, kind: "meta", days: [6], target: 2 },
      { category: "Esporte", start: 15, end: 20, kind: "meta", days: [7], target: 4 },
      { category: "Entretenimento", start: 0, end: 23, kind: "ondemand", days: [1,2,3,4,5,6,7] },
      { category: "Artigos de opinião", start: 0, end: 23, kind: "ondemand", days: [1,2,3,4,5,6,7] },
    ];
  }
  if (code === "ROO") {
    return [
      { category: "Rondonópolis", start: 0, end: 23, kind: "meta", days: [1,2,3,4,5,6,7], target: 3 },
      { category: "MT Notícias", start: 0, end: 23, kind: "meta", days: [1,2,3,4,5,6,7], target: 3 },
      { category: "Brasil e Mundo", start: 0, end: 23, kind: "meta", days: [1,2,3,4,5,6,7], target: 3 },
      { category: "Esporte", start: 0, end: 23, kind: "meta", days: [1,2,3,4,5,6,7], target: 3 },
      { category: "Política", start: 0, end: 23, kind: "meta", days: [1,2,3,4,5,6,7], target: 3 },
    ];
  }
  return [
    { category: "MT Notícias", start: 0, end: 23, kind: "meta", days: [1,2,3,4,5,6,7], target: 3 },
    { category: "Brasil e Mundo", start: 0, end: 23, kind: "meta", days: [1,2,3,4,5,6,7], target: 3 },
    { category: "Esporte", start: 0, end: 23, kind: "meta", days: [1,2,3,4,5,6,7], target: 3 },
    { category: "Política", start: 0, end: 23, kind: "meta", days: [1,2,3,4,5,6,7], target: 3 },
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

  const todayDow = useMemo(() => {
    const wd = new Intl.DateTimeFormat("en-US", { timeZone: "America/Cuiaba", weekday: "short" }).format(new Date()).toLowerCase();
    return wd.startsWith("mon") ? 1 : wd.startsWith("tue") ? 2 : wd.startsWith("wed") ? 3 : wd.startsWith("thu") ? 4 : wd.startsWith("fri") ? 5 : wd.startsWith("sat") ? 6 : 7;
  }, []);

  const view = useMemo(() => {
    if (!data) return [] as any[];
    return data.portals.map((p) => {
      const code = portalShort(p.name, p.url);
      const rules = rulesByPortal(code);
      const hours = Array.from({ length: 15 }, (_, i) => i + 8);
      const days = [1, 2, 3, 4, 5, 6, 7];

      const hourlyGrid = rules
        .filter((r) => r.kind === "hourly")
        .map((r) => ({
          ...r,
          rowsByDay: days.map((d) => ({
            day: d,
            rows: hours.map((h) => {
              const active = r.days.includes(d) && h >= r.start && h <= r.end;
              const posted = active
                ? p.latestPosts.some((lp) =>
                    (lp.category || "").toLowerCase().includes(r.category.toLowerCase().split(" ")[0]) && inHour(lp.datetime, h)
                  )
                : false;
              return { hour: h, active, posted };
            }),
          })),
        }));

      const metaRows = rules.filter((r) => r.kind === "meta").map((r) => {
        const count = p.latestPosts.filter((lp) => (lp.category || "").toLowerCase().includes(r.category.toLowerCase().split(" ")[0])).length;
        const target = r.target || 3;
        return { category: r.category, count, target, days: r.days };
      });

      return { portal: p, code, hourlyGrid, metaRows };
    });
  }, [data]);

  if (isLoading) return <div className="p-6">Carregando agenda semanal…</div>;

  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-2xl font-bold">Agenda Semanal de Publicações</h1>
      <p className="text-sm text-muted-foreground">Calendário operacional (Cuiabá). Hoje mostra execução real (OK/PEND); demais dias mostram PLANO.</p>

      {view.map(({ portal, code, hourlyGrid, metaRows }) => (
        <section key={portal.name} className="rounded-lg border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{code} — {portal.name}</h2>
            <span className="text-xs text-muted-foreground">Regra semanal / status diário</span>
          </div>

          {hourlyGrid.length > 0 && (
            <div className="space-y-3">
              {[1,2,3,4,5,6,7].map((day) => {
                const dayName = ["", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"][day];
                const isToday = day === todayDow;
                return (
                  <div key={day} className="overflow-x-auto">
                    <div className="text-xs font-semibold mb-1">{dayName} {isToday ? "• hoje" : "• plano"}</div>
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
                        {hourlyGrid.map((row: any) => {
                          const dayRow = row.rowsByDay.find((d: any) => d.day === day);
                          return (
                            <tr key={`${row.category}-${day}`} className="border-t">
                              <td className="py-1 pr-2 font-medium">{row.category}</td>
                              {dayRow.rows.map((cell: any) => (
                                <td key={cell.hour} className="text-center">
                                  {!cell.active ? (
                                    <span className="text-slate-500">—</span>
                                  ) : !isToday ? (
                                    <span className="rounded bg-blue-500/20 px-1 text-blue-300">PLANO</span>
                                  ) : cell.posted ? (
                                    <span className="rounded bg-green-500/20 px-1 text-green-300">OK</span>
                                  ) : (
                                    <span className="rounded bg-red-500/20 px-1 text-red-300">PEND</span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          )}

          {metaRows.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Metas diárias</h3>
              <div className="flex flex-wrap gap-2">
                {metaRows.map((m: any) => {
                  const appliesToday = m.days.includes(todayDow);
                  return (
                    <span
                      key={`${m.category}-${m.days.join('-')}`}
                      className={`rounded px-2 py-1 text-xs ${!appliesToday ? "bg-blue-500/20 text-blue-300" : m.count >= m.target ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}`}
                    >
                      {m.category} ({m.days.map((d:number)=>["","Seg","Ter","Qua","Qui","Sex","Sáb","Dom"][d]).join('/')}) : {appliesToday ? `${m.count}/${m.target}` : `meta ${m.target}`}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
