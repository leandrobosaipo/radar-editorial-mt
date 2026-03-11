import { useMemo } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { portalShort } from "@/lib/portal";

const SYSTEM_NAME = "RADAR EDITORIAL MT";
const AGENDA_SUBTITLE = "Painel da Agenda";

type Rule = {
  category: string;
  start: number;
  end: number;
  kind: "hourly" | "meta" | "ondemand";
  days: number[];
  target?: number;
};

type DayRef = {
  key: string;
  date: Date;
  dow: number;
  label: string;
  isToday: boolean;
};

function rulesByPortal(code: string): Rule[] {
  if (code === "PMT") {
    return [
      { category: "Notícia", start: 8, end: 22, kind: "hourly", days: [1, 2, 3, 4, 5, 6, 7] },
      { category: "Vovô de Olho", start: 8, end: 22, kind: "hourly", days: [1, 2, 3, 4, 5, 6, 7] },
      { category: "Política", start: 12, end: 22, kind: "hourly", days: [1, 2, 3, 4, 5] },
      { category: "Esporte", start: 12, end: 22, kind: "hourly", days: [1, 2, 3, 4, 5] },
      { category: "Política", start: 0, end: 23, kind: "meta", days: [6, 7], target: 2 },
      { category: "Esporte", start: 0, end: 23, kind: "meta", days: [6], target: 2 },
      { category: "Esporte", start: 15, end: 22, kind: "meta", days: [7], target: 4 },
      { category: "Memes", start: 0, end: 23, kind: "ondemand", days: [1, 2, 3, 4, 5, 6, 7] },
    ];
  }
  if (code === "OMT") {
    return [
      { category: "MT Notícias", start: 8, end: 22, kind: "hourly", days: [1, 2, 3, 4, 5] },
      { category: "Política", start: 12, end: 22, kind: "hourly", days: [1, 2, 3, 4, 5] },
      { category: "Esporte", start: 12, end: 22, kind: "hourly", days: [1, 2, 3, 4, 5] },
      { category: "MT Notícias", start: 8, end: 20, kind: "hourly", days: [6, 7] },
      { category: "Política", start: 0, end: 23, kind: "meta", days: [6, 7], target: 2 },
      { category: "Esporte", start: 0, end: 23, kind: "meta", days: [6], target: 2 },
      { category: "Esporte", start: 15, end: 20, kind: "meta", days: [7], target: 4 },
      { category: "Entretenimento", start: 0, end: 23, kind: "ondemand", days: [1, 2, 3, 4, 5, 6, 7] },
      { category: "Artigos de opinião", start: 0, end: 23, kind: "ondemand", days: [1, 2, 3, 4, 5, 6, 7] },
    ];
  }
  if (code === "ROO") {
    return [
      { category: "Rondonópolis", start: 0, end: 23, kind: "meta", days: [1, 2, 3, 4, 5, 6, 7], target: 3 },
      { category: "MT Notícias", start: 0, end: 23, kind: "meta", days: [1, 2, 3, 4, 5, 6, 7], target: 3 },
      { category: "Brasil e Mundo", start: 0, end: 23, kind: "meta", days: [1, 2, 3, 4, 5, 6, 7], target: 3 },
      { category: "Esporte", start: 0, end: 23, kind: "meta", days: [1, 2, 3, 4, 5, 6, 7], target: 3 },
      { category: "Política", start: 0, end: 23, kind: "meta", days: [1, 2, 3, 4, 5, 6, 7], target: 3 },
    ];
  }
  return [
    { category: "MT Notícias", start: 0, end: 23, kind: "meta", days: [1, 2, 3, 4, 5, 6, 7], target: 3 },
    { category: "Brasil e Mundo", start: 0, end: 23, kind: "meta", days: [1, 2, 3, 4, 5, 6, 7], target: 3 },
    { category: "Esporte", start: 0, end: 23, kind: "meta", days: [1, 2, 3, 4, 5, 6, 7], target: 3 },
    { category: "Política", start: 0, end: 23, kind: "meta", days: [1, 2, 3, 4, 5, 6, 7], target: 3 },
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

function dateKeyCuiaba(iso: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Cuiaba",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function getLast7Days(now = new Date()): DayRef[] {
  const base = new Date(now.toLocaleString("en-US", { timeZone: "America/Cuiaba" }));
  base.setHours(12, 0, 0, 0);

  const list: DayRef[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    const key = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Cuiaba",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);

    const wd = new Intl.DateTimeFormat("en-US", { timeZone: "America/Cuiaba", weekday: "short" })
      .format(d)
      .toLowerCase();
    const dow = wd.startsWith("mon")
      ? 1
      : wd.startsWith("tue")
      ? 2
      : wd.startsWith("wed")
      ? 3
      : wd.startsWith("thu")
      ? 4
      : wd.startsWith("fri")
      ? 5
      : wd.startsWith("sat")
      ? 6
      : 7;

    const label = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Cuiaba",
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    }).format(d);

    list.push({ key, date: d, dow, label, isToday: i === 0 });
  }
  return list;
}

