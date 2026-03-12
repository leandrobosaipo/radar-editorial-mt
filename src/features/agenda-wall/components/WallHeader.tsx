import { REFRESH_INTERVAL } from "@/config";
import { RefreshProgress } from "@/components/RefreshProgress";

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

      <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-emerald-300">Tudo em dia</span>
        <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 text-amber-300">Ainda dentro do horário</span>
        <span className="rounded-full border border-rose-500/40 bg-rose-500/15 px-2.5 py-1 text-rose-300">Atrasado</span>
        <span className="rounded-full border border-blue-400/40 bg-blue-500/15 px-2.5 py-1 text-blue-200">Acima do combinado</span>
      </div>

      <RefreshProgress intervalMs={REFRESH_INTERVAL} />
    </header>
  );
}
