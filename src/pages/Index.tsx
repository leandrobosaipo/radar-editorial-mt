import { useDashboardData } from "@/hooks/useDashboardData";
import { GlobalStatusBar } from "@/components/GlobalStatusBar";
import { SummaryBar } from "@/components/SummaryBar";
import { PortalCard } from "@/components/PortalCard";
import { AuditTable } from "@/components/AuditTable";
import { EmptyState } from "@/components/EmptyState";

const Index = () => {
  const { data, isLoading, isError } = useDashboardData();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="animate-pulse font-mono text-muted-foreground">Carregando dados...</p>
      </div>
    );
  }

  if (isError || !data || data.portals.length === 0) {
    return (
      <div className="min-h-screen">
        <GlobalStatusBar lastUpdate={new Date().toISOString()} />
        <EmptyState />
      </div>
    );
  }

  const totalPublications = data.portals.reduce((s, p) => s + p.totalPublications, 0);
  const activePortals = data.portals.length;
  const delayedCategories = data.portals.reduce(
    (s, p) => s + p.categories.filter((c) => c.status === "ATRASO").length,
    0
  );
  const allJournalists = new Set(data.portals.flatMap((p) => p.journalists.map((j) => j.name)));

  return (
    <div className="min-h-screen">
      <GlobalStatusBar lastUpdate={data.lastUpdate} />

      <div className="container mx-auto max-w-7xl">
        <SummaryBar
          totalPublications={totalPublications}
          activePortals={activePortals}
          delayedCategories={delayedCategories}
          activeJournalists={allJournalists.size}
        />

        <div className="space-y-6 px-4 py-4 md:px-8">
          {data.portals.map((portal) => (
            <PortalCard key={portal.name} portal={portal} />
          ))}
        </div>
      </div>

      <AuditTable entries={data.audit} />
    </div>
  );
};

export default Index;
