import { PortalData, EditorialRule } from "@/types/dashboard";
import { formatCuiabaTime } from "@/lib/time";
import { portalShort } from "@/lib/portal";

function ruleModeByPortalCode(code: string): "HORA" | "META" | "ATUAL" {
  if (code === "PMT" || code === "OMT") return "HORA";
  if (code === "ROO") return "META";
  return "ATUAL";
}

function cuiabaNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Cuiaba",
    weekday: "short",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const wd = (parts.find((p) => p.type === "weekday")?.value || "Mon").toLowerCase();
  const hour = Number(parts.find((p) => p.type === "hour")?.value || "0");
  const dow = wd.startsWith("mon") ? 1 : wd.startsWith("tue") ? 2 : wd.startsWith("wed") ? 3 : wd.startsWith("thu") ? 4 : wd.startsWith("fri") ? 5 : wd.startsWith("sat") ? 6 : 7;
  return { dow, hour };
}

function catKey(name: string): string {
  const n = (name || "").toLowerCase();
  if (n.includes("meme")) return "memes";
  if (n.includes("vov")) return "vovo";
  if (n.includes("esport")) return "esporte";
  if (n.includes("pol")) return "politica";
  if (n.includes("not")) return "noticia";
  if (n.includes("rondon")) return "rondonopolis";
  if (n.includes("brasil")) return "brasil_mundo";
  if (n.includes("mt")) return "mt_noticia";
  return "other";
}

function categoryRules(rules: EditorialRule[] | undefined, categoryName: string, dow: number) {
  const k = catKey(categoryName);
  return (rules || []).filter((r) => {
    const rk = (r.category_key || catKey(r.category || "")).toLowerCase();
    return rk === k && (r.days || []).includes(dow);
  });
}

function isHourlyWindowActive(code: string, categoryName: string, dow: number, hour: number, rules?: EditorialRule[]): boolean | null {
  const matched = categoryRules(rules, categoryName, dow).filter((r) => r.kind === "hourly");
  if (matched.length > 0) {
    return matched.some((r) => hour >= r.start && hour <= r.end);
  }
  const k = catKey(categoryName);
  const weekend = dow >= 6;
  if (k === "memes") return null;
  if (code === "ROO" || code === "AFL" || code === "PNMT" || code === "PPMT") return null;

  const endWeekend = code === "OMT" ? 20 : 22;
  if (!weekend) {
    if (k === "noticia" || k === "vovo") return hour >= 8 && hour <= 22;
    if (k === "politica" || k === "esporte") return hour >= 12 && hour <= 22;
    return null;
  }
  if (dow === 6) {
    if (k === "noticia" || k === "vovo") return hour >= 8 && hour <= endWeekend;
    return null;
  }
  if (dow === 7) {
    if (k === "noticia" || k === "vovo") return hour >= 8 && hour <= endWeekend;
    if (k === "esporte") return hour >= 15 && hour <= endWeekend;
    return null;
  }
  return null;
}

function metaTarget(code: string, categoryName: string, dow: number, rules?: EditorialRule[]): number | null {
  const matched = categoryRules(rules, categoryName, dow).filter((r) => r.kind === "meta" && typeof r.target === "number");
  if (matched.length > 0) return matched[0].target || null;
  const k = catKey(categoryName);
  if (code === "ROO" && ["rondonopolis", "mt_noticia", "brasil_mundo", "esporte", "politica"].includes(k)) return 3;
  if (code === "PMT" || code === "OMT") {
    if (dow === 6 && (k === "politica" || k === "esporte")) return 2;
    if (dow === 7 && k === "politica") return 2;
    if (dow === 7 && k === "esporte") return 4;
  }
  return null;
}

function metaWindowOpen(code: string, categoryName: string, dow: number, hour: number, rules?: EditorialRule[]): boolean {
  const matched = categoryRules(rules, categoryName, dow).filter((r) => r.kind === "meta");
  if (matched.length > 0) {
    return matched.some((r) => hour <= r.end);
  }
  const k = catKey(categoryName);
  if (code === "ROO") return hour <= 22;
  if (code === "PMT") {
    if (dow === 6 && (k === "politica" || k === "esporte")) return hour <= 22;
    if (dow === 7 && (k === "politica" || k === "esporte")) return hour <= 22;
  }
  if (code === "OMT") {
    if (dow === 6 && (k === "politica" || k === "esporte")) return hour <= 20;
    if (dow === 7 && (k === "politica" || k === "esporte")) return hour <= 20;
  }
  return true;
}