export default function Agenda() {
  const { data, isLoading } = useDashboardData();

  const days = useMemo(() => getLast7Days(), []);

  const updatedAtLabel = useMemo(() => {
    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Cuiaba",
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(data?.lastUpdate || Date.now()));
  }, [data?.lastUpdate]);

  const view = useMemo(() => {
    if (!data) return [] as any[];

    return data.portals.map((p) => {
      const code = portalShort(p.name, p.url);
      const rules = rulesByPortal(code);
      const hours = Array.from({ length: 15 }, (_, i) => i + 8);

      const postsByDay = new Map<string, typeof p.latestPosts>();
      for (const post of p.latestPosts) {
        const key = dateKeyCuiaba(post.datetime);
        const arr = postsByDay.get(key) || [];
        arr.push(post);
        postsByDay.set(key, arr);
      }

      const historyHourly = new Map<string, Map<string, Map<number, number>>>();
      const historyMeta = new Map<string, Map<string, { count: number; target?: number | null }>>();

      if (p.history?.hourly?.length) {
        for (const day of p.history.hourly) {
          const catMap = new Map<string, Map<number, number>>();
          for (const cat of day.categories || []) {
            const hm = new Map<number, number>();
            for (const h of cat.hours || []) hm.set(h.hour, h.count);
            catMap.set((cat.category || "").toLowerCase(), hm);
          }
          historyHourly.set(day.date, catMap);
        }
      }

      if (p.history?.meta?.length) {
        for (const day of p.history.meta) {
          const catMap = new Map<string, { count: number; target?: number | null }>();
          for (const cat of day.categories || []) {
            catMap.set((cat.category || "").toLowerCase(), { count: cat.count || 0, target: cat.target });
          }
          historyMeta.set(day.date, catMap);
        }
      }

      const hasHistory = !!p.history?.hourly?.length;

      const hourlyGrid = rules
        .filter((r) => r.kind === "hourly")
        .map((r) => ({
          ...r,
          rowsByDay: days.map((day) => {
            const dayPosts = postsByDay.get(day.key) || [];
            const dayHist = historyHourly.get(day.key);
            const hasAnyDataForDay = hasHistory ? !!dayHist : dayPosts.length > 0;
            return {
              day,
              hasAnyDataForDay,
              rows: hours.map((h) => {
                const active = r.days.includes(day.dow) && h >= r.start && h <= r.end;
                let posted = false;
                if (active && dayHist) {
                  const byCat = dayHist.get(r.category.toLowerCase());
                  posted = !!byCat && (byCat.get(h) || 0) > 0;
                } else if (active) {
                  posted = dayPosts.some(
                    (lp) =>
                      (lp.category || "").toLowerCase().includes(r.category.toLowerCase().split(" ")[0]) && inHour(lp.datetime, h)
                  );
                }
                return { hour: h, active, posted };
              }),
            };
          }),
        }));

      const metaRows = rules.filter((r) => r.kind === "meta").map((r) => {
        const byDay = days.map((day) => {
          const dayPosts = postsByDay.get(day.key) || [];
          const dayMeta = historyMeta.get(day.key);
          const fromHistory = dayMeta?.get(r.category.toLowerCase());
          const count = fromHistory
            ? fromHistory.count
            : dayPosts.filter((lp) => (lp.category || "").toLowerCase().includes(r.category.toLowerCase().split(" ")[0])).length;
          return {
            day,
            count,
            target: (fromHistory?.target as number | undefined) || r.target || 3,
            applies: r.days.includes(day.dow),
            hasAnyDataForDay: hasHistory ? !!dayMeta : dayPosts.length > 0,
          };
        });
        return { category: r.category, byDay };
      });

      return { portal: p, code, hourlyGrid, metaRows };
    });
  }, [data, days]);

  if (isLoading) return <div className="p-6">Carregando agenda semanal…</div>;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="rounded border border-slate-700/70 bg-slate-950/70 px-3 py-2 text-[11px] text-slate-300">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>
            {SYSTEM_NAME} • {AGENDA_SUBTITLE} • Período: {days[6]?.label} → {days[0]?.label}
          </span>
          <span>Atualizado: {updatedAtLabel}</span>
        </div>
      </div>

      {view.map(({ portal, code, hourlyGrid, metaRows }) => (
        <section key={portal.name} className="rounded-lg border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">
              {code} — {portal.name}
            </h2>
            <span className="text-xs text-muted-foreground">Hoje + 6 dias anteriores</span>
          </div>

          {hourlyGrid.length > 0 && (
            <div className="space-y-3">
              {days.map((day) => (
                <div key={day.key} className="overflow-x-auto">
                  <div className="text-xs font-semibold mb-1">
                    {day.label} {day.isToday ? "• hoje" : "• histórico"}
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="text-left pr-2">Categoria</th>
                        {Array.from({ length: 15 }, (_, i) => i + 8).map((h) => (
                          <th key={h} className="px-1">
                            {h}h
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {hourlyGrid.map((row: any) => {
                        const dayRow = row.rowsByDay.find((d: any) => d.day.key === day.key);
                        return (
                          <tr key={`${row.category}-${day.key}`} className="border-t">
                            <td className="py-1 pr-2 font-medium">{row.category}</td>
                            {dayRow.rows.map((cell: any) => (
                              <td key={cell.hour} className="text-center">
                                {!cell.active ? (
                                  <span className="text-slate-500">—</span>
                                ) : !dayRow.hasAnyDataForDay ? (
                                  <span className="rounded bg-slate-500/20 px-1 text-slate-300">SEM DADOS</span>
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
              ))}
            </div>
          )}

          {metaRows.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Metas diárias (histórico)</h3>
              <div className="flex flex-wrap gap-2">
                {metaRows.flatMap((m: any) =>
                  m.byDay
                    .filter((d: any) => d.applies)
                    .map((d: any) => {
                      const color = !d.hasAnyDataForDay
                        ? "bg-slate-500/20 text-slate-300"
                        : d.count >= d.target
                        ? "bg-green-500/20 text-green-300"
                        : "bg-red-500/20 text-red-300";

                      return (
                        <span key={`${m.category}-${d.day.key}`} className={`rounded px-2 py-1 text-xs ${color}`}>
                          {m.category} • {d.day.label} : {d.hasAnyDataForDay ? `${d.count}/${d.target}` : "SEM DADOS"}
                        </span>
                      );
                    })
                )}
              </div>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
