import { PortalData } from "@/types/dashboard";
import { formatCuiabaTime } from "@/lib/time";

interface Props {
  portal: PortalData;
}

export function PortalCard({ portal }: Props) {
  const isDelayed = portal.status === "ATRASO";

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
          <h2 className="text-xl font-bold">{portal.name}</h2>
          <p className="text-xs text-muted-foreground font-sans">{portal.url}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-lg font-bold text-foreground">
            {portal.totalPublications}
          </span>
          <span
            className={`rounded px-3 py-1 text-xs font-mono font-bold uppercase ${
              isDelayed
                ? "bg-status-delay/20 text-status-delay"
                : "bg-status-ok/20 text-status-ok"
            }`}
          >
            {portal.status}
          </span>
        </div>
      </div>

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
              {portal.categories.map((cat) => (
                <tr key={cat.name} className="border-b border-border/50">
                  <td className="py-2 pr-4 font-mono text-xs">{cat.name}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-right">{cat.count}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-status-amber">
                    {formatCuiabaTime(cat.lastPost)}
                  </td>
                  <td className="py-2 text-right">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-mono font-bold ${
                        cat.status === "ATRASO"
                          ? "bg-status-delay/20 text-status-delay"
                          : "bg-status-ok/20 text-status-ok"
                      }`}
                    >
                      {cat.status}
                    </span>
                  </td>
                </tr>
              ))}
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
