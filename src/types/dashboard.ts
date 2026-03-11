export interface Post {
  title: string;
  author: string;
  datetime: string;
  link: string;
  category: string;
  portal: string;
}

export interface CategorySummary {
  name: string;
  count: number;
  lastPost: string;
  status: "OK" | "ATRASO";
}

export interface JournalistSummary {
  name: string;
  count: number;
  categories: string[];
}

export interface PortalCheck {
  id: string;
  label: string;
  status: "OK" | "ATRASO";
  detail: string;
}

export interface PortalDataHistoryPostRef { title: string; link: string; author: string; published: string }
export interface PortalDataHistoryCategoryHour { hour: number; count: number; posts?: PortalDataHistoryPostRef[] }
export interface PortalDataHistoryCategoryHourly { category: string; category_key?: string; hours: PortalDataHistoryCategoryHour[] }
export interface PortalDataHistoryDayHourly { date: string; dow: number; is_today: boolean; categories: PortalDataHistoryCategoryHourly[] }
export interface PortalDataHistoryCategoryDaily { category: string; category_key?: string; count: number; target?: number | null; met?: boolean | null }
export interface PortalDataHistoryDayDaily { date: string; dow: number; is_today: boolean; categories: PortalDataHistoryCategoryDaily[] }

export interface EditorialRule {
  category: string;
  category_key?: string;
  kind: "hourly" | "meta" | "ondemand";
  days: number[];
  start: number;
  end: number;
  target?: number;
}

export interface PortalData {
  name: string;
  url: string;
  totalPublications: number;
  status: "OK" | "ATRASO"; // status editorial/compliance (legacy)
  siteStatus?: "OK" | "ATRASO";
  complianceStatus?: "OK" | "ATRASO";
  checks?: PortalCheck[];
  categories: CategorySummary[];
  journalists: JournalistSummary[];
  latestPosts: Post[];
  editorialRules?: EditorialRule[];
  history?: {
    timezone: string;
    range_days: number;
    start: string;
    end: string;
    daily: PortalDataHistoryDayDaily[];
    hourly: PortalDataHistoryDayHourly[];
    posts?: PortalDataHistoryDayHourly[];
    meta: PortalDataHistoryDayDaily[];
  };
}

export interface AuditEntry {
  site: string;
  category: string;
  lastPublication: string;
  elapsed: string;
  status: "ATRASO";
  mode?: "TIME" | "META";
  count?: number;
  target?: number;
  withinWindow?: boolean;
}

export interface DashboardData {
  lastUpdate: string;
  monitoringWindow: string;
  portals: PortalData[];
  audit: AuditEntry[];
}
