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
  const daysAsc = useMemo(() => [...days].reverse(), [days]);

  const [drill, setDrill] = useState<DrillState>({
    open: false,
    portal: "",
    day: "",
    category: "",
    hour: 0,
    posts: [],
  });
  const [expandedPortalDays, setExpandedPortalDays] = useState<Record<string, boolean>>({});
  const [onlyProblems, setOnlyProblems] = useState(false);
  const [shift, setShift] = useState<"all" | "morning" | "afternoon" | "night">("all");

  const nowHour = useMemo(() => {
    return Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Cuiaba",
        hour: "2-digit",
        hour12: false,
      }).format(new Date())
    );
  }, []);

  const updatedAtLabel = useMemo(() => {
    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Cuiaba",
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(data?.lastUpdate || Date.now()));
  }, [data?.lastUpdate]);

  const visibleHours = useMemo(() => {
    if (shift === "morning") return Array.from({ length: 5 }, (_, i) => i + 8); // 8-12
    if (shift === "afternoon") return Array.from({ length: 6 }, (_, i) => i + 13); // 13-18
    if (shift === "night") return Array.from({ length: 4 }, (_, i) => i + 19); // 19-22
    return Array.from({ length: 15 }, (_, i) => i + 8);
  }, [shift]);

  const view = useMemo(() => {
    if (!data) return [] as any[];

    return data.portals.map((p) => {
      const code = portalShort(p.name, p.url);
      const rules = ((p.editorialRules && p.editorialRules.length > 0) ? p.editorialRules : rulesByPortal(code)) as any[];
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

      const hourlyRules = rules.filter((r) => r.kind === "hourly");
      const hourlyGrouped = Array.from(
        hourlyRules.reduce((acc, r) => {
          const key = categoryKey(r.category);
          if (!acc.has(key)) acc.set(key, [] as any[]);
          acc.get(key)!.push(r);
          return acc;
        }, new Map<string, any[]>()).entries()
      );

      const hourlyGrid = hourlyGrouped.map(([catKey, groupRules]) => ({
          category: groupRules[0].category,
          category_key: catKey,
          rowsByDay: days.map((day) => {
            const dayPosts = postsByDay.get(day.key) || [];
            const dayHist = historyHourly.get(day.key);
            const hasAnyDataForDay = hasHistory ? !!dayHist : dayPosts.length > 0;
            return {
              day,
              hasAnyDataForDay,
              rows: hours.map((h) => {
                const active = groupRules.some((rr: any) => rr.days.includes(day.dow) && h >= rr.start && h <= rr.end);
                let count = 0;
                const catKey = categoryKey(groupRules[0].category);
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
        return { category: r.category, deadlineHour: r.end, byDay };
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

  const riskItems = useMemo(() => {
    const items: Array<{ portal: string; msg: string; score: number }> = [];
    for (const v of view as any[]) {
      const today = days[0];
      let overdue = 0;
      for (const row of v.hourlyGrid || []) {
        const dayRow = row.rowsByDay.find((d: any) => d.day.key === today.key);
        for (const c of dayRow?.rows || []) {
          if (!c.active) continue;
          if (c.count > 0) continue;
          if (c.hour === nowHour) continue; // em andamento
          if (c.hour < nowHour) overdue++;
        }
      }
      let metaGap = 0;
      for (const m of v.metaRows || []) {
        const d = m.byDay.find((x: any) => x.day.key === today.key);
        if (!d || !d.applies) continue;
        metaGap += Math.max(0, (d.target || 0) - (d.count || 0));
      }
      const score = overdue * 2 + metaGap;
      if (score > 0) {
        items.push({
          portal: `${v.code} — ${v.portal.name}`,
          msg: `${overdue} janelas horárias vencidas • déficit de meta ${metaGap}`,
          score,
        });
      }
    }
    return items.sort((a, b) => b.score - a.score).slice(0, 5);
  }, [view, days, nowHour]);

  if (isLoading) return <div className="p-6">Carregando agenda semanal…</div>;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="sticky top-0 z-20 rounded border border-slate-700/70 bg-slate-950/90 px-3 py-2 text-[11px] text-slate-300 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>{SYSTEM_NAME} • {AGENDA_SUBTITLE} • Período: {days[6]?.label} → {days[0]?.label}</span>
          <span>Atualizado: {updatedAtLabel}</span>
        </div>
        <details className="mt-1">
          <summary className="cursor-pointer text-slate-400">Ver legenda, filtros e regras dos indicadores</summary>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="rounded bg-slate-500/20 px-2 py-0.5 text-slate-300">N/I (hora futura)</span>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-300">OK</span>
            <span className="rounded bg-blue-500/30 px-2 py-0.5 text-blue-200">OK 2+</span>
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-300">EM PRAZO</span>
            <span className="rounded bg-red-500/20 px-2 py-0.5 text-red-300">FORA DO PRAZO</span>
            <span className="rounded bg-slate-500/20 px-2 py-0.5 text-slate-300">SEM DADOS</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Regras de leitura: hora futura = neutro; meta concluída = verde; acima da meta = azul; abaixo da meta com janela aberta = laranja; abaixo da meta com janela encerrada = vermelho.</p>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <button onClick={() => setShift("all")} className={`rounded px-2 py-1 border ${shift === "all" ? "bg-slate-700 border-slate-500" : "bg-slate-900/40 border-slate-700"}`}>Dia todo</button>
            <button onClick={() => setShift("morning")} className={`rounded px-2 py-1 border ${shift === "morning" ? "bg-slate-700 border-slate-500" : "bg-slate-900/40 border-slate-700"}`}>Manhã</button>
            <button onClick={() => setShift("afternoon")} className={`rounded px-2 py-1 border ${shift === "afternoon" ? "bg-slate-700 border-slate-500" : "bg-slate-900/40 border-slate-700"}`}>Tarde</button>
            <button onClick={() => setShift("night")} className={`rounded px-2 py-1 border ${shift === "night" ? "bg-slate-700 border-slate-500" : "bg-slate-900/40 border-slate-700"}`}>Noite</button>
            <button onClick={() => setOnlyProblems((v) => !v)} className={`rounded px-2 py-1 border ${onlyProblems ? "bg-amber-500/20 border-amber-500 text-amber-300" : "bg-slate-900/40 border-slate-700"}`}>Só problemas</button>
          </div>

          {riskItems.length > 0 && (
            <div className="mt-2 rounded border border-red-900/40 bg-red-950/20 p-2 text-xs">
              <div className="font-semibold text-red-200 mb-1">Ranking de risco (hoje)</div>
              <div className="text-[11px] text-red-300/90 mb-1">Déficit de meta = quantas publicações faltam para bater a meta diária.</div>
              <ul className="space-y-1 text-red-100">
                {riskItems.map((r, i) => <li key={i}>{i + 1}. {r.portal} — {r.msg}</li>)}
              </ul>
            </div>
          )}
        </details>
      </div>

      {view.map(({ portal, code, hourlyGrid, metaRows, metaByDayCategory, adherence }) => {
        const portalKey = `${code}-${portal.name}`;
        const showAllDays = !!expandedPortalDays[portalKey];
        const showDays = showAllDays ? days : [days[0]];
        const todayFirstMeta = ["ROO", "PPMT", "PNMT", "AFL"].includes(code);
        const metaCols = showAllDays
          ? (todayFirstMeta ? [days[0], ...daysAsc.filter((d) => !d.isToday)] : daysAsc)
          : [days[0]];

        const metaOpenByDefault = !["PMT", "OMT"].includes(code);
        const showMetaSection = showAllDays || metaOpenByDefault;

        return (
        <section key={portal.name} className="rounded-lg border p-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold">{code} — {portal.name}</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{showAllDays ? "Comparando 7 dias" : "Somente hoje"}</span>
              <button
                type="button"
                onClick={() => setExpandedPortalDays((s) => ({ ...s, [portalKey]: !showAllDays }))}
                className="rounded border border-slate-700 bg-slate-900/40 px-2 py-1 text-xs text-slate-200"
              >
                {showAllDays ? "Ocultar outros dias" : "Comparar outros dias"}
              </button>
            </div>
          </div>

          <div className="rounded border border-slate-700/60 bg-slate-900/30 p-2 text-xs text-slate-200">
            Situação do dia • Hora: {adherence.hourlyExpected > 0 ? `${adherence.hourlyPct}%` : "N/A"} • Meta: {adherence.metaTarget > 0 ? `${adherence.metaPct}%` : "N/A"}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {adherence.hourlyExpected > 0 && (
              <div className="rounded border border-slate-700/60 bg-slate-900/40 p-2">
                <div className="text-slate-300">Aderência por hora (hoje)</div>
                <div className="mt-1 font-semibold text-white">{`${adherence.hourlyDone}/${adherence.hourlyExpected} (${adherence.hourlyPct}%)`}</div>
              </div>
            )}
            {adherence.metaTarget > 0 && (
              <div className="rounded border border-slate-700/60 bg-slate-900/40 p-2">
                <div className="text-slate-300">Aderência por meta (hoje)</div>
                <div className="mt-1 font-semibold text-white">{`${adherence.metaDone}/${adherence.metaTarget} (${adherence.metaPct}%)`}</div>
              </div>
            )}
          </div>

          {hourlyGrid.length > 0 && (
            <div className="space-y-3">
              {showDays.map((day) => (
                <div key={day.key} className="overflow-x-auto">
                  <div className="text-xs font-semibold mb-1">
                    {day.label} {day.isToday ? "• hoje" : "• histórico"}
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="text-left pr-2">Categoria</th>
                        {visibleHours.map((h) => (
                          <th key={h} className="px-1">
                            {h}h
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {hourlyGrid.filter((row: any) => {
                        if (!onlyProblems) return true;
                        const dayRow = row.rowsByDay.find((d: any) => d.day.key === day.key);
                        return (dayRow?.rows || []).some((c: any) => c.active && visibleHours.includes(c.hour) && c.count === 0 && c.hour <= nowHour);
                      }).map((row: any) => {
                        const dayRow = row.rowsByDay.find((d: any) => d.day.key === day.key);
                        const meta = metaByDayCategory.get(`${day.key}::${categoryKey(row.category)}`);
                        const hasActiveHour = dayRow.rows.some((c: any) => c.active);
                        const shouldMergeMeta = !hasActiveHour && !!meta;

                        return (
                          <tr key={`${row.category}-${day.key}`} className="border-t">
                            <td className="py-1 pr-2 font-medium">
                              <div>{row.category}</div>
                              {day.isToday && (() => {
                                const activeN = dayRow.rows.filter((c: any) => c.active).length;
                                const doneN = dayRow.rows.filter((c: any) => c.active && c.count > 0).length;
                                const pct = activeN > 0 ? Math.round((doneN / activeN) * 100) : 0;
                                return <div className="text-[10px] text-slate-400">Aderência: {doneN}/{activeN} ({pct}%)</div>;
                              })()}
                            </td>
                            {shouldMergeMeta ? (
                              <td colSpan={visibleHours.length} className="text-center py-1">
                                {!meta.hasAnyDataForDay ? (
                                  <span className="rounded bg-slate-500/20 px-2 py-0.5 text-slate-300">SEM DADOS</span>
                                ) : meta.count >= meta.target ? (
                                  <span className="rounded bg-green-500/20 px-2 py-0.5 text-green-300">{meta.count}/{meta.target}</span>
                                ) : day.isToday ? (
                                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-300">{meta.count}/{meta.target}</span>
                                ) : (
                                  <span className="rounded bg-red-500/20 px-2 py-0.5 text-red-300">{meta.count}/{meta.target}</span>
                                )}
                              </td>
                            ) : (
                              dayRow.rows.filter((cell: any) => visibleHours.includes(cell.hour)).map((cell: any) => (
                                <td key={cell.hour} className="text-center">
                                  {!cell.active ? (
                                    <span className="text-slate-500">—</span>
                                  ) : !dayRow.hasAnyDataForDay ? (
                                    <span className="rounded bg-slate-500/20 px-1 text-slate-300">SEM DADOS</span>
                                  ) : day.isToday && cell.hour > nowHour ? (
                                    <span className="rounded bg-slate-500/20 px-1 text-slate-300">N/I</span>
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
                                      className={`rounded px-1 ${cell.count > 1 ? "bg-blue-500/30 text-blue-200" : "bg-emerald-500/20 text-emerald-300"}`}
                                    >
                                      {cell.count > 1 ? `OK ${cell.count}` : "OK"}
                                    </button>
                                  ) : (
                                    <span
                                      title={cell.cause}
                                      className={`rounded px-1 ${day.isToday && cell.hour === nowHour ? "bg-amber-500/20 text-amber-300" : "bg-red-500/20 text-red-300"}`}
                                    >
                                      {day.isToday && cell.hour === nowHour ? "EM PRAZO" : "FORA PRAZO"}
                                    </span>
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

          {metaRows.length > 0 && showMetaSection && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Metas diárias (histórico)</h3>
              <div className="overflow-x-auto rounded border border-slate-700/60">
                <table className="w-full text-xs">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="text-left p-2 min-w-[140px]">Categoria</th>
                      {metaCols.map((d) => (
                        <th
                          key={d.key}
                          className={`text-center p-2 min-w-[78px] border-l border-slate-800 ${
                            d.isToday ? "bg-indigo-500/20 text-indigo-200" : ""
                          }`}
                        >
                          {d.label} {d.isToday ? "• hoje" : ""}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {metaRows.map((m: any) => {
                      const applied = m.byDay.filter((x: any) => x.applies);
                      const hit = applied.filter((x: any) => x.hasAnyDataForDay && x.count >= x.target).length;
                      return (
                      <tr key={`meta-${m.category}`} className="border-t border-slate-800">
                        <td className="p-2 font-medium">
                          <div>{m.category}</div>
                          <div className="text-[10px] text-slate-400">{hit}/{applied.length} dias dentro da meta</div>
                        </td>
                        {metaCols.map((d) => {
                          const cell = m.byDay.find((x: any) => x.day.key === d.key);
                          if (!cell || !cell.applies) {
                            return <td key={`${m.category}-${d.key}`} className="text-center p-2 border-l border-slate-800 text-slate-500">—</td>;
                          }
                          const deadlineHour = m.deadlineHour ?? 22;
                          const late = d.isToday ? nowHour > deadlineHour : true;
                          const color = !cell.hasAnyDataForDay
                            ? "bg-slate-500/20 text-slate-300"
                            : cell.count >= cell.target
                            ? "bg-green-500/20 text-green-300"
                            : late
                            ? "bg-red-500/20 text-red-300"
                            : "bg-amber-500/20 text-amber-300";
                          return (
                            <td key={`${m.category}-${d.key}`} className="text-center p-2 border-l border-slate-800">
                              <span className={`rounded px-2 py-0.5 ${color}`}>
                                {cell.hasAnyDataForDay ? `${cell.count}/${cell.target}` : "SEM DADOS"}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );})}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      );})}

      {drill.open && (
        <div className="fixed inset-0 z-50 bg-black/60 p-4" onClick={() => setDrill((d) => ({ ...d, open: false }))}>
          <div className="mx-auto max-w-2xl rounded-lg border border-slate-700 bg-slate-950 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Drill-down • {drill.portal}</h3>
              <button className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-200" onClick={() => setDrill((d) => ({ ...d, open: false }))}>Fechar</button>
            </div>
            <p className="mb-2 text-xs text-slate-300">{drill.day} • {drill.category} • {drill.hour}h</p>
            <button
              className="mb-2 rounded bg-slate-800 px-2 py-1 text-xs text-slate-200"
              onClick={() => {
                const txt = `${drill.portal} | ${drill.day} ${drill.hour}h | ${drill.category} | ${drill.posts.length} posts`;
                navigator.clipboard?.writeText(txt);
              }}
            >
              Copiar resumo
            </button>
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
