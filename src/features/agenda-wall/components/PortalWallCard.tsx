import { AgendaWallItem } from "../types";
import { MiniHeatmap } from "./MiniHeatmap";

type Props = {
  item: AgendaWallItem;
  onDetail: (item: AgendaWallItem) => void;
};

export function PortalWallCard({ item, onDetail }: Props) {
  const riskClass =
    item.score > 6
      ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
      : item.score > 0
      ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
      : "border-emerald-500/40 bg-emerald-500/10 text-emerald-200";
  const riskLabel = item.score > 6 ? "Alto" : item.score > 0 ? "Médio" : "Baixo";


  const stateClass = (state: "prazo" | "andamento" | "atrasado") =>
    state === "atrasado"
      ? "bg-rose-500/20 text-rose-200 border-rose-500/30"
      : state === "andamento"
      ? "bg-amber-500/20 text-amber-200 border-amber-500/30"
      : "bg-emerald-500/20 text-emerald-200 border-emerald-500/30";

  return (
    <article className="rounded-xl border border-slate-700/80 bg-slate-900/65 p-3 shadow-[0_0_0_1px_rgba(15,23,42,0.4)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white">{item.code}</h2>
          <p className="text-xs text-slate-400">{item.portal.name}</p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${riskClass}`}>
          Atenção {riskLabel} ({item.score})
        </span>
      </div>

      <div className={`mt-2 grid gap-2 ${item.hourPct !== null ? "grid-cols-2" : "grid-cols-1"}`}>
        {item.hourPct !== null ? (
          <div className="rounded-lg border border-cyan-500/20 bg-slate-950/60 p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Meta por hora cumprida</p>
            <p className="mt-1 text-xl font-bold text-cyan-300">{item.hourPct}%</p>
          </div>
        ) : null}
        <div className="rounded-lg border border-blue-500/20 bg-slate-950/60 p-2.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-400">Meta diária cumprida</p>
          <p className="mt-1 text-xl font-bold text-blue-300">{item.metaPct ?? "—"}%</p>
        </div>
      </div>

      <div className={`mt-3 grid gap-2 text-[11px] ${item.hourPct !== null ? "grid-cols-3" : "grid-cols-1"}`}>
        {item.hourPct !== null ? (
          <>
            <div className="rounded-md border border-rose-500/20 bg-rose-500/10 p-2 text-center text-rose-200">
              <p className="text-[10px] text-rose-300/80">Horas em atraso</p>
              <p className="text-base font-bold">{item.overdue}</p>
            </div>
            <div className="rounded-md border border-amber-500/20 bg-amber-500/10 p-2 text-center text-amber-200">
              <p className="text-[10px] text-amber-300/80">Hora atual</p>
              <p className="text-base font-bold">{item.inProgress}</p>
            </div>
          </>
        ) : null}
        <div className="rounded-md border border-slate-500/30 bg-slate-800/60 p-2 text-center text-slate-200">
          <p className="text-[10px] text-slate-400">Faltando no dia (após prazo)</p>
          <p className="text-base font-bold">{item.metaDeficit}</p>
          {item.metaDeficit === 0 && item.metaPending > 0 ? (
            <p className="text-[10px] text-amber-300">Em andamento: {item.metaPending}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-slate-700/60 bg-slate-950/50 p-2.5 text-xs">
        <p className="mb-1 text-[10px] uppercase tracking-wider text-slate-400">Categorias (visão rápida)</p>
        <div className="flex flex-wrap gap-1.5">
          {item.categoryChips.map((c, i) => (
            <span key={`${c.label}-${i}`} className={`rounded border px-1.5 py-0.5 text-[10px] ${stateClass(c.state)}`}>
              {c.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-2 rounded-lg border border-slate-700/60 bg-slate-950/50 p-2.5 text-xs">
        <p className="mb-1 text-[10px] uppercase tracking-wider text-slate-400">Jornalistas (top 3)</p>
        <div className="flex flex-wrap gap-1.5">
          {item.journalistChips.map((j, i) => (
            <span key={`${j.label}-${i}`} className={`rounded border px-1.5 py-0.5 text-[10px] ${stateClass(j.state)}`}>
              {j.label}
            </span>
          ))}
        </div>
      </div>

      <MiniHeatmap timeline={item.timeline} />

      <button
        className="mt-3 w-full rounded-lg border border-slate-600 bg-slate-800/70 px-2 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-700/80"
        onClick={() => onDetail(item)}
      >
        Ver detalhe do portal
      </button>
    </article>
  );
}
