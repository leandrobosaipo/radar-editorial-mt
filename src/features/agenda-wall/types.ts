import { PortalData } from "@/types/dashboard";

export type AgendaWallItem = {
  portal: PortalData;
  code: string;
  hourPct: number | null;
  metaPct: number | null;
  overdue: number;
  inProgress: number;
  metaDeficit: number;
  topLate: string[];
  timeline: Array<{ hour: number; count: number }>;
  details: string[];
  samplePosts: any[];
  score: number;
};
