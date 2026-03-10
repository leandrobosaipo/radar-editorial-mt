export function EmptyState() {
  const now = new Date().toISOString();
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="font-mono text-lg text-muted-foreground">
        [ SEM DADOS — {now} ]
      </p>
    </div>
  );
}
