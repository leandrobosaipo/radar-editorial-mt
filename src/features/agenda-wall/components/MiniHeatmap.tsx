import { heatmapClass } from "../statusTheme";

type Props = {
  timeline: Array<{ hour: number; count: number; status: "future" | "missed" | "ok" | "above" | "current" }>;
};

export function MiniHeatmap({ timeline }: Props) {
  return (
    <div className="mt-2 flex items-center gap-1 text-[10px]">
      {timeline.map((t) => (
        <span key={t.hour} className={`rounded border px-1 py-0.5 ${heatmapClass(t.status)}`} title={`${t.hour}h: ${t.count}`}>
          {t.hour}h
        </span>
      ))}
    </div>
  );
}
