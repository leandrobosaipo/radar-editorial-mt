type Props = {
  updatedAt: string;
};

export function WallHeader({ updatedAt }: Props) {
  return (
    <header className="sticky top-0 z-20 rounded border border-slate-700/70 bg-slate-950/90 px-3 py-2 text-[11px] text-slate-300 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>RADAR EDITORIAL MT • Agenda Wall (Comando) • Atualizado: {updatedAt}</span>
        <span>Objetivo: responder em 3s “faltou?” e “quem atrasou?”</span>
      </div>
      <div className="mt-1 flex flex-wrap gap-2">
        <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-300">OK</span>
        <span className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-300">EM PRAZO (hora atual)</span>
        <span className="rounded bg-red-500/20 px-2 py-0.5 text-red-300">VENCIDO</span>
        <span className="rounded bg-blue-500/20 px-2 py-0.5 text-blue-200">ACIMA DA META</span>
      </div>
    </header>
  );
}
