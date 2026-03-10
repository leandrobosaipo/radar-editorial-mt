import { useQuery } from "@tanstack/react-query";
import { DashboardData, PortalData, CategorySummary, AuditEntry } from "@/types/dashboard";
import { DATA_URL, REFRESH_INTERVAL, DELAY_THRESHOLD_MINUTES, SITE_FEEDS } from "@/config";
import { MOCK_DATA } from "@/data/mockData";

type SiteFeed = {
  site: { name: string; url: string; timezone?: string };
  generated_at: string;
  window: { start: string; end: string };
  totals: { posts: number; categories: number; journalists: number };
  categories: Record<string, { count: number; last_post: string }>;
  journalists: Record<string, { count: number; categories: Record<string, number> }>;
  audit: Array<{
    category: string;
    last_publication: string;
    elapsed_minutes: number;
    elapsed_human: string;
    status: "OK" | "ATRASO";
  }>;
  latest_posts: Array<{
    title: string;
    link: string;
    author: string;
    author_id: number;
    published: string;
    categories: string[];
  }>;
};

type MonitorPayload = {
  generated_at: string;
  window: { start: string; end: string };
  sites: Record<string, any[]>;
};

function minutesSince(iso: string): number {
  const now = Date.now();
  const then = new Date(iso).getTime();
  return Math.max(0, Math.floor((now - then) / 60000));
}

function normalizeFromSiteFeeds(feeds: SiteFeed[]): DashboardData {
  const portals: PortalData[] = feeds.map((feed) => {
    const categories: CategorySummary[] = Object.entries(feed.categories || {})
      .map(([name, meta]) => ({
        name,
        count: meta.count,
        lastPost: meta.last_post,
        status: minutesSince(meta.last_post) <= DELAY_THRESHOLD_MINUTES ? "OK" : "ATRASO",
      }))
      .sort((a, b) => b.count - a.count);

    const journalists = Object.entries(feed.journalists || {})
      .map(([name, meta]) => ({
        name,
        count: meta.count,
        categories: Object.entries(meta.categories || {})
          .sort((a, b) => b[1] - a[1])
          .map(([c]) => c),
      }))
      .sort((a, b) => b.count - a.count);

    const latestPosts = (feed.latest_posts || []).slice(0, 8).map((p) => ({
      title: p.title,
      author: p.author,
      datetime: p.published,
      link: p.link,
      category: (p.categories && p.categories[0]) || "Sem categoria",
      portal: feed.site?.name || feed.site?.url || "site",
    }));

    return {
      name: feed.site?.name || "Portal",
      url: feed.site?.url || "",
      totalPublications: feed.totals?.posts || 0,
      status: categories.some((c) => c.status === "ATRASO") ? "ATRASO" : "OK",
      categories,
      journalists,
      latestPosts,
    };
  });

  const audit: AuditEntry[] = feeds.flatMap((feed) =>
    (feed.audit || [])
      .filter((a) => a.status === "ATRASO")
      .map((a) => ({
        site: feed.site?.name || feed.site?.url || "site",
        category: a.category,
        lastPublication: a.last_publication,
        elapsed: a.elapsed_human || `${a.elapsed_minutes} min`,
        status: "ATRASO" as const,
      }))
  );

  const lastUpdate = feeds
    .map((f) => f.generated_at)
    .sort()
    .reverse()[0] || new Date().toISOString();

  return {
    lastUpdate,
    monitoringWindow: "Feeds em tempo real por portal",
    portals,
    audit,
  };
}

function normalizeLegacyPayload(raw: MonitorPayload): DashboardData {
  const portals: PortalData[] = Object.entries(raw.sites || {}).map(([siteKey, posts]) => {
    const safePosts = [...(posts || [])].sort((a: any, b: any) => new Date(b.published).getTime() - new Date(a.published).getTime());

    const catMap = new Map<string, { count: number; lastPost: string }>();
    const journalistMap = new Map<string, { count: number; categories: Set<string> }>();

    for (const p of safePosts as any[]) {
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
      (p.categories || []).forEach((c: string) => j.categories.add(c));
      journalistMap.set(p.author, j);
    }

    const categories: CategorySummary[] = Array.from(catMap.entries())
      .map(([name, v]) => ({ name, count: v.count, lastPost: v.lastPost, status: minutesSince(v.lastPost) <= DELAY_THRESHOLD_MINUTES ? "OK" : "ATRASO" }))
      .sort((a, b) => b.count - a.count);

    const journalists = Array.from(journalistMap.entries())
      .map(([name, v]) => ({ name, count: v.count, categories: Array.from(v.categories) }))
      .sort((a, b) => b.count - a.count);

    const latestPosts = safePosts.slice(0, 8).map((p: any) => ({
      title: p.title,
      author: p.author,
      datetime: p.published,
      link: p.link,
      category: (p.categories && p.categories[0]) || "Sem categoria",
      portal: siteKey,
    }));

    return {
      name: siteKey,
      url: "",
      totalPublications: safePosts.length,
      status: categories.some((c) => c.status === "ATRASO") ? "ATRASO" : "OK",
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
  // 1) Prefer live per-site feeds from WordPress plugin
  try {
    const settled = await Promise.allSettled(
      SITE_FEEDS.map(async (url) => {
        const r = await fetch(url, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as SiteFeed;
      })
    );

    const okFeeds = settled
      .filter((r): r is PromiseFulfilledResult<SiteFeed> => r.status === "fulfilled")
      .map((r) => r.value);

    if (okFeeds.length > 0) {
      return normalizeFromSiteFeeds(okFeeds);
    }
  } catch {
    // fallback below
  }

  // 2) Fallback: single aggregated JSON
  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to fetch");
    const raw = await response.json();

    if (raw?.portals && raw?.audit) return raw as DashboardData;
    if (raw?.sites && raw?.generated_at) return normalizeLegacyPayload(raw as MonitorPayload);

    throw new Error("Formato de JSON não reconhecido");
  } catch {
    console.warn("Using mock data — endpoints unavailable");
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
