import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DEFAULT_IMAGE,
  getPageMetadata,
  getPublicSeoPaths,
  getStructuredData,
  isPrivateSeoPath,
  privateSeoPaths,
  SITE_URL
} from "../src/data/seoMetadata.js";

const outputDirectory = path.resolve("dist");
const template = await readFile(path.join(outputDirectory, "index.html"), "utf8");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function upsertMeta(html, attribute, name, content) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<meta\\s+${attribute}=["']${escapedName}["'][^>]*>`, "i");
  const tag = `<meta ${attribute}="${escapeHtml(name)}" content="${escapeHtml(content)}" />`;
  return pattern.test(html)
    ? html.replace(pattern, tag)
    : html.replace("</head>", `    ${tag}\n  </head>`);
}

function renderPage(pathname) {
  const page = getPageMetadata(pathname);
  const canonicalUrl = `${SITE_URL}${pathname === "/" ? "/" : pathname.replace(/\/+$/, "")}`;
  const robots = page.noindex || isPrivateSeoPath(pathname)
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
  const image = page.image || DEFAULT_IMAGE;
  let html = template.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(page.title)}</title>`);

  for (const [attribute, name, content] of [
    ["name", "description", page.description],
    ["name", "keywords", page.keywords || "Hunar The Skill House, Mullanpur Dakha, Ludhiana"],
    ["name", "robots", robots],
    ["property", "og:title", page.title],
    ["property", "og:description", page.description],
    ["property", "og:type", page.type || "website"],
    ["property", "og:url", canonicalUrl],
    ["property", "og:image", image],
    ["name", "twitter:card", "summary_large_image"],
    ["name", "twitter:title", page.title],
    ["name", "twitter:description", page.description],
    ["name", "twitter:image", image]
  ]) {
    html = upsertMeta(html, attribute, name, content);
  }

  const canonicalPattern = /<link\s+rel=["']canonical["'][^>]*>/i;
  const canonicalTag = `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`;
  html = canonicalPattern.test(html)
    ? html.replace(canonicalPattern, canonicalTag)
    : html.replace("</head>", `    ${canonicalTag}\n  </head>`);

  const structuredData = getStructuredData(page);
  if (structuredData) {
    const script = `<script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>`;
    html = html.replace("</head>", `    ${script}\n  </head>`);
  }
  return html;
}

async function writeRoute(pathname) {
  const routeSegments = pathname.split("/").filter(Boolean);
  const routeDirectory = path.join(outputDirectory, ...routeSegments);
  await mkdir(routeDirectory, { recursive: true });
  await writeFile(path.join(routeDirectory, "index.html"), renderPage(pathname));
}

const publicPaths = getPublicSeoPaths();
const privatePaths = [...privateSeoPaths, "/activate/account"];
for (const pathname of [...publicPaths, ...privatePaths]) {
  await writeRoute(pathname);
}

const sitemapEntries = publicPaths
  .map((pathname) => `  <url><loc>${SITE_URL}${pathname === "/" ? "/" : pathname}</loc></url>`)
  .join("\n");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`;
await writeFile(path.join(outputDirectory, "sitemap.xml"), sitemap);

console.log(`Generated SEO HTML for ${publicPaths.length} public routes and ${privatePaths.length} noindex routes.`);
