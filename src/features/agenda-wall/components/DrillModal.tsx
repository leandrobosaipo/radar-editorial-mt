type Drill = { open: boolean; portal: string; details: string[]; posts: any[] };

type Props = {
  drill: Drill;
  onClose: () => void;
};

export function DrillModal({ drill, onClose }: Props) {
  if (!drill.open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 p-4" onClick={onClose}>
      <div className="mx-auto max-w-2xl rounded-lg border border-slate-700 bg-slate-950 p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{drill.portal}</h3>
          <button className="rounded bg-slate-800 px-2 py-1 text-xs" onClick={onClose}>
            Fechar
          </button>
        </div>
        <div className="space-y-1 text-xs text-slate-300">
          {drill.details.map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>
        <div className="mt-2 max-h-[45vh] space-y-2 overflow-y-auto">
          {drill.posts.map((p, i) => (
            <div key={i} className="rounded border border-slate-800 p-2 text-xs">
              <a className="text-blue-300 hover:underline" href={p.link} target="_blank" rel="noreferrer">
                {p.title}
              </a>
              <div className="mt-1 text-slate-400">
                {p.author} • {p.category} • {p.hour}h
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
