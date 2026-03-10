import { useMemo } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = {
  ok: "#22c55e",
  warn: "#f59e0b",
  crit: "#ef4444",
  blue: "#3b82f6",
  card: "#111827",
  bg: "#0b1220",
};

function minutesSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
}

function severityByMinutes(mins: number): "OK" | "ATENCAO" | "CRITICO" {
  if (mins <= 60) return "OK";
  if (mins <= 120) return "ATENCAO";
  return "CRITICO";
}

export default function TVDashboard() {
  const { data, isLoading } = useDashboardData();

  const model = useMemo(() => {
    if (!data) return null;

    const totalPosts = data.portals.reduce((s, p) => s + p.totalPublications, 0);
    const activePortals = data.portals.filter((p) => p.totalPublications > 0).length;

    const allCats = data.portals.flatMap((p) => p.categories);
    const delayedCats = allCats.filter((c) => c.status === "ATRASO").length;
    const journalists = new Set(data.portals.flatMap((p) => p.journalists.map((j) => j.name))).size;

    const postsByPortal = data.portals.map((p) => ({ name: p.name.replace("Portal ", "").replace("Mato Grosso", "MT"), posts: p.totalPublications }));

    const catMap = new Map<string, number>();
    data.portals.forEach((p) =>
      p.categories.forEach((c) => catMap.set(c.name, (catMap.get(c.name) || 0) + c.count))
    );
    const postsByCategory = Array.from(catMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const jornMap = new Map<string, number>();
    data.portals.forEach((p) =>
      p.journalists.forEach((j) => jornMap.set(j.name, (jornMap.get(j.name) || 0) + j.count))
    );
    const postsByJournalist = Array.from(jornMap.entries())
      .map(([name, posts]) => ({ name, posts }))
      .sort((a, b) => b.posts - a.posts)
      .slice(0, 8);

    const ticker = data.portals
      .flatMap((p) => p.latestPosts.map((lp) => ({ ...lp, portalName: p.name })))
      .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
      .slice(0, 30);

    const auditCritical = data.portals
      .flatMap((p) =>
        p.categories.map((c) => {
          const mins = minutesSince(c.lastPost);
          return {
            site: p.name,
            category: c.name,
            lastPublication: c.lastPost,
            mins,
            severity: severityByMinutes(mins),
          };
        })
      )
      .sort((a, b) => {
        const rank = { CRITICO: 3, ATENCAO: 2, OK: 1 };
        return rank[b.severity] - rank[a.severity] || b.mins - a.mins;
      })
      .slice(0, 12);

    return {
      totalPosts,
      activePortals,
      delayedCats,
      journalists,
      postsByPortal,
      postsByCategory,
      postsByJournalist,
      ticker,
      auditCritical,
    };
  }, [data]);

  if (isLoading || !model) {
    return <div className="h-screen w-screen bg-[#0b1220] text-white flex items-center justify-center">Carregando wallboard...</div>;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0b1220] text-white p-4">
      <div className="mb-3">
        <h1 className="text-3xl font-bold">Radar Editorial MT</h1>
        <p className="text-sm text-slate-300">Central de Monitoramento da Redação</p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-3">
        {[
          ["TOTAL DE POSTS", model.totalPosts, COLORS.blue],
          ["PORTAIS ATIVOS", model.activePortals, COLORS.ok],
          ["CATEGORIAS EM ATRASO", model.delayedCats, model.delayedCats > 0 ? COLORS.crit : COLORS.ok],
          ["JORNALISTAS ATIVOS", model.journalists, COLORS.warn],
        ].map(([label, val, color]) => (
          <div key={String(label)} className="rounded-lg p-4" style={{ background: COLORS.card }}>
            <div className="text-xs text-slate-300">{label}</div>
            <div className="text-4xl font-extrabold" style={{ color: String(color) }}>{val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3 h-[27vh]">
        <div className="rounded-lg p-3" style={{ background: COLORS.card }}>
          <div className="text-sm mb-2">Posts por Portal</div>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={model.postsByPortal}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#cbd5e1" tick={{ fontSize: 10 }} />
              <YAxis stroke="#cbd5e1" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="posts" fill={COLORS.blue} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg p-3" style={{ background: COLORS.card }}>
          <div className="text-sm mb-2">Posts por Categoria</div>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={model.postsByCategory} dataKey="value" nameKey="name" outerRadius={85}>
                {model.postsByCategory.map((_, i) => (
                  <Cell key={i} fill={["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6", "#f97316", "#84cc16"][i % 8]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg p-3" style={{ background: COLORS.card }}>
          <div className="text-sm mb-2">Posts por Jornalista</div>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={model.postsByJournalist} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#cbd5e1" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={100} stroke="#cbd5e1" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="posts" fill={COLORS.warn} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3 h-[24vh]">
        {data.portals.slice(0, 6).map((p) => {
          const delayed = p.categories.filter((c) => c.status === "ATRASO").length;
          return (
            <div key={p.name} className="rounded-lg p-2" style={{ background: delayed ? "#3f1d1d" : "#123524" }}>
              <div className="flex justify-between mb-1">
                <div className="font-semibold text-sm">{p.name}</div>
                <div className="text-xs">{p.totalPublications} posts</div>
              </div>
              <table className="w-full text-xs">
                <tbody>
                  {p.categories
                    .map((c) => ({ ...c, mins: minutesSince(c.lastPost) }))
                    .sort((a, b) => b.mins - a.mins)
                    .slice(0, 5)
                    .map((c) => (
                      <tr key={c.name}>
                        <td>{c.name}</td>
                        <td className="text-right text-slate-200">{c.mins}m</td>
                        <td className="text-right" style={{ color: c.status === "ATRASO" ? COLORS.crit : COLORS.ok }}>{c.status}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg p-2 mb-3 overflow-hidden" style={{ background: COLORS.card }}>
        <div className="text-xs mb-1">Feed de atividade (últimos posts)</div>
        <div className="ticker-wrap">
          <div className="ticker-track">
            {[...model.ticker, ...model.ticker].map((t, i) => (
              <span key={i} className="mr-8 text-xs whitespace-nowrap">
                <b>{t.portalName}</b> • {t.author} • {new Date(t.datetime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} • {t.title}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg p-2 h-[14vh]" style={{ background: COLORS.card }}>
        <div className="text-xs mb-1">Auditoria crítica</div>
        <table className="w-full text-xs">
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
            {model.auditCritical.map((a, i) => (
              <tr key={i}>
                <td>{a.site}</td>
                <td>{a.category}</td>
                <td>{new Date(a.lastPublication).toLocaleString("pt-BR")}</td>
                <td className="text-right">{a.mins} min</td>
                <td className="text-right" style={{ color: a.severity === "CRITICO" ? COLORS.crit : a.severity === "ATENCAO" ? COLORS.warn : COLORS.ok }}>{a.severity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