function categoryRuleLabel(code: string, categoryName: string, dow: number, rules?: EditorialRule[]): { rule: string; window: string; outside: string } {
  const matched = categoryRules(rules, categoryName, dow);
  if (matched.length > 0) {
    const hasHourly = matched.some((r) => r.kind === "hourly");
    const meta = matched.find((r) => r.kind === "meta");
    if (hasHourly) {
      const h = matched.find((r) => r.kind === "hourly")!;
      return { rule: "1/h", window: `${h.start}-${h.end}`, outside: "Fora da janela" };
    }
    if (meta) {
      return { rule: "Meta diária", window: `Mín. ${meta.target || 0}/dia`, outside: "Sem horário fixo" };
    }
    if (matched.some((r) => r.kind === "ondemand")) {
      return { rule: "Sob demanda", window: "Sem horário fixo", outside: "Sem atraso" };
    }
  }
  const k = catKey(categoryName);
  const weekend = dow >= 6;

  if (k === "memes") return { rule: "Sob demanda", window: "Sem horário fixo", outside: "Sem atraso" };

  if (code === "ROO") {
    return { rule: "Meta diária", window: "Mín. 3/dia", outside: "Sem horário fixo" };
  }

  if (code === "AFL" || code === "PNMT" || code === "PPMT") {
    return { rule: "Atualização global", window: "Portal <=6h", outside: "Sem grade por hora" };
  }

  const endWeekend = code === "OMT" ? 20 : 22;
  if (!weekend) {
    if (k === "noticia" || k === "vovo") return { rule: "1/h", window: "Seg-Sex 08-22", outside: "Fora da janela" };
    if (k === "politica" || k === "esporte") return { rule: "1/h", window: "Seg-Sex 12-22", outside: "Fora da janela" };
  } else if (dow === 6) {
    if (k === "noticia" || k === "vovo") return { rule: "1/h", window: `Sáb 08-${endWeekend}`, outside: "Fora da janela" };
    if (k === "politica" || k === "esporte") return { rule: "Meta diária", window: "Sáb mín. 2/dia", outside: "Sem horário fixo" };
  } else if (dow === 7) {
    if (k === "noticia" || k === "vovo") return { rule: "1/h", window: `Dom 08-${endWeekend}`, outside: "Fora da janela" };
    if (k === "politica") return { rule: "Meta diária", window: "Dom mín. 2/dia", outside: "Sem horário fixo" };
    if (k === "esporte") return { rule: "Meta diária", window: code === "OMT" ? "Dom 15-20 (4+)" : "Dom 15-22 (4+)", outside: "Fora da janela" };
  }

  return { rule: "Informativo", window: "Sob demanda", outside: "Sem atraso" };
}

interface Props {
  portal: PortalData;
}

