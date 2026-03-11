import { useMemo, useState } from "react";
import Agenda from "./Agenda";
import { useDashboardData } from "@/hooks/useDashboardData";
import { portalShort } from "@/lib/portal";

function categoryKey(name: string) {
  const n = (name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (n.includes("meme")) return "memes";
  if (n.includes("vovo")) return "vovo";
  if (n.includes("noticia") || n.includes("noticias") || n.includes("mt noticia")) return "noticia";
  if (n.includes("polit")) return "politica";
  if (n.includes("esport")) return "esporte";
  if (n.includes("rondon")) return "rondonopolis";
  if (n.includes("brasil") && n.includes("mundo")) return "brasil_mundo";
  return n;
}

function nowCuiabaHour() {
  return Number(
    new Intl.DateTimeFormat("en-US", { timeZone: "America/Cuiaba", hour: "2-digit", hour12: false }).format(
      new Date()
    )
  );
}

function todayKeyCuiaba() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Cuiaba",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

type Drill = { open: boolean; portal: string; details: string[]; posts: any[] };

export default function AgendaWall() {
  const { data, isLoading } = useDashboardData();
  const [drill, setDrill] = useState<Drill>({ open: false, portal: "", details: [], posts: [] });

  const nowHour = useMemo(() => nowCuiabaHour(), []);
  const today = useMemo(() => todayKeyCuiaba(), []);

  const model = useMemo(() => {
    if (!data) return [] as any[];

    return data.portals.map((p) => {
      const code = portalShort(p.name, p.url);
      const rules = p.editorialRules || [];
      const dayHourly = p.history?.hourly?.find((d: any) => d.date === today);
      const dayMeta = p.history?.meta?.find((d: any) => d.date === today);
      const dayPosts = p.history?.posts?.find((d: any) => d.date === today);

      let hourlyExpected = 0;
      let hourlyDone = 0;
      let overdue = 0;
      let inProgress = 0;
      const lateByCategory = new Map<string, number>();

      for (const r of rules.filter((x: any) => x.kind === "hourly")) {
        const cat = categoryKey(r.category);
        const byCat = dayHourly?.categories?.find((c: any) => categoryKey(c.category) === cat);
        const hourMap = new Map<number, number>((byCat?.hours || []).map((h: any) => [h.hour, h.count]));

        for (let h = Math.max(8, r.start); h <= Math.min(22, r.end); h++) {
          hourlyExpected++;
          const c = hourMap.get(h) || 0;
          if (c > 0) hourlyDone++;
          else if (h < nowHour) {
            overdue++;
            lateByCategory.set(r.category, (lateByCategory.get(r.category) || 0) + 1);
          } else if (h === nowHour) {
            inProgress++;
          }
        }
      }

      let metaTarget = 0;
      let metaDone = 0;
      let metaDeficit = 0;
      for (const r of rules.filter((x: any) => x.kind === "meta")) {
        const cat = categoryKey(r.category);
        const m = dayMeta?.categories?.find((c: any) => categoryKey(c.category) === cat);
        const count = m?.count || 0;
        const target = r.target || m?.target || 0;
        metaTarget += target;
        metaDone += Math.min(count, target);
        metaDeficit += Math.max(0, target - count);
      }

      const hourPct = hourlyExpected > 0 ? Math.round((hourlyDone / hourlyExpected) * 100) : null;
      const metaPct = metaTarget > 0 ? Math.round((metaDone / metaTarget) * 100) : null;

      const topLate = Array.from(lateByCategory.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat, n]) => `${cat} ${"⚠".repeat(Math.min(4, n))}`);

      const timeline = Array.from({ length: 6 }, (_, i) => nowHour - (5 - i)).map((h) => {
        let count = 0;
        for (const c of dayHourly?.categories || []) {
          const hm = new Map<number, number>((c.hours || []).map((x: any) => [x.hour, x.count]));
          count += hm.get(h) || 0;
        }
        return { hour: h, count };
      });

      const details = [
        overdue > 0 ? `⚠ ${overdue} janelas vencidas` : "✔ nenhum atraso horário vencido",
        `⏳ ${inProgress} em andamento`,
        metaTarget > 0 ? `Déficit de meta: ${metaDeficit}` : "Sem meta diária hoje",
      ];

      const samplePosts = (dayPosts?.categories || []).flatMap((c: any) =>
        (c.hours || []).flatMap((h: any) => (h.posts || []).map((p: any) => ({ ...p, category: c.category, hour: h.hour })))
      ).slice(0, 8);

      return {
        portal: p,
        code,
        hourPct,
        metaPct,
        overdue,
        inProgress,
        metaDeficit,
        topLate,
        timeline,
        details,
        samplePosts,
        score: overdue * 2 + metaDeficit,
      };
    });
  }, [data, nowHour, today]);

  const sorted = useMemo(() => {
    const order: Record<string, number> = { PMT: 1, OMT: 2, ROO: 3, PNMT: 4, PPMT: 5, AFL: 6 };
    return [...model].sort((a, b) => (order[a.code] || 99) - (order[b.code] || 99));
  }, [model]);

  const updatedAt = useMemo(
    () =>
      new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Cuiaba", dateStyle: "short", timeStyle: "short" }).format(
        new Date(data?.lastUpdate || Date.now())
      ),
    [data?.lastUpdate]
  );

  if (isLoading) return <div className="p-6">Carregando agenda wall…</div>;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="sticky top-0 z-20 rounded border border-slate-700/70 bg-slate-950/90 px-3 py-2 text-[11px] text-slate-300 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>RADAR EDITORIAL MT • Agenda Wall (Comando) • Atualizado: {updatedAt}</span>
          <span>Objetivo: responder em 3s “faltou?” e “quem atrasou?”</span>
        </div>
        <div className="mt-1 flex flex-wrap gap-2">
          <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-300">OK</span>
          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-300">EM ANDAMENTO</span>
          <span className="rounded bg-red-500/20 px-2 py-0.5 text-red-300">VENCIDO</span>
          <span className="rounded bg-blue-500/20 px-2 py-0.5 text-blue-200">ACIMA DA META</span>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {sorted.map((m) => (
          <article key={m.portal.name} className="rounded-lg border border-slate-700 bg-slate-950/50 p-3">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold">{m.code}</h2>
                <p className="text-[11px] text-slate-400">{m.portal.name}</p>
              </div>
              <span className={`rounded px-2 py-0.5 text-xs font-semibold ${m.score > 6 ? "bg-red-500/20 text-red-300" : m.score > 0 ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                risco {m.score}
              </span>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded bg-slate-900/60 p-2">Hora: <span className="font-semibold">{m.hourPct ?? "N/A"}%</span></div>
              <div className="rounded bg-slate-900/60 p-2">Meta: <span className="font-semibold">{m.metaPct ?? "N/A"}%</span></div>
            </div>

            <div className="mt-2 space-y-1 text-xs">
              <div className="text-red-300">⚠ {m.overdue} janelas vencidas</div>
              <div className="text-amber-300">⏳ {m.inProgress} em andamento</div>
              <div className="text-slate-300">Déficit meta: {m.metaDeficit}</div>
            </div>

            <div className="mt-2 text-xs">
              <div className="mb-1 text-slate-400">Responsáveis (top 3)</div>
              <div className="space-y-1">{m.topLate.length ? m.topLate.map((t: string, i: number) => <div key={i}>{t}</div>) : <div className="text-emerald-300">✔ Sem categoria crítica</div>}</div>
            </div>

            <div className="mt-2 flex items-center gap-1 text-[10px]">
              {m.timeline.map((t: any) => (
                <span key={t.hour} className={`rounded px-1 py-0.5 ${t.count === 0 ? "bg-slate-700 text-slate-300" : t.count === 1 ? "bg-emerald-500/20 text-emerald-300" : "bg-blue-500/20 text-blue-200"}`} title={`${t.hour}h: ${t.count}`}>
                  {t.hour}h
                </span>
              ))}
            </div>

            <button
              className="mt-2 rounded border border-slate-700 bg-slate-900/60 px-2 py-1 text-xs"
              onClick={() => setDrill({ open: true, portal: `${m.code} — ${m.portal.name}`, details: m.details, posts: m.samplePosts })}
            >
              Ver detalhe
            </button>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-slate-700 bg-slate-950/30 p-2">
        <div className="mb-2 text-sm font-semibold">Agenda detalhada (análise)</div>
        <Agenda />
      </section>

      {drill.open && (
        <div className="fixed inset-0 z-50 bg-black/60 p-4" onClick={() => setDrill((d) => ({ ...d, open: false }))}>
          <div className="mx-auto max-w-2xl rounded-lg border border-slate-700 bg-slate-950 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">{drill.portal}</h3>
              <button className="rounded bg-slate-800 px-2 py-1 text-xs" onClick={() => setDrill((d) => ({ ...d, open: false }))}>Fechar</button>
            </div>
            <div className="space-y-1 text-xs text-slate-300">
              {drill.details.map((d, i) => <div key={i}>{d}</div>)}
            </div>
            <div className="mt-2 max-h-[45vh] space-y-2 overflow-y-auto">
              {drill.posts.map((p, i) => (
                <div key={i} className="rounded border border-slate-800 p-2 text-xs">
                  <a className="text-blue-300 hover:underline" href={p.link} target="_blank" rel="noreferrer">{p.title}</a>
                  <div className="mt-1 text-slate-400">{p.author} • {p.category} • {p.hour}h</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
