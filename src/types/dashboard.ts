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

export interface PortalData {
  name: string;
  url: string;
  totalPublications: number;
  status: "OK" | "ATRASO";
  categories: CategorySummary[];
  journalists: JournalistSummary[];
  latestPosts: Post[];
}

export interface AuditEntry {
  site: string;
  category: string;
  lastPublication: string;
  elapsed: string;
  status: "ATRASO";
}

export interface DashboardData {
  lastUpdate: string;
  monitoringWindow: string;
  portals: PortalData[];
  audit: AuditEntry[];
}
