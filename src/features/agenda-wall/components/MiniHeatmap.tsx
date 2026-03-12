type Props = {
  timeline: Array<{ hour: number; count: number }>;
};

export function MiniHeatmap({ timeline }: Props) {
  return (
    <div className="mt-2 flex items-center gap-1 text-[10px]">
      {timeline.map((t) => (
        <span
          key={t.hour}
          className={`rounded px-1 py-0.5 ${
            t.count === 0
              ? "bg-slate-700 text-slate-300"
              : t.count === 1
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-blue-500/20 text-blue-200"
          }`}
          title={`${t.hour}h: ${t.count}`}
        >
          {t.hour}h
        </span>
      ))}
    </div>
  );
}
