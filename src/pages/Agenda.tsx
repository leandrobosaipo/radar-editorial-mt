import { useMemo, useState } from "react";
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

type DrillPost = { title: string; link: string; author: string; published?: string };
type DrillState = {
  open: boolean;
  portal: string;
  day: string;
  category: string;
  hour: number;
  posts: DrillPost[];
};

function normalizeText(s: string) {
  return (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function categoryKey(name: string) {
  const n = normalizeText(name);
  if (n.includes("meme")) return "memes";
  if (n.includes("vovo")) return "vovo";
  if (n.includes("noticia") || n.includes("noticias") || n.includes("mt noticia")) return "noticia";
  if (n.includes("polit")) return "politica";
  if (n.includes("esport")) return "esporte";
  if (n.includes("rondon")) return "rondonopolis";
  if (n.includes("brasil") && n.includes("mundo")) return "brasil_mundo";
  if (n.includes("entreten")) return "entretenimento";
  if (n.includes("opin")) return "opiniao";
  return n;
}

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

function heatLevelClass(count: number) {
  if (count <= 0) return "bg-red-500/20 text-red-300";
  if (count === 1) return "bg-emerald-500/20 text-emerald-300";
  if (count === 2) return "bg-emerald-500/35 text-emerald-200";
  return "bg-emerald-500/50 text-emerald-100";
}

function probableCause(opts: { hasData: boolean; active: boolean; count: number; hasPostsOutOfHour?: boolean }) {
  if (!opts.active) return "Fora da janela da regra";
  if (!opts.hasData) return "Sem dados do feed para o dia";
  if (opts.count > 0) return "Cobertura OK na janela";
  if (opts.hasPostsOutOfHour) return "Houve post na categoria, mas fora da hora esperada";
  return "Não houve post na categoria dentro da janela";
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

  const [drill, setDrill] = useState<DrillState>({
    open: false,
    portal: "",
    day: "",
    category: "",
    hour: 0,
    posts: [],
  });

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
      const historyPosts = new Map<string, Map<string, Map<number, DrillPost[]>>>();

      if (p.history?.hourly?.length) {
        for (const day of p.history.hourly) {
          const catMap = new Map<string, Map<number, number>>();
          for (const cat of day.categories || []) {
            const hm = new Map<number, number>();
            for (const h of cat.hours || []) hm.set(h.hour, h.count);
            catMap.set(categoryKey(cat.category || ""), hm);
          }
          historyHourly.set(day.date, catMap);
        }
      }

      if (p.history?.meta?.length) {
        for (const day of p.history.meta) {
          const catMap = new Map<string, { count: number; target?: number | null }>();
          for (const cat of day.categories || []) {
            catMap.set(categoryKey(cat.category || ""), { count: cat.count || 0, target: cat.target });
          }
          historyMeta.set(day.date, catMap);
        }
      }

      if (p.history?.posts?.length) {
        for (const day of p.history.posts) {
          const catMap = new Map<string, Map<number, DrillPost[]>>();
          for (const cat of day.categories || []) {
            const hm = new Map<number, DrillPost[]>();
            for (const h of cat.hours || []) hm.set(h.hour, (h.posts || []) as DrillPost[]);
            catMap.set(categoryKey(cat.category || ""), hm);
          }
          historyPosts.set(day.date, catMap);
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
                let count = 0;
                const catKey = categoryKey(r.category);
                const dayPostsForCategory = dayPosts.filter((lp) => categoryKey(lp.category || "") === catKey);
                const dayHistPosts = historyPosts.get(day.key)?.get(catKey)?.get(h) || [];

                if (active && dayHist) {
                  const byCat = dayHist.get(catKey);
                  count = byCat?.get(h) || 0;
                } else if (active) {
                  count = dayPostsForCategory.filter((lp) => inHour(lp.datetime, h)).length;
                }

                return {
                  hour: h,
                  active,
                  count,
                  posted: count > 0,
                  hasPostsOutOfHour: dayPostsForCategory.length > 0,
                  cause: probableCause({
                    hasData: hasAnyDataForDay,
                    active,
                    count,
                    hasPostsOutOfHour: dayPostsForCategory.length > 0,
                  }),
                  drillPosts: dayHistPosts.length ? dayHistPosts : dayPostsForCategory.filter((lp) => inHour(lp.datetime, h)),
                };
              }),
            };
          }),
        }));

      const metaRows = rules.filter((r) => r.kind === "meta").map((r) => {
        const byDay = days.map((day) => {
          const dayPosts = postsByDay.get(day.key) || [];
          const dayMeta = historyMeta.get(day.key);
          const fromHistory = dayMeta?.get(categoryKey(r.category));
          const count = fromHistory
            ? fromHistory.count
            : dayPosts.filter((lp) => categoryKey(lp.category || "") === categoryKey(r.category)).length;
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

      const metaByDayCategory = new Map<string, { count: number; target: number; applies: boolean; hasAnyDataForDay: boolean }>();
      for (const m of metaRows) {
        for (const d of m.byDay) {
          if (!d.applies) continue;
          metaByDayCategory.set(`${d.day.key}::${categoryKey(m.category)}`, {
            count: d.count,
            target: d.target,
            applies: d.applies,
            hasAnyDataForDay: d.hasAnyDataForDay,
          });
        }
      }

      const today = days[0];
      let hourlyExpected = 0;
      let hourlyDone = 0;
      for (const row of hourlyGrid) {
        const dayRow = row.rowsByDay.find((d: any) => d.day.key === today.key);
        for (const cell of dayRow.rows) {
          if (!cell.active) continue;
          hourlyExpected += 1;
          if (cell.count > 0) hourlyDone += 1;
        }
      }

      let metaTarget = 0;
      let metaDone = 0;
      for (const m of metaRows) {
        const d = m.byDay.find((x: any) => x.day.key === today.key);
        if (!d || !d.applies) continue;
        metaTarget += d.target;
        metaDone += Math.min(d.count, d.target);
      }

      const adherence = {
        hourlyExpected,
        hourlyDone,
        hourlyPct: hourlyExpected > 0 ? Math.round((hourlyDone / hourlyExpected) * 100) : null,
        metaTarget,
        metaDone,
        metaPct: metaTarget > 0 ? Math.round((metaDone / metaTarget) * 100) : null,
      };

      return { portal: p, code, hourlyGrid, metaRows, metaByDayCategory, adherence };
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

      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
        <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-300">OK</span>
        <span className="rounded bg-emerald-500/35 px-2 py-0.5 text-emerald-200">OK 2</span>
        <span className="rounded bg-emerald-500/50 px-2 py-0.5 text-emerald-100">OK 3+</span>
        <span className="rounded bg-red-500/20 px-2 py-0.5 text-red-300">PEND</span>
        <span className="rounded bg-slate-500/20 px-2 py-0.5 text-slate-300">SEM DADOS</span>
        <span className="text-slate-400">Heatmap horário: mais posts = verde mais forte</span>
      </div>

      <div className="rounded border border-slate-700/60 bg-slate-900/40 p-2 text-[11px] text-slate-300">
        <span className="font-semibold text-slate-100">Causa provável:</span> sem dados do feed no dia, post fora da hora esperada, ausência de post na janela ou fora da janela da regra.
      </div>

      {view.map(({ portal, code, hourlyGrid, metaRows, metaByDayCategory, adherence }) => (
        <section key={portal.name} className="rounded-lg border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">
              {code} — {portal.name}
            </h2>
            <span className="text-xs text-muted-foreground">Hoje + 6 dias anteriores</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="rounded border border-slate-700/60 bg-slate-900/40 p-2">
              <div className="text-slate-300">Aderência por hora (hoje)</div>
              <div className="mt-1 font-semibold text-white">
                {adherence.hourlyExpected > 0 ? `${adherence.hourlyDone}/${adherence.hourlyExpected} (${adherence.hourlyPct}%)` : "N/A"}
              </div>
            </div>
            <div className="rounded border border-slate-700/60 bg-slate-900/40 p-2">
              <div className="text-slate-300">Aderência por meta (hoje)</div>
              <div className="mt-1 font-semibold text-white">
                {adherence.metaTarget > 0 ? `${adherence.metaDone}/${adherence.metaTarget} (${adherence.metaPct}%)` : "N/A"}
              </div>
            </div>
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
                        const meta = metaByDayCategory.get(`${day.key}::${categoryKey(row.category)}`);
                        const hasActiveHour = dayRow.rows.some((c: any) => c.active);
                        const shouldMergeMeta = !hasActiveHour && !!meta;

                        return (
                          <tr key={`${row.category}-${day.key}`} className="border-t">
                            <td className="py-1 pr-2 font-medium">{row.category}</td>
                            {shouldMergeMeta ? (
                              <td colSpan={15} className="text-center py-1">
                                {!meta.hasAnyDataForDay ? (
                                  <span className="rounded bg-slate-500/20 px-2 py-0.5 text-slate-300">SEM DADOS</span>
                                ) : meta.count >= meta.target ? (
                                  <span className="rounded bg-green-500/20 px-2 py-0.5 text-green-300">{meta.count}/{meta.target}</span>
                                ) : (
                                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-300">{meta.count}/{meta.target}</span>
                                )}
                              </td>
                            ) : (
                              dayRow.rows.map((cell: any) => (
                                <td key={cell.hour} className="text-center">
                                  {!cell.active ? (
                                    <span className="text-slate-500">—</span>
                                  ) : !dayRow.hasAnyDataForDay ? (
                                    <span className="rounded bg-slate-500/20 px-1 text-slate-300">SEM DADOS</span>
                                  ) : cell.posted ? (
                                    <button
                                      type="button"
                                      title={cell.cause}
                                      onClick={() =>
                                        setDrill({
                                          open: true,
                                          portal: `${code} — ${portal.name}`,
                                          day: day.label,
                                          category: row.category,
                                          hour: cell.hour,
                                          posts: (cell.drillPosts || []).map((p: any) => ({
                                            title: p.title,
                                            link: p.link,
                                            author: p.author,
                                            published: p.published || p.datetime,
                                          })),
                                        })
                                      }
                                      className={`rounded px-1 ${heatLevelClass(cell.count)}`}
                                    >
                                      {cell.count > 1 ? `OK ${cell.count}` : "OK"}
                                    </button>
                                  ) : (
                                    <span title={cell.cause} className="rounded bg-red-500/20 px-1 text-red-300">PEND</span>
                                  )}
                                </td>
                              ))
                            )}
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

      {drill.open && (
        <div className="fixed inset-0 z-50 bg-black/60 p-4" onClick={() => setDrill((d) => ({ ...d, open: false }))}>
          <div className="mx-auto max-w-2xl rounded-lg border border-slate-700 bg-slate-950 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Drill-down • {drill.portal}</h3>
              <button className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-200" onClick={() => setDrill((d) => ({ ...d, open: false }))}>Fechar</button>
            </div>
            <p className="mb-2 text-xs text-slate-300">{drill.day} • {drill.category} • {drill.hour}h</p>
            <div className="max-h-[60vh] overflow-y-auto space-y-2">
              {drill.posts.length === 0 ? (
                <p className="text-xs text-slate-400">Sem posts detalhados para esta célula.</p>
              ) : (
                drill.posts.map((p, idx) => (
                  <div key={`${p.link}-${idx}`} className="rounded border border-slate-800 p-2">
                    <a href={p.link} target="_blank" rel="noreferrer" className="text-sm text-blue-300 hover:underline">{p.title}</a>
                    <div className="mt-1 text-xs text-slate-400">{p.author}{p.published ? ` • ${new Date(p.published).toLocaleString("pt-BR", { timeZone: "America/Cuiaba" })}` : ""}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
