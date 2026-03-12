import { PortalData } from "@/types/dashboard";

export type ChipState = "prazo" | "andamento" | "atrasado";

export type AgendaWallItem = {
  portal: PortalData;
  code: string;
  hourPct: number | null;
  metaPct: number | null;
  overdue: number;
  inProgress: number;
  metaDeficit: number;
  metaPending: number;
  topLate: string[];
  timeline: Array<{ hour: number; count: number }>;
  details: string[];
  samplePosts: any[];
  score: number;
  categoryChips: Array<{ label: string; state: ChipState }>;
  journalistChips: Array<{ label: string; state: ChipState }>;
};
