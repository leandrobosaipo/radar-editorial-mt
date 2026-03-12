import { ChipState } from "./types";

export const STATUS_THEME = {
  prazo: {
    chip: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
    dot: "bg-emerald-400",
    label: "No prazo",
  },
  andamento: {
    chip: "bg-amber-500/20 text-amber-200 border-amber-500/30",
    dot: "bg-amber-400",
    label: "Andando",
  },
  atrasado: {
    chip: "bg-rose-500/20 text-rose-200 border-rose-500/30",
    dot: "bg-rose-400",
    label: "Atrasado",
  },
  acima: {
    chip: "bg-blue-500/25 text-blue-200 border-blue-500/30",
    dot: "bg-blue-400",
    label: "Acima do combinado",
  },
} as const;

export function chipClass(state: ChipState) {
  return STATUS_THEME[state].chip;
}

export function heatmapClass(count: number) {
  if (count > 1) return STATUS_THEME.acima.chip;
  if (count === 1) return STATUS_THEME.prazo.chip;
  return "bg-slate-700 text-slate-300 border-slate-600/40";
}
