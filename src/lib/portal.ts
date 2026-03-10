export function portalShort(name: string, url?: string): string {
  const n = (name || "").toLowerCase();
  const u = (url || "").toLowerCase();
  const text = `${n} ${u}`;

  if (text.includes("perrengue")) return "PMT";
  if (text.includes("matogrossense")) return "OMT";
  if (text.includes("roo")) return "ROO";
  if (text.includes("norte")) return "PNMT";
  if (text.includes("pantanal")) return "PPMT";
  if (text.includes("afolhalivre") || text.includes("folha") || text.includes("primavera do leste")) return "AFL";
  return (name || "SITE").slice(0, 4).toUpperCase();
}

export function portalRank(name: string, url?: string): number {
  const code = portalShort(name, url);
  const order: Record<string, number> = { PMT: 1, OMT: 2, ROO: 3, PNMT: 4, PPMT: 5, AFL: 6 };
  return order[code] || 99;
}
