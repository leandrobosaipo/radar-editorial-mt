import { useEffect, useMemo, useState } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";

const COLORS = {
  ok: "#22c55e",
  warn: "#f59e0b",
  crit: "#ef4444",
  blue: "#3b82f6",
  card: "#111827",
  bg: "#0b1220",
};

const WALLBOARD_NAME = "Painel editorial da redação";

const PORTAL_ABBR: Record<string, string> = {
  "O Matogrossense": "OMT",
  "O Matogrossense ": "OMT",
  "Perrengue Mato Grosso": "PMT",
  "Roo Notícias – Informação Precisa e Atualizada em Rondonópolis": "ROO",
  "Portal Norte MT – Notícias do Mato Grosso em Tempo Real": "PNMT",
  "Portal Pantanal MT: informação que nasce às margens do Rio Paraguai.": "PPMT",
  "O jornal que reflete seu dia a dia em Primavera do Leste": "AFL",
};

function portalShort(name: string): string {
  if (PORTAL_ABBR[name]) return PORTAL_ABBR[name];
  const n = name.toLowerCase();
  if (n.includes("perrengue")) return "PMT";
  if (n.includes("matogrossense")) return "OMT";
  if (n.includes("roo")) return "ROO";
  if (n.includes("norte")) return "PNMT";
  if (n.includes("pantanal")) return "PPMT";
  if (n.includes("folha")) return "AFL";
  return name.slice(0, 4).toUpperCase();
}

function journalistShort(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).join(" ");
}

function categoryShort(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("brasil")) return "BRM";
  if (n.includes("pol")) return "POL";
  if (n.includes("esport")) return "ESP";
  if (n.includes("not")) return "NOT";
  if (n.includes("vov")) return "VOV";
  if (n.includes("primavera")) return "PRM";
  if (n.includes("cáceres") || n.includes("caceres")) return "CAC";
  if (n.includes("sinop")) return "SNP";
  if (n.includes("rondon")) return "ROD";
  return name.slice(0, 3).toUpperCase();
}

function minutesSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
}

function severityByMinutes(mins: number): "OK" | "ATENCAO" | "CRITICO" {
  if (mins <= 60) return "OK";
  if (mins <= 120) return "ATENCAO";
  return "CRITICO";
}

function humanizeElapsed(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h < 24) return m ? `${h}h ${m}m` : `${h}h`;
  const d = Math.floor(h / 24);
  const hh = h % 24;
  if (d < 7) return hh ? `${d}d ${hh}h` : `${d}d`;
  const w = Math.floor(d / 7);
  const dd = d % 7;
  return dd ? `${w}w ${dd}d` : `${w}w`;
}

