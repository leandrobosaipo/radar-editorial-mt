import { useEffect } from "react";

type Props = {
  title: string;
  description: string;
  canonicalPath: string;
  imagePath?: string;
  robots?: string;
  jsonLd?: Record<string, any>;
};

const BASE_URL = "https://leandrobosaipo.github.io/radar-editorial-mt";

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
}

export function SeoMeta({ title, description, canonicalPath, imagePath, robots, jsonLd }: Props) {
  useEffect(() => {
    document.title = title;

    const canonicalHref = `${BASE_URL}${canonicalPath}`;
    const imageUrl = imagePath ? `${BASE_URL}${imagePath}` : undefined;

    upsertMeta('meta[name="description"]', { name: "description", content: description });
    if (robots) upsertMeta('meta[name="robots"]', { name: "robots", content: robots });

    upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonicalHref });

    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });

    if (imageUrl) {
      upsertMeta('meta[property="og:image"]', { property: "og:image", content: imageUrl });
      upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: imageUrl });
    }

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalHref;

    const id = "jsonld-agenda-wall";
    const old = document.getElementById(id);
    if (old) old.remove();

    if (jsonLd) {
      const script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      const script = document.getElementById(id);
      if (script) script.remove();
    };
  }, [title, description, canonicalPath, imagePath, robots, jsonLd]);

  return null;
}
