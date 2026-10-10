import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  DEFAULT_IMAGE,
  getPageMetadata,
  getStructuredData,
  isPrivateSeoPath,
  SITE_URL
} from "../data/seoMetadata";

function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

export default function SeoManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = getPageMetadata(pathname);
    const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
    const canonicalUrl = `${SITE_URL}${normalizedPath}`;
    const robots = page.noindex || isPrivateSeoPath(pathname)
      ? "noindex, nofollow"
      : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
    const image = page.image || DEFAULT_IMAGE;

    document.title = page.title;
    setMeta("name", "description", page.description);
    setMeta("name", "keywords", page.keywords || "Hunar The Skill House, Mullanpur Dakha, Ludhiana");
    setMeta("name", "robots", robots);
    setMeta("property", "og:title", page.title);
    setMeta("property", "og:description", page.description);
    setMeta("property", "og:type", page.type || "website");
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:image", image);
    setMeta("property", "og:image:alt", page.title);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", page.title);
    setMeta("name", "twitter:description", page.description);
    setMeta("name", "twitter:image", image);
    setMeta("name", "twitter:image:alt", page.title);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    document.head.querySelector('script[data-page-schema="true"]')?.remove();
    const structuredData = getStructuredData(page);
    if (structuredData) {
      const schemaScript = document.createElement("script");
      schemaScript.type = "application/ld+json";
      schemaScript.dataset.pageSchema = "true";
      schemaScript.textContent = JSON.stringify(structuredData).replace(/</g, "\\u003c");
      document.head.appendChild(schemaScript);
    }
  }, [pathname]);

  return null;
}