export default function TVDashboard() {
  const { data, isLoading } = useDashboardData();
  const [screenView, setScreenView] = useState<"charts" | "sites" | "audit">("charts");

  useEffect(() => {
    const t = setInterval(() => {
      setScreenView((v) => (v === "charts" ? "sites" : v === "sites" ? "audit" : "charts"));
    }, 30000);
    return () => clearInterval(t);
  }, []);

  const model = useMemo(() => {
    if (!data) return null;

    const totalPosts = data.portals.reduce((s, p) => s + p.totalPublications, 0);
    const activePortals = data.portals.filter((p) => p.totalPublications > 0).length;

    const allCats = data.portals.flatMap((p) => p.categories);
    const delayedCats = allCats.filter((c) => c.status === "ATRASO").length;
    const journalists = new Set(data.portals.flatMap((p) => p.journalists.map((j) => j.name))).size;

    const postsByPortal = data.portals.map((p) => ({ name: portalShort(p.name), posts: p.totalPublications }));

    const siteCategoryRows: Array<{ name: string; value: number }> = [];
    data.portals.forEach((p) => {
      const ps = portalShort(p.name);
      p.categories.forEach((c) => {
        siteCategoryRows.push({ name: `${ps}-${categoryShort(c.name)}`, value: c.count });
      });
    });
    const postsByCategory = siteCategoryRows.sort((a, b) => b.value - a.value).slice(0, 10);

    const siteJournalistRows: Array<{ name: string; posts: number }> = [];
    data.portals.forEach((p) => {
      const ps = portalShort(p.name);
      p.journalists.forEach((j) => {
        siteJournalistRows.push({ name: `${ps}-${journalistShort(j.name)}`, posts: j.count });
      });
    });
    const postsByJournalist = siteJournalistRows.sort((a, b) => b.posts - a.posts).slice(0, 10);

    const auditCritical = data.portals
      .flatMap((p) => {
        const rows = p.categories.map((c) => {
          const mins = minutesSince(c.lastPost);
          return {
            site: p.name,
            category: c.name,
            lastPublication: c.lastPost,
            mins,
            severity: severityByMinutes(mins),
          };
        });
        const rank = { CRITICO: 3, ATENCAO: 2, OK: 1 };
        return rows.sort((a, b) => rank[b.severity] - rank[a.severity] || b.mins - a.mins).slice(0, 3);
      })
      .slice(0, 18);

    return {
      totalPosts,
      activePortals,
      delayedCats,
      journalists,
      postsByPortal,
      postsByCategory,
      postsByJournalist,
      auditCritical,
    };
  }, [data]);

  if (isLoading || !model) {
    return <div className="h-screen w-screen bg-[#0b1220] text-white flex items-center justify-center">Carregando wallboard...</div>;
  }

  return (
    <div className="min-h-screen w-screen overflow-hidden bg-[#0b1220] text-white p-2 md:p-3">
      <div className="mb-2 text-[11px] text-slate-300 flex items-center justify-between">
        <span>{WALLBOARD_NAME}</span>
        <span>Atualizado: {new Date(data?.lastUpdate || Date.now()).toLocaleString("pt-BR")}</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
        {[
          ["TOTAL PUBLICADO", model.totalPosts, COLORS.blue],
          ["PORTAIS COM ATIVIDADE", model.activePortals, COLORS.ok],
          ["CATEGORIAS COM ATRASO", model.delayedCats, model.delayedCats > 0 ? COLORS.crit : COLORS.ok],
          ["JORNALISTAS COM PUBLICAÇÃO", model.journalists, COLORS.warn],
        ].map(([label, val, color]) => (
          <div key={String(label)} className="rounded-lg p-2" style={{ background: COLORS.card }}>
            <div className="text-[10px] text-slate-300">{label}</div>
            <div className="text-2xl md:text-3xl font-extrabold" style={{ color: String(color) }}>{val}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg p-2 h-[78vh] overflow-hidden" style={{ background: COLORS.card }}>
        <div className="text-[11px] mb-1 flex items-center justify-between text-slate-300">
          <span>
            {screenView === "charts" ? "Visão por gráficos" : screenView === "sites" ? "Situação dos 6 portais" : "Atrasos que precisam de ação"}
          </span>
          <span>Auto alterna a cada 30s</span>
        </div>

        {screenView === "charts" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 h-[calc(100%-20px)]">
            <div className="rounded-lg p-2" style={{ background: "#0f172a" }}>
              <div className="text-xs mb-1">Publicações por portal</div>
              <ResponsiveContainer width="100%" height="92%">
                <BarChart data={model.postsByPortal} layout="vertical" margin={{ left: 8, right: 8, top: 6, bottom: 6 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#cbd5e1" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" hide />
                  <Bar dataKey="posts" fill={COLORS.blue} radius={[0, 6, 6, 0]}>
                    <LabelList dataKey="name" position="insideLeft" fill="#0b1220" fontSize={11} />
                    <LabelList dataKey="posts" position="insideRight" fill="#ffffff" fontSize={11} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-lg p-2" style={{ background: "#0f172a" }}>
              <div className="text-xs mb-1">Publicações por categoria</div>
              <ResponsiveContainer width="100%" height="92%">
                <BarChart data={model.postsByCategory} layout="vertical" margin={{ left: 8, right: 8, top: 6, bottom: 6 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#cbd5e1" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" hide />
                  <Bar dataKey="value" fill={COLORS.ok} radius={[0, 6, 6, 0]}>
                    <LabelList dataKey="name" position="insideLeft" fill="#0b1220" fontSize={10} />
                    <LabelList dataKey="value" position="insideRight" fill="#ffffff" fontSize={10} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-lg p-2" style={{ background: "#0f172a" }}>
              <div className="text-xs mb-1">Publicações por jornalista</div>
              <ResponsiveContainer width="100%" height="92%">
                <BarChart data={model.postsByJournalist} layout="vertical" margin={{ left: 8, right: 8, top: 6, bottom: 6 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#cbd5e1" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" hide />
                  <Bar dataKey="posts" fill={COLORS.warn} radius={[0, 6, 6, 0]}>
                    <LabelList dataKey="name" position="insideLeft" fill="#0b1220" fontSize={10} />
                    <LabelList dataKey="posts" position="insideRight" fill="#ffffff" fontSize={10} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {screenView === "sites" && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 h-[calc(100%-20px)] overflow-hidden">
            {data.portals.slice(0, 6).map((p) => {
              const delayed = p.categories.filter((c) => c.status === "ATRASO").length;
              const lastPostIso = p.latestPosts?.[0]?.datetime || null;
              const siteMins = lastPostIso ? minutesSince(lastPostIso) : null;
              const siteStatus = p.status;
              return (
                <div key={p.name} className="rounded-lg p-2" style={{ background: siteStatus === "ATRASO" ? "#3f1d1d" : "#123524" }}>
                  <div className="flex justify-between mb-1">
                    <div className="font-semibold text-xs">{portalShort(p.name)}</div>
                    <div className="text-[10px]">{p.totalPublications} posts</div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-200 mb-1">
                    <div>Status site: <span style={{ color: siteStatus === "ATRASO" ? COLORS.crit : COLORS.ok }}>{siteStatus}</span></div>
                    <div>Cat. críticas: {delayed}</div>
                    <div>Últ. post: {siteMins === null ? "n/d" : humanizeElapsed(siteMins)}</div>
                  </div>
                  {p.categories.length === 0 ? (
                    <div className="text-[10px] text-slate-200">Sem posts na janela atual.</div>
                  ) : (
                    <table className="w-full text-[10px]">
                      <tbody>
                        {p.categories
                          .map((c) => ({ ...c, mins: minutesSince(c.lastPost), isMemes: /meme/i.test(c.name) }))
                          .sort((a, b) => b.mins - a.mins)
                          .slice(0, 5)
                          .map((c) => (
                            <tr key={c.name}>
                              <td>{c.name.slice(0, 13)}</td>
                              <td className="text-right text-slate-200">{humanizeElapsed(c.mins)}</td>
                              <td className="text-right" style={{ color: c.isMemes || c.status !== "ATRASO" ? COLORS.ok : COLORS.crit }}>{c.isMemes ? "DEM" : c.status === "ATRASO" ? "ATR" : "OK"}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {screenView === "audit" && (
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-slate-300">
                <th className="text-left">Portal</th>
                <th className="text-left">Categoria</th>
                <th className="text-left">Última publicação</th>
                <th className="text-right">Atraso</th>
                <th className="text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {model.auditCritical.slice(0, 24).map((a, i) => (
                <tr key={i}>
                  <td>{portalShort(a.site)}</td>
                  <td>{a.category}</td>
                  <td>{new Date(a.lastPublication).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="text-right">{humanizeElapsed(a.mins)}</td>
                  <td className="text-right" style={{ color: a.severity === "CRITICO" ? COLORS.crit : a.severity === "ATENCAO" ? COLORS.warn : COLORS.ok }}>{a.severity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
