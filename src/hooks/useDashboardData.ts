import { useQuery } from "@tanstack/react-query";
import { DashboardData, PortalData, CategorySummary, AuditEntry } from "@/types/dashboard";
import { DATA_URL, REFRESH_INTERVAL, DELAY_THRESHOLD_MINUTES } from "@/config";
import { MOCK_DATA } from "@/data/mockData";

type MonitorPost = {
  title: string;
  link: string;
  author: string;
  author_id?: number;
  published: string;
  categories: string[];
  category_ids?: number[];
};

type MonitorPayload = {
  generated_at: string;
  window: { start: string; end: string };
  sites: Record<string, MonitorPost[]>;
};

function minutesSince(iso: string): number {
  const now = Date.now();
  const then = new Date(iso).getTime();
  return Math.max(0, Math.floor((now - then) / 60000));
}

function toStatus(iso: string): "OK" | "ATRASO" {
  return minutesSince(iso) > DELAY_THRESHOLD_MINUTES ? "ATRASO" : "OK";
}

function normalizeMonitorPayload(raw: MonitorPayload): DashboardData {
  const portals: PortalData[] = Object.entries(raw.sites || {}).map(([siteKey, posts]) => {
    const safePosts = [...(posts || [])].sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());

    const catMap = new Map<string, { count: number; lastPost: string }>();
    const journalistMap = new Map<string, { count: number; categories: Set<string> }>();

    for (const p of safePosts) {
      for (const c of p.categories || []) {
        const prev = catMap.get(c);
        if (!prev) catMap.set(c, { count: 1, lastPost: p.published });
        else {
          prev.count += 1;
          if (new Date(p.published) > new Date(prev.lastPost)) prev.lastPost = p.published;
          catMap.set(c, prev);
        }
      }

      const j = journalistMap.get(p.author) || { count: 0, categories: new Set<string>() };
      j.count += 1;
      (p.categories || []).forEach((c) => j.categories.add(c));
      journalistMap.set(p.author, j);
    }

    const categories: CategorySummary[] = Array.from(catMap.entries())
      .map(([name, v]) => ({
        name,
        count: v.count,
        lastPost: v.lastPost,
        status: toStatus(v.lastPost),
      }))
      .sort((a, b) => b.count - a.count);

    const journalists = Array.from(journalistMap.entries())
      .map(([name, v]) => ({ name, count: v.count, categories: Array.from(v.categories) }))
      .sort((a, b) => b.count - a.count);

    const latestPosts = safePosts.slice(0, 8).map((p) => ({
      title: p.title,
      author: p.author,
      datetime: p.published,
      link: p.link,
      category: (p.categories && p.categories[0]) || "Sem categoria",
      portal: siteKey,
    }));

    const hasDelay = categories.some((c) => c.status === "ATRASO");

    return {
      name: siteKey,
      url: "",
      totalPublications: safePosts.length,
      status: hasDelay ? "ATRASO" : "OK",
      categories,
      journalists,
      latestPosts,
    };
  });

  const audit: AuditEntry[] = portals.flatMap((portal) =>
    portal.categories
      .filter((c) => c.status === "ATRASO")
      .map((c) => ({
        site: portal.name,
        category: c.name,
        lastPublication: c.lastPost,
        elapsed: `${minutesSince(c.lastPost)} min`,
        status: "ATRASO" as const,
      }))
  );

  return {
    lastUpdate: raw.generated_at || new Date().toISOString(),
    monitoringWindow: `${raw.window?.start || ""} -> ${raw.window?.end || ""}`,
    portals,
    audit,
  };
}

async function fetchDashboardData(): Promise<DashboardData> {
  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to fetch");
    const raw = await response.json();

    if (raw?.portals && raw?.audit) return raw as DashboardData;
    if (raw?.sites && raw?.generated_at) return normalizeMonitorPayload(raw as MonitorPayload);

    throw new Error("Formato de JSON não reconhecido");
  } catch {
    console.warn("Using mock data — JSON endpoint unavailable");
    return MOCK_DATA;
  }
}

export function useDashboardData() {
  return useQuery<DashboardData>({
    queryKey: ["dashboard-data"],
    queryFn: fetchDashboardData,
    refetchInterval: REFRESH_INTERVAL,
    retry: 2,
  });
}
