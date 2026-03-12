import { useEffect, useMemo, useState } from "react";

type Props = {
  intervalMs: number;
  label?: string;
};

export function RefreshProgress({ intervalMs, label = "Próxima atualização" }: Props) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    setElapsedMs(0);
    const t = setInterval(() => {
      setElapsedMs((v) => {
        const next = v + 1000;
        return next >= intervalMs ? 0 : next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [intervalMs]);

  const progress = useMemo(() => Math.min(100, Math.round((elapsedMs / intervalMs) * 100)), [elapsedMs, intervalMs]);
  const remainingSec = Math.max(0, Math.ceil((intervalMs - elapsedMs) / 1000));
  const mm = Math.floor(remainingSec / 60);
  const ss = String(remainingSec % 60).padStart(2, "0");

  return (
    <div className="mt-2">
      <div className="mb-1 flex items-center justify-between text-[10px] text-slate-400">
        <span>{label}</span>
        <span>{mm}:{ss}</span>
      </div>
      <div className="h-1.5 w-full rounded bg-slate-700/70 overflow-hidden">
        <div className="h-full bg-cyan-400/80 transition-all duration-700" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
