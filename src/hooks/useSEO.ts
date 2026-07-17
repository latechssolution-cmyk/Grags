import { useEffect } from "react";

interface SEOOptions {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
}

const DEFAULT_TITLE = "Grags — Modern Tailoring, Pakistan | Premium Menswear";
const DEFAULT_DESCRIPTION =
  "Premium tailored menswear crafted in Pakistan — shirts, outerwear, and considered essentials built to last. Grags. Modern tailoring, made to move.";
const DEFAULT_IMAGE = "https://grags.shop/og-image.png";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function removeMeta(attr: "name" | "property", key: string) {
  document.querySelector(`meta[${attr}="${key}"]`)?.remove();
}

// Client-side per-page <head> tags for SEO/social previews.
// Resets to site defaults on unmount so the next route isn't stuck with this page's tags.
export function useSEO({ title, description, keywords, image }: SEOOptions) {
  useEffect(() => {
    if (title) {
      document.title = title;
      upsertMeta("property", "og:title", title);
      upsertMeta("name", "twitter:title", title);
    }
    if (description) {
      upsertMeta("name", "description", description);
      upsertMeta("property", "og:description", description);
      upsertMeta("name", "twitter:description", description);
    }
    if (keywords && keywords.length > 0) {
      upsertMeta("name", "keywords", keywords.join(", "));
    }
    if (image) {
      upsertMeta("property", "og:image", image);
      upsertMeta("name", "twitter:image", image);
    }

    return () => {
      document.title = DEFAULT_TITLE;
      upsertMeta("property", "og:title", DEFAULT_TITLE);
      upsertMeta("name", "twitter:title", DEFAULT_TITLE);
      upsertMeta("name", "description", DEFAULT_DESCRIPTION);
      upsertMeta("property", "og:description", DEFAULT_DESCRIPTION);
      upsertMeta("name", "twitter:description", DEFAULT_DESCRIPTION);
      removeMeta("name", "keywords");
      upsertMeta("property", "og:image", DEFAULT_IMAGE);
      upsertMeta("name", "twitter:image", DEFAULT_IMAGE);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, keywords?.join(","), image]);
}
