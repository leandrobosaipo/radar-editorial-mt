import { AgendaWallItem } from "../types";
import { MiniHeatmap } from "./MiniHeatmap";

type Props = {
  item: AgendaWallItem;
  onDetail: (item: AgendaWallItem) => void;
};

export function PortalWallCard({ item, onDetail }: Props) {
  return (
    <article className="rounded-lg border border-slate-700 bg-slate-950/50 p-3">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold">{item.code}</h2>
          <p className="text-[11px] text-slate-400">{item.portal.name}</p>
        </div>
        <span
          className={`rounded px-2 py-0.5 text-xs font-semibold ${
            item.score > 6
              ? "bg-red-500/20 text-red-300"
              : item.score > 0
              ? "bg-amber-500/20 text-amber-300"
              : "bg-emerald-500/20 text-emerald-300"
          }`}
        >
          risco {item.score}
        </span>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded bg-slate-900/60 p-2">
          Hora: <span className="font-semibold">{item.hourPct ?? "N/A"}%</span>
        </div>
        <div className="rounded bg-slate-900/60 p-2">
          Meta: <span className="font-semibold">{item.metaPct ?? "N/A"}%</span>
        </div>
      </div>

      <div className="mt-2 space-y-1 text-xs">
        <div className="text-red-300">⚠ {item.overdue} janelas vencidas</div>
        <div className="text-amber-300">⏳ {item.inProgress} em andamento</div>
        <div className="text-slate-300">Déficit meta: {item.metaDeficit}</div>
      </div>

      <div className="mt-2 text-xs">
        <div className="mb-1 text-slate-400">Responsáveis (top 3)</div>
        <div className="space-y-1">
          {item.topLate.length ? (
            item.topLate.map((t, i) => <div key={i}>{t}</div>)
          ) : (
            <div className="text-emerald-300">✔ Sem categoria crítica</div>
          )}
        </div>
      </div>

      <MiniHeatmap timeline={item.timeline} />

      <button
        className="mt-2 rounded border border-slate-700 bg-slate-900/60 px-2 py-1 text-xs"
        onClick={() => onDetail(item)}
      >
        Ver detalhe
      </button>
    </article>
  );
}
