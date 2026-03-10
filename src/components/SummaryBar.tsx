interface Props {
  totalPublications: number;
  activePortals: number;
  delayedCategories: number;
  activeJournalists: number;
}

export function SummaryBar({ totalPublications, activePortals, delayedCategories, activeJournalists }: Props) {
  const items = [
    { label: "Publicações", value: totalPublications },
    { label: "Portais Ativos", value: activePortals },
    { label: "Categorias em Atraso", value: delayedCategories, isDelay: true },
    { label: "Jornalistas Ativos", value: activeJournalists },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 px-4 py-4 md:grid-cols-4 md:px-8">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-border bg-card p-4"
        >
          <p className="text-xs font-sans text-muted-foreground uppercase tracking-wider">
            {item.label}
          </p>
          <p className={`mt-1 text-2xl font-mono font-bold ${item.isDelay && item.value > 0 ? "text-status-delay" : "text-foreground"}`}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