export function PortalCard({ portal }: Props) {
  const code = portalShort(portal.name, portal.url);
  const complianceStatus = portal.complianceStatus || portal.status;
  const siteStatus = portal.siteStatus || portal.status;
  const ruleMode = ruleModeByPortalCode(code);
  const { dow, hour } = cuiabaNow();
  const isDelayed = complianceStatus === "ATRASO";

  return (
    <div
      className={`rounded-lg border-2 bg-card p-6 md:p-8 transition-all ${
        isDelayed
          ? "pulse-delay border-status-delay"
          : "border-border hover:border-status-ok/30"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">{code}</h2>
          <p className="text-xs text-muted-foreground font-sans">{portal.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-bold text-foreground">
            {portal.totalPublications}
          </span>
          <span className={`rounded px-2 py-1 text-[10px] font-mono font-bold uppercase ${siteStatus === "ATRASO" ? "bg-status-delay/20 text-status-delay" : "bg-status-ok/20 text-status-ok"}`} title="Status global do portal (última publicação)">
            SITE {siteStatus === "ATRASO" ? "DESAT" : "ATIVO"}
          </span>
          <span className={`rounded px-2 py-1 text-[10px] font-mono font-bold uppercase ${complianceStatus === "ATRASO" ? "bg-status-delay/20 text-status-delay" : "bg-status-ok/20 text-status-ok"}`} title="Status das regras editoriais">
            {ruleMode} {complianceStatus === "ATRASO" ? "PEND" : "OK"}
          </span>
        </div>
      </div>

      {/* Compliance checks */}
      {portal.checks && portal.checks.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-xs font-sans uppercase tracking-wider text-muted-foreground">
            Regras editoriais (checks)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {portal.checks.slice(0, 6).map((c) => (
                  <tr key={c.id} className="border-b border-border/50">
                    <td className="py-1 pr-3 font-mono text-xs">{c.label}</td>
                    <td className="py-1 pr-3 font-mono text-xs text-muted-foreground">{c.detail}</td>
                    <td className="py-1 text-right">
                      <span className={`inline-block rounded px-2 py-0.5 text-xs font-mono font-bold ${c.status === "ATRASO" ? "bg-status-delay/20 text-status-delay" : "bg-status-ok/20 text-status-ok"}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="mt-6">
        <h3 className="mb-2 text-xs font-sans uppercase tracking-wider text-muted-foreground">
          Categorias
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 pr-4 font-sans text-xs text-muted-foreground">Categoria</th>
                <th className="pb-2 pr-4 font-sans text-xs text-muted-foreground text-right">Total</th>
                <th className="pb-2 pr-4 font-sans text-xs text-muted-foreground">Regra / Janela</th>
                <th className="pb-2 pr-4 font-sans text-xs text-muted-foreground">Último Post</th>
                <th className="pb-2 font-sans text-xs text-muted-foreground text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {portal.categories.map((cat) => {
                const isMemes = /meme/i.test(cat.name);
                const rule = categoryRuleLabel(code, cat.name, dow, portal.editorialRules);
                const inWindow = isHourlyWindowActive(code, cat.name, dow, hour, portal.editorialRules);
                const target = metaTarget(code, cat.name, dow, portal.editorialRules);
                const isMeta = target !== null;
                const metaInWindow = isMeta ? metaWindowOpen(code, cat.name, dow, hour, portal.editorialRules) : null;
                const progress = isMeta ? `${cat.count}/${target}` : null;
                const effectiveStatus = isMemes
                  ? "SOB DEMANDA"
                  : isMeta
                  ? (cat.count >= (target || 0)
                      ? progress
                      : inWindow === false
                      ? progress
                      : progress)
                  : inWindow === false
                  ? "FORA JANELA"
                  : cat.status;
                return (
                  <tr key={cat.name} className="border-b border-border/50">
                    <td className="py-2 pr-4 font-mono text-xs">
                      {cat.name}
                      {isMemes && (
                        <span className="ml-2 rounded bg-status-ok/20 px-1.5 py-0.5 text-[10px] font-bold text-status-ok">
                          SOB DEMANDA
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs text-right">{cat.count}</td>
                    <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">
                      <div>{rule.rule}</div>
                      <div className="text-[10px]">{rule.window}</div>
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs text-status-amber">
                      {formatCuiabaTime(cat.lastPost)}
                    </td>
                    <td className="py-2 text-right">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-mono font-bold ${
                          isMemes
                            ? "bg-status-ok/20 text-status-ok"
                            : isMeta
                            ? cat.count >= (target || 0)
                              ? "bg-status-ok/20 text-status-ok"
                              : metaInWindow === false
                              ? "bg-status-delay/20 text-status-delay"
                              : "bg-yellow-500/20 text-yellow-300"
                            : effectiveStatus === "ATRASO"
                            ? "bg-status-delay/20 text-status-delay"
                            : "bg-status-ok/20 text-status-ok"
                        }`}
                      >
                        {effectiveStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Journalists */}
      <div className="mt-6">
        <h3 className="mb-2 text-xs font-sans uppercase tracking-wider text-muted-foreground">
          Jornalistas
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 pr-4 font-sans text-xs text-muted-foreground">Nome</th>
                <th className="pb-2 pr-4 font-sans text-xs text-muted-foreground text-right">Posts</th>
                <th className="pb-2 font-sans text-xs text-muted-foreground">Categorias</th>
              </tr>
            </thead>
            <tbody>
              {portal.journalists.map((j) => (
                <tr key={j.name} className="border-b border-border/50">
                  <td className="py-2 pr-4 font-mono text-xs">{j.name}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-right">{j.count}</td>
                  <td className="py-2 font-sans text-xs text-muted-foreground">
                    {j.categories.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Latest Posts */}
      <div className="mt-6">
        <h3 className="mb-2 text-xs font-sans uppercase tracking-wider text-muted-foreground">
          Últimos Posts
        </h3>
        <div className="space-y-3">
          {portal.latestPosts.map((post, i) => (
            <a
              key={i}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded border border-border/50 bg-background/50 p-3 transition-colors hover:border-primary/30"
            >
              <p className="font-sans text-sm font-medium text-foreground leading-snug">
                {post.title}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <span className="font-mono text-muted-foreground">{post.author}</span>
                <span className="font-mono text-status-amber">{formatCuiabaTime(post.datetime)}</span>
                <span className="rounded bg-secondary px-1.5 py-0.5 font-sans text-muted-foreground">
                  {post.category}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
