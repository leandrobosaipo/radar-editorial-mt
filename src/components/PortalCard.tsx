import { PortalData } from "@/types/dashboard";
import { formatCuiabaTime } from "@/lib/time";
import { portalShort } from "@/lib/portal";

function ruleModeByPortalCode(code: string): "HORA" | "META" | "ATUAL" {
  if (code === "PMT" || code === "OMT") return "HORA";
  if (code === "ROO") return "META";
  return "ATUAL";
}

interface Props {
  portal: PortalData;
}

export function PortalCard({ portal }: Props) {
  const code = portalShort(portal.name, portal.url);
  const complianceStatus = portal.complianceStatus || portal.status;
  const siteStatus = portal.siteStatus || portal.status;
  const ruleMode = ruleModeByPortalCode(code);
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
                <th className="pb-2 pr-4 font-sans text-xs text-muted-foreground">Último Post</th>
                <th className="pb-2 font-sans text-xs text-muted-foreground text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {portal.categories.map((cat) => {
                const isMemes = /meme/i.test(cat.name);
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
                    <td className="py-2 pr-4 font-mono text-xs text-status-amber">
                      {formatCuiabaTime(cat.lastPost)}
                    </td>
                    <td className="py-2 text-right">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-mono font-bold ${
                          isMemes || cat.status !== "ATRASO"
                            ? "bg-status-ok/20 text-status-ok"
                            : "bg-status-delay/20 text-status-delay"
                        }`}
                      >
                        {isMemes ? "SOB DEMANDA" : cat.status}
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
