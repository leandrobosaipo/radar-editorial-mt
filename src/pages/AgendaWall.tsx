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

  const nowHour = useMemo(() => nowCuiabaHour(), []);
  const today = useMemo(() => todayKeyCuiaba(), []);

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
          } else if (h === nowHour) {
            inProgress++;
          }
        }
      }

      let metaTarget = 0;
      let metaDone = 0;
      let metaDeficit = 0;
      for (const r of rules.filter((x: any) => x.kind === "meta")) {
        const cat = categoryKey(r.category);
        const m = dayMeta?.categories?.find((c: any) => categoryKey(c.category) === cat);
        const count = m?.count || 0;
        const target = r.target || m?.target || 0;
        metaTarget += target;
        metaDone += Math.min(count, target);
        metaDeficit += Math.max(0, target - count);
      }

      const hourPct = hourlyExpected > 0 ? Math.round((hourlyDone / hourlyExpected) * 100) : null;
      const metaPct = metaTarget > 0 ? Math.round((metaDone / metaTarget) * 100) : null;

      const topLate = Array.from(lateByCategory.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat, n]) => `${cat} ${"⚠".repeat(Math.min(4, n))}`);

      const timeline = Array.from({ length: 6 }, (_, i) => nowHour - (5 - i)).map((h) => {
        let count = 0;
        for (const c of dayHourly?.categories || []) {
          const hm = new Map<number, number>((c.hours || []).map((x: any) => [x.hour, x.count]));
          count += hm.get(h) || 0;
        }
        return { hour: h, count };
      });

      const details = [
        overdue > 0 ? `⚠ ${overdue} janelas vencidas` : "✔ nenhum atraso horário vencido",
        `⏳ ${inProgress} em prazo (hora atual)`,
        metaTarget > 0 ? `Déficit de meta: ${metaDeficit}` : "Sem meta diária hoje",
      ];

      const samplePosts = (dayPosts?.categories || [])
        .flatMap((c: any) =>
          (c.hours || []).flatMap((h: any) => (h.posts || []).map((post: any) => ({ ...post, category: c.category, hour: h.hour })))
        )
        .slice(0, 8);

      return {
        portal: p,
        code,
        hourPct,
        metaPct,
        overdue,
        inProgress,
        metaDeficit,
        topLate,
        timeline,
        details,
        samplePosts,
        score: overdue * 2 + metaDeficit,
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Agenda Wall | Radar Editorial MT",
    description: "Painel operacional em tempo real com risco, atrasos e aderência por portal.",
    url: "https://leandrobosaipo.github.io/radar-editorial-mt/agenda-wall",
    inLanguage: "pt-BR",
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: "https://leandrobosaipo.github.io/radar-editorial-mt/images/agenda-wall-thumb.jpg",
      width: 1200,
      height: 630,
    },
  };

  if (isLoading) return <div className="p-6">Carregando agenda wall…</div>;

  return (
    <>
      <SeoMeta
        title="Agenda Wall | Radar Editorial em Tempo Real"
        description="Painel operacional em tempo real com status, risco e aderência por portal."
        canonicalPath="/agenda-wall"
        imagePath="/images/agenda-wall-thumb.jpg"
        robots="index,follow"
        jsonLd={jsonLd}
      />

      <div className="space-y-6 p-4 md:p-6">
        <WallHeader updatedAt={updatedAt} />

        <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
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

        <section className="rounded-lg border border-slate-700 bg-slate-950/30 p-2">
          <div className="mb-2 text-sm font-semibold">Agenda detalhada (análise)</div>
          <Agenda />
        </section>

        <DrillModal drill={drill} onClose={() => setDrill((d) => ({ ...d, open: false }))} />
      </div>
    </>
  );
}
