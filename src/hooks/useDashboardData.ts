import { useQuery } from "@tanstack/react-query";
import { DashboardData, PortalData, CategorySummary, AuditEntry } from "@/types/dashboard";
import { DATA_URL, REFRESH_INTERVAL, DELAY_THRESHOLD_MINUTES, SITE_FEEDS } from "@/config";
import { MOCK_DATA } from "@/data/mockData";

type SiteFeed = {
  site: { name: string; url: string; timezone?: string; code?: string };
  generated_at: string;
  window: { start: string; end: string };
  totals: { posts: number; categories: number; journalists: number };
  site_last_publication?: string | null;
  site_elapsed_minutes?: number | null;
  site_status?: "OK" | "ATRASO";
  compliance_status?: "OK" | "ATRASO";
  compliance?: {
    overall_status: "OK" | "ATRASO";
    checks: Array<{ id: string; label: string; status: "OK" | "ATRASO"; detail: string }>;
  };
  categories: Record<string, { count: number; last_post: string | null }>;
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

function isMemesCategory(name: string): boolean {
  return /meme/i.test(name || "");
}

function portalCode(name: string): "PMT"|"OMT"|"ROO"|"PNMT"|"PPMT"|"AFL"|"SITE" {
  const n = (name || "").toLowerCase();
  if (n.includes("perrengue")) return "PMT";
  if (n.includes("matogrossense")) return "OMT";
  if (n.includes("roo")) return "ROO";
  if (n.includes("norte")) return "PNMT";
  if (n.includes("pantanal")) return "PPMT";
  if (n.includes("folha") || n.includes("primavera")) return "AFL";
  return "SITE";
}

function cuiabaNow() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Cuiaba", weekday: "short", hour: "2-digit", hour12: false }).formatToParts(new Date());
  const wd = (parts.find((p) => p.type === "weekday")?.value || "Mon").toLowerCase();
  const hour = Number(parts.find((p) => p.type === "hour")?.value || "0");
  const dow = wd.startsWith("mon") ? 1 : wd.startsWith("tue") ? 2 : wd.startsWith("wed") ? 3 : wd.startsWith("thu") ? 4 : wd.startsWith("fri") ? 5 : wd.startsWith("sat") ? 6 : 7;
  return { dow, hour };
}

function categoryKey(name: string): string {
  const n = (name || "").toLowerCase();
  if (n.includes("meme")) return "memes";
  if (n.includes("pol")) return "politica";
  if (n.includes("esport")) return "esporte";
  if (n.includes("rondon")) return "rondonopolis";
  if (n.includes("brasil")) return "brasil_mundo";
  if (n.includes("mt") && n.includes("not")) return "mt_noticia";
  return "other";
}

function metaTarget(code: string, categoryName: string, dow: number): number | null {
  const k = categoryKey(categoryName);
  if (code === "ROO") {
    if (["rondonopolis", "mt_noticia", "brasil_mundo", "esporte", "politica"].includes(k)) return 3;
  }
  if (code === "PMT" || code === "OMT") {
    if (dow === 6 && (k === "politica" || k === "esporte")) return 2;
    if (dow === 7 && k === "politica") return 2;
    if (dow === 7 && k === "esporte") return 4;
  }
  return null;
}

function metaWindowOpen(code: string, categoryName: string, dow: number, hour: number): boolean {
  const k = categoryKey(categoryName);
  if (code === "ROO") return hour <= 22;
  if (code === "PMT") {
    if (dow === 6 && (k === "politica" || k === "esporte")) return hour <= 22;
    if (dow === 7 && k === "politica") return hour <= 22;
    if (dow === 7 && k === "esporte") return hour <= 22;
  }
  if (code === "OMT") {
    if (dow === 6 && (k === "politica" || k === "esporte")) return hour <= 20;
    if (dow === 7 && k === "politica") return hour <= 20;
    if (dow === 7 && k === "esporte") return hour <= 20;
  }
  return false;
}

