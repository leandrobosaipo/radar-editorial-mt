type Props = {
  updatedAt: string;
};

export function WallHeader({ updatedAt }: Props) {
  return (
    <header className="sticky top-0 z-20 rounded-xl border border-slate-700/70 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 px-4 py-3 text-slate-200 shadow-lg backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Radar Editorial MT</p>
          <h1 className="text-base font-semibold">Painel da agenda editorial</h1>
        </div>
        <div className="text-right text-xs">
          <p className="text-slate-400">Última atualização</p>
          <p className="font-semibold text-cyan-300">{updatedAt}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-emerald-300">Tudo em dia</span>
        <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 text-amber-300">Ainda dentro do horário</span>
        <span className="rounded-full border border-rose-500/40 bg-rose-500/15 px-2.5 py-1 text-rose-300">Atrasado</span>
        <span className="rounded-full border border-blue-400/40 bg-blue-500/15 px-2.5 py-1 text-blue-200">Acima do combinado</span>
      </div>
    </header>
  );
}
