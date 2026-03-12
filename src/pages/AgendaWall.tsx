import { useMemo, useState } from "react";
import Agenda from "./Agenda";
import { useDashboardData } from "@/hooks/useDashboardData";
import { portalShort } from "@/lib/portal";
import { SeoMeta } from "@/components/seo/SeoMeta";
import { WallHeader } from "@/features/agenda-wall/components/WallHeader";
import { PortalWallCard } from "@/features/agenda-wall/components/PortalWallCard";
import { DrillModal } from "@/features/agenda-wall/components/DrillModal";
import { AgendaWallItem } from "@/features/agenda-wall/types";

function categoryKey(name: string) {
  const n = (name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (n.includes("meme")) return "memes";
  if (n.includes("vovo")) return "vovo";
  if (n.includes("noticia") || n.includes("noticias") || n.includes("mt noticia")) return "noticia";
  if (n.includes("polit")) return "politica";
  if (n.includes("esport")) return "esporte";
  if (n.includes("rondon")) return "rondonopolis";
  if (n.includes("brasil") && n.includes("mundo")) return "brasil_mundo";
  return n;
}

function nowCuiabaHour() {
  return Number(
    new Intl.DateTimeFormat("en-US", { timeZone: "America/Cuiaba", hour: "2-digit", hour12: false }).format(
      new Date()
    )
  );
}

function todayKeyCuiaba() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Cuiaba",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

type Drill = { open: boolean; portal: string; details: string[]; posts: any[] };

export default function AgendaWall() {
  const { data, isLoading } = useDashboardData();
  const [drill, setDrill] = useState<Drill>({ open: false, portal: "", details: [], posts: [] });

  const nowHour = nowCuiabaHour();
  const today = todayKeyCuiaba();

  const model = useMemo(() => {
    if (!data) return [] as AgendaWallItem[];

    return data.portals.map((p) => {
      const code = portalShort(p.name, p.url);
      const rules = p.editorialRules || [];
      const dayHourly = p.history?.hourly?.find((d: any) => d.date === today);
      const dayMeta = p.history?.meta?.find((d: any) => d.date === today);
      const dayPosts = p.history?.posts?.find((d: any) => d.date === today);

      let hourlyExpected = 0;
      let hourlyDone = 0;
      let overdue = 0;
      let inProgress = 0;
      const lateByCategory = new Map<string, number>();
      const overdueByKey = new Map<string, number>();
      const inProgressByKey = new Map<string, number>();

      for (const r of rules.filter((x: any) => x.kind === "hourly")) {
        const cat = categoryKey(r.category);
        const byCat = dayHourly?.categories?.find((c: any) => categoryKey(c.category) === cat);
        const hourMap = new Map<number, number>((byCat?.hours || []).map((h: any) => [h.hour, h.count]));

        for (let h = Math.max(8, r.start); h <= Math.min(22, r.end); h++) {
          hourlyExpected++;
          const c = hourMap.get(h) || 0;
          if (c > 0) hourlyDone++;
          else if (h < nowHour) {
            overdue++;
            lateByCategory.set(r.category, (lateByCategory.get(r.category) || 0) + 1);
            overdueByKey.set(cat, (overdueByKey.get(cat) || 0) + 1);
          } else if (h === nowHour) {
            inProgress++;
            inProgressByKey.set(cat, (inProgressByKey.get(cat) || 0) + 1);
          }
        }
      }

      let metaTarget = 0;
      let metaDone = 0;
      let metaDeficit = 0;
      let metaPending = 0;
      for (const r of rules.filter((x: any) => x.kind === "meta")) {
        const cat = categoryKey(r.category);
        const m = dayMeta?.categories?.find((c: any) => categoryKey(c.category) === cat && c.meta_applicable !== false);
        const count = m?.count || 0;
        const target = r.target || m?.target || 0;
        const deficit = Math.max(0, target - count);
        const deadlineHour = typeof r.end === "number" ? r.end : 23;

        metaTarget += target;
        metaDone += Math.min(count, target);
        metaPending += deficit;

        // Só vira atraso real depois do horário-limite da regra.
        if (nowHour > deadlineHour) {
          metaDeficit += deficit;
        }
      }

      const hourPct = hourlyExpected > 0 ? Math.round((hourlyDone / hourlyExpected) * 100) : null;
      const metaPct = metaTarget > 0 ? Math.round((metaDone / metaTarget) * 100) : null;

      const topLate = Array.from(lateByCategory.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat, n]) => `${cat} ${"⚠".repeat(Math.min(4, n))}`);

      const startHour = Math.max(8, nowHour - 5);
      const endHour = Math.max(8, Math.min(22, nowHour));
      const timeline = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i).map((h) => {
        let count = 0;
        for (const c of dayHourly?.categories || []) {
          const hm = new Map<number, number>((c.hours || []).map((x: any) => [x.hour, x.count]));
          count += hm.get(h) || 0;
        }
        return { hour: h, count };
      });

      const details = [
        overdue > 0 ? `⚠ ${overdue} horas com atraso de publicação` : "✔ nenhuma hora atrasada",
        `⏳ ${inProgress} faixa(s) ainda dentro do horário`,
        metaTarget > 0
          ? metaDeficit > 0
            ? `Meta diária em atraso: faltam ${metaDeficit}`
            : metaPending > 0
            ? `Meta diária em andamento: faltam ${metaPending}`
            : "✔ meta diária cumprida"
          : "Sem objetivo diário configurado hoje",
      ];

      const samplePosts = (dayPosts?.categories || [])
        .flatMap((c: any) =>
          (c.hours || []).flatMap((h: any) => (h.posts || []).map((post: any) => ({ ...post, category: c.category, hour: h.hour })))
        )
        .slice(0, 8);

      const categoryChips = p.categories.slice(0, 6).map((cat: any) => {
        const key = categoryKey(cat.name);
        const hasHourlyRule = rules.some((r: any) => r.kind === "hourly" && categoryKey(r.category) === key);
        const hasMetaRule = rules.some((r: any) => r.kind === "meta" && categoryKey(r.category) === key);
        const overdueCount = overdueByKey.get(key) || 0;
        const inProgressCount = inProgressByKey.get(key) || 0;

        let state: "prazo" | "andamento" | "atrasado" = "prazo";

        if (overdueCount > 0) {
          state = "atrasado";
        } else if (inProgressCount > 0) {
          state = "andamento";
        } else if (hasMetaRule) {
          const m = dayMeta?.categories?.find((c: any) => categoryKey(c.category) === key && c.meta_applicable !== false);
          const rule = rules.find((r: any) => r.kind === "meta" && categoryKey(r.category) === key);
          const deadlineHour = typeof rule?.end === "number" ? rule.end : 23;
          const target = rule?.target || m?.target || 0;
          const count = m?.count || 0;
          const deficit = Math.max(0, target - count);

          if (deficit > 0 && nowHour > deadlineHour) state = "atrasado";
          else if (deficit > 0) state = "andamento";
        } else if (hasHourlyRule) {
          state = "prazo";
        }

        const label = cat.name.length > 10 ? `${cat.name.slice(0, 8)}…` : cat.name;
        return { label, state };
      });

      const journalistChips = [...p.journalists]
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 3)
        .map((j: any) => {
          const states = j.categories.map((c: string) => {
            const key = categoryKey(c);
            const found = categoryChips.find((x) => categoryKey(x.label) === key);
            return found?.state || "prazo";
          });
          const state = states.includes("atrasado") ? "atrasado" : states.includes("andamento") ? "andamento" : "prazo";
          return { label: j.name.split(" ").slice(0, 2).join(" "), state };
        });

      return {
        portal: p,
        code,
        hourPct,
        metaPct,
        overdue,
        inProgress,
        metaDeficit,
        metaPending,
        topLate,
        timeline,
        details,
        samplePosts,
        score: overdue * 2 + metaDeficit,
        categoryChips,
        journalistChips,
      };
    });
  }, [data, nowHour, today]);

  const sorted = useMemo(() => {
    const order: Record<string, number> = { PMT: 1, OMT: 2, ROO: 3, PNMT: 4, PPMT: 5, AFL: 6 };
    return [...model].sort((a, b) => (order[a.code] || 99) - (order[b.code] || 99));
  }, [model]);

  const updatedAt = useMemo(
    () =>
      new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Cuiaba", dateStyle: "short", timeStyle: "short" }).format(
        new Date(data?.lastUpdate || Date.now())
      ),
    [data?.lastUpdate]
  );

  const jsonLd = useMemo(() => {
    const origin = window.location.origin;
    const onGitHubPages = window.location.pathname.startsWith("/radar-editorial-mt/");
    const basePath = onGitHubPages ? "/radar-editorial-mt" : "";

    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Agenda Wall | Radar Editorial MT",
      description: "Painel operacional em tempo real com risco, atrasos e aderência por portal.",
      url: `${origin}${basePath}/agenda-wall`,
      inLanguage: "pt-BR",
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${origin}${basePath}/images/agenda-wall-thumb.jpg`,
        width: 1200,
        height: 630,
      },
    };
  }, []);

  if (isLoading) return <div className="p-6">Carregando agenda wall…</div>;

  return (
    <>
      <SeoMeta
        title="Agenda Wall | Radar Editorial em Tempo Real"
        description="Painel em tempo real com metas de publicação por hora e por dia para cada portal."
        canonicalPath="/agenda-wall"
        imagePath="/images/agenda-wall-thumb.jpg"
        robots="index,follow"
        jsonLd={jsonLd}
      />

      <div className="space-y-4 bg-slate-950 p-3 md:p-4 min-h-screen">
        <WallHeader updatedAt={updatedAt} />

        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((item) => (
            <PortalWallCard
              key={item.portal.name}
              item={item}
              onDetail={(selected) =>
                setDrill({
                  open: true,
                  portal: `${selected.code} — ${selected.portal.name}`,
                  details: selected.details,
                  posts: selected.samplePosts,
                })
              }
            />
          ))}
        </section>

        <details className="rounded-lg border border-slate-700 bg-slate-950/30 p-2">
          <summary className="cursor-pointer text-sm font-semibold">Detalhamento completo da agenda (abrir quando precisar)</summary>
          <div className="mt-2">
            <Agenda />
          </div>
        </details>

        <DrillModal drill={drill} onClose={() => setDrill((d) => ({ ...d, open: false }))} />
      </div>
    </>
  );
}