function portalOrderRank(name: string): number {
  const n = (name || "").toLowerCase();
  if (n.includes("perrengue")) return 1; // PMT
  if (n.includes("matogrossense")) return 2; // OMT
  if (n.includes("roo")) return 3; // ROO
  if (n.includes("norte")) return 4; // PNMT
  if (n.includes("pantanal")) return 5; // PPMT
  if (n.includes("folha")) return 6; // AFL
  return 99;
}

function normalizeFromSiteFeeds(feeds: SiteFeed[]): DashboardData {
  const portals: PortalData[] = feeds.map((feed) => {
    const categories: CategorySummary[] = Object.entries(feed.categories || {})
      .map(([name, meta]) => ({
        name,
        count: meta.count,
        lastPost: meta.last_post || feed.generated_at,
        status: isMemesCategory(name)
          ? "OK"
          : minutesSince(meta.last_post || feed.generated_at) <= DELAY_THRESHOLD_MINUTES
          ? "OK"
          : "ATRASO",
      }))
      .sort((a, b) => b.count - a.count);

    const journalists = Object.entries(feed.journalists || {})
      .map(([name, meta]) => ({
        name: name.replace(/\s*\(ID:\d+\)\s*$/, ""),
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

    const computedSiteStatus =
      (feed.compliance_status as "OK" | "ATRASO" | undefined) ||
      (feed.compliance?.overall_status as "OK" | "ATRASO" | undefined) ||
      (typeof feed.site_status === "string" ? feed.site_status : undefined) ||
      (() => {
        const ref = feed.site_last_publication || latestPosts[0]?.datetime;
        if (!ref) return "ATRASO" as const;
        return minutesSince(ref) <= DELAY_THRESHOLD_MINUTES ? "OK" : "ATRASO";
      })();

    const siteStatus = (feed.site_status as "OK" | "ATRASO" | undefined) || computedSiteStatus;
    const complianceStatus =
      (feed.compliance_status as "OK" | "ATRASO" | undefined) ||
      (feed.compliance?.overall_status as "OK" | "ATRASO" | undefined) ||
      computedSiteStatus;

    return {
      name: feed.site?.name || "Portal",
      url: feed.site?.url || "",
      totalPublications: feed.totals?.posts || 0,
      status: complianceStatus,
      siteStatus,
      complianceStatus,
      checks: feed.compliance?.checks || [],
      categories,
      journalists,
      latestPosts,
    };
  });

  portals.sort((a, b) => portalOrderRank(a.name) - portalOrderRank(b.name));

  const { dow, hour } = cuiabaNow();
  const audit: AuditEntry[] = feeds.flatMap((feed) => {
    const siteName = feed.site?.name || feed.site?.url || "site";
    const code = portalCode(siteName);
    const rows: AuditEntry[] = [];

    for (const a of feed.audit || []) {
      const count = (feed.categories || {})[a.category]?.count ?? 0;
      const target = metaTarget(code, a.category, dow);
      if (target) {
        const within = metaWindowOpen(code, a.category, dow, hour);
        if (count < target) {
          rows.push({
            site: siteName,
            category: a.category,
            lastPublication: a.last_publication || feed.generated_at,
            elapsed: `${count}/${target}`,
            status: "ATRASO",
            mode: "META",
            count,
            target,
            withinWindow: within,
          });
        }
      } else if (a.status === "ATRASO") {
        rows.push({
          site: siteName,
          category: a.category,
          lastPublication: a.last_publication || feed.generated_at,
          elapsed: a.elapsed_human || `${a.elapsed_minutes} min`,
          status: "ATRASO",
          mode: "TIME",
        });
      }
    }

    return rows;
  });

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

    const legacyStatus = categories.some((c) => c.status === "ATRASO") ? "ATRASO" : "OK";
    return {
      name: siteKey,
      url: "",
      totalPublications: safePosts.length,
      status: legacyStatus,
      siteStatus: legacyStatus,
      complianceStatus: legacyStatus,
      checks: [],
      categories,
      journalists,
      latestPosts,
    };
  });

  portals.sort((a, b) => portalOrderRank(a.name) - portalOrderRank(b.name));

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
