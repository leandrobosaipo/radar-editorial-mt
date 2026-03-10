export function portalShort(name: string): string {
  const n = (name || "").toLowerCase();
  if (n.includes("perrengue")) return "PMT";
  if (n.includes("matogrossense")) return "OMT";
  if (n.includes("roo")) return "ROO";
  if (n.includes("norte")) return "PNMT";
  if (n.includes("pantanal")) return "PPMT";
  if (n.includes("folha")) return "AFL";
  return name?.slice(0, 4)?.toUpperCase() || "SITE";
}
