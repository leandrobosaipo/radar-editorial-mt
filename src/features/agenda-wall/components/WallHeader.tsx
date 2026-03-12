import { REFRESH_INTERVAL } from "@/config";
import { RefreshProgress } from "@/components/RefreshProgress";
import { STATUS_THEME } from "../statusTheme";

type Props = {
  updatedAt: string;
};

export function WallHeader({ updatedAt }: Props) {
  return (
    <header className="sticky top-0 z-20 rounded-xl border border-slate-700/70 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 px-3 py-2 text-slate-200 shadow-lg backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[9px] uppercase tracking-[0.16em] text-slate-400">Radar Editorial MT</p>
          <h1 className="text-sm font-semibold">Painel da agenda editorial</h1>
        </div>
        <div className="text-right text-[11px]">
          <p className="text-slate-400">Atualizado</p>
          <p className="font-semibold text-cyan-300">{updatedAt}</p>
        </div>
      </div>

      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
        <details>
          <summary className="cursor-pointer">Legenda de cores</summary>
          <div className="mt-1 flex flex-wrap gap-1.5 text-[10px]">
            <span className={`rounded-full border px-2 py-0.5 ${STATUS_THEME.prazo.chip}`}>{STATUS_THEME.prazo.label}</span>
            <span className={`rounded-full border px-2 py-0.5 ${STATUS_THEME.andamento.chip}`}>{STATUS_THEME.andamento.label}</span>
            <span className={`rounded-full border px-2 py-0.5 ${STATUS_THEME.atrasado.chip}`}>{STATUS_THEME.atrasado.label}</span>
            <span className={`rounded-full border px-2 py-0.5 ${STATUS_THEME.acima.chip}`}>{STATUS_THEME.acima.label}</span>
          </div>
        </details>
      </div>

      <RefreshProgress intervalMs={REFRESH_INTERVAL} />
    </header>
  );
}
