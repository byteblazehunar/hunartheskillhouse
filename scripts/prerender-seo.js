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
import { blogData } from "../src/data/blogData.js";
import { coursesData } from "../src/data/coursesData.js";
import { faqData } from "../src/data/faqData.js";
import { siteConfig } from "../src/data/siteConfig.js";
import { testimonialsData } from "../src/data/testimonialsData.js";

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

function renderCourseCard(course) {
  return `<li><h3><a href="/course/${escapeHtml(course.slug)}">${escapeHtml(course.title)}</a></h3><p>${escapeHtml(course.shortDesc)}</p><p>${escapeHtml(course.duration)} · ${escapeHtml(course.mode)}</p></li>`;
}

function renderHomeContent() {
  const courseList = coursesData.map(renderCourseCard).join("");
  const socialLinks = Object.entries(siteConfig.socials)
    .map(([name, url]) => `<li><a href="${escapeHtml(url)}" rel="noopener noreferrer">${escapeHtml(name)}</a></li>`)
    .join("");

  return `<main class="seo-prerender" style="max-width:1120px;margin:0 auto;padding:48px 24px;line-height:1.7">
    <article>
      <h1>Practical AI &amp; Technology Courses in Mullanpur Dakha</h1>
      <p>Hunar The Skill House is a practical skill development institute in Mullanpur Dakha, Ludhiana, Punjab. We offer training in artificial intelligence, web development, digital marketing, graphic design, video editing and other technology skills. The institute focuses on guided practice and projects so learners can apply course concepts while building useful skills.</p>
      <p>Our programs serve students, graduates, working professionals and business owners looking to develop digital capabilities. Training takes place at our campus on Ferozpur Road in Mullanpur Dakha. Course availability, duration and curriculum vary by program; review each course page or contact Hunar for current details rather than relying on outdated schedules.</p>
      <h2>Explore practical skill courses</h2>
      <p>Hunar’s course directory covers beginner-friendly and advanced learning options across technology and digital business. Topics include AI tools and workflow automation, front-end and back-end development, full-stack web projects, search engine optimization, paid advertising, social media growth, visual design and motion graphics. Program pages provide an outline of the learning areas and practical activities.</p>
      <ul>${courseList}</ul>
      <h2>Learn by building and practising</h2>
      <p>Practical learning at Hunar combines instructor guidance with individual workstations, lab exercises and projects. Learners work through tasks related to their chosen subject, such as building web interfaces, preparing campaign materials, exploring AI workflows or creating design and video assets. A project-led approach helps students connect concepts with examples they can explain and include in a portfolio.</p>
      <p>The institute also offers a 30 Days AI Workshop for people who want an introduction to practical AI tools and use cases. The workshop covers topics such as prompt writing, AI assistants, content creation, research and automation. No single tool or workflow is right for every role, so learners practise choosing tools to fit specific tasks.</p>
      <h2>Choosing a course</h2>
      <p>Before enrolling, compare the course subject, level, duration, mode and curriculum with your goals. Beginners can ask about prerequisites and available batches; experienced learners may want to focus on a specific skill area. Hunar provides course enquiries and demo-class information so prospective learners can ask questions before making a decision. Placement assistance may be available, but outcomes depend on individual skills, project work and employer requirements.</p>
      <h2>Visit or contact Hunar The Skill House</h2>
      <p>Hunar The Skill House is located at ${escapeHtml(siteConfig.location)}. Call <a href="tel:${escapeHtml(siteConfig.phoneRaw)}">${escapeHtml(siteConfig.phone)}</a> or email <a href="mailto:${escapeHtml(siteConfig.email)}">${escapeHtml(siteConfig.email)}</a> for current course information. You can also read more <a href="/about">about the institute</a>, browse <a href="/courses">all courses</a>, review <a href="/faq">frequently asked questions</a>, or use the <a href="/contact">contact page</a> to plan a campus visit.</p>
      <h2>Official social profiles</h2>
      <ul>${socialLinks}</ul>
    </article>
  </main>`;
}

function renderCourseContent(course, pathname) {
  const highlights = course.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const projects = (course.projects || [])
    .map((project) => `<li><strong>${escapeHtml(project.title)}:</strong> ${escapeHtml(project.desc)}</li>`)
    .join("");
  const relatedCourses = coursesData
    .filter((item) => item.slug !== course.slug)
    .slice(0, 4)
    .map((item) => `<li><a href="/course/${escapeHtml(item.slug)}">${escapeHtml(item.title)}</a></li>`)
    .join("");
  return `<main class="seo-prerender" style="max-width:1120px;margin:0 auto;padding:48px 24px;line-height:1.7">
    <article>
      <p>${escapeHtml(course.category)} · ${escapeHtml(course.level)}</p>
      <h1>${escapeHtml(course.title)}${pathname === "/workshop" ? "" : " Course"}</h1>
      <p>${escapeHtml(course.shortDesc)}</p>
      <p>${escapeHtml(course.tagline || "")}</p>
      <p>Duration: ${escapeHtml(course.duration)}. Learning mode: ${escapeHtml(course.mode)}. Hunar The Skill House is in Mullanpur Dakha, Ludhiana. Contact the institute to confirm current batches, availability and course terms.</p>
      <h2>Topics and practical learning</h2>
      <ul>${highlights}</ul>
      ${projects ? `<h2>Example projects</h2><ul>${projects}</ul>` : ""}
      <p>Explore the <a href="/courses">full course directory</a>, read the <a href="/faq">course and admissions FAQs</a>, or <a href="/contact">contact Hunar</a> to discuss this program. Course details can change; confirm the current curriculum and fees directly with the institute.</p>
      <h2>Related courses</h2>
      <ul>${relatedCourses}</ul>
      <a href="/enroll?course=${escapeHtml(course.slug)}">Ask about this course</a>
    </article>
  </main>`;
}

function renderStaticContent(pathname, page) {
  if (pathname === "/") return renderHomeContent();

  if (pathname === "/courses") {
    return `<main class="seo-prerender" style="max-width:1120px;margin:0 auto;padding:48px 24px;line-height:1.7"><h1>Practical Skill Courses in Ludhiana</h1><p>${escapeHtml(page.description)} Browse course subjects, formats and durations below. Contact Hunar to confirm current availability and admission details.</p><ul>${coursesData.map(renderCourseCard).join("")}</ul><p>Questions about choosing a program? Read our <a href="/faq">frequently asked questions</a> or <a href="/contact">contact the admissions team</a>.</p></main>`;
  }

  if (pathname === "/workshop") {
    const workshop = coursesData.find((course) => course.slug === "30-days-ai-workshop");
    if (workshop) return renderCourseContent(workshop, pathname);
  }

  if (pathname.startsWith("/course/")) {
    const course = coursesData.find((item) => item.slug === pathname.slice("/course/".length));
    if (course) return renderCourseContent(course, pathname);
  }

  if (pathname === "/blog") {
    const articles = blogData.map((post) => `<li><h2><a href="/blog/${escapeHtml(post.slug)}">${escapeHtml(post.title)}</a></h2><p>${escapeHtml(post.excerpt)}</p></li>`).join("");
    return `<main class="seo-prerender" style="max-width:900px;margin:0 auto;padding:48px 24px;line-height:1.7"><h1>Learning and Career Articles</h1><p>${escapeHtml(page.description)}</p><ul>${articles}</ul><p>Browse <a href="/courses">Hunar courses</a> or learn more <a href="/about">about the institute</a>.</p></main>`;
  }

  if (pathname.startsWith("/blog/")) {
    const post = blogData.find((item) => item.slug === pathname.slice("/blog/".length));
    if (post) {
      const paragraphs = post.content.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
      return `<main class="seo-prerender" style="max-width:900px;margin:0 auto;padding:48px 24px;line-height:1.7"><article><p>${escapeHtml(post.category)} · ${escapeHtml(post.date)} · ${escapeHtml(post.readTime)}</p><h1>${escapeHtml(post.title)}</h1><p>${escapeHtml(post.excerpt)}</p>${paragraphs}<p>Explore related <a href="/courses">courses at Hunar</a> or <a href="/contact">contact the institute</a>.</p></article></main>`;
    }
  }

  if (pathname === "/faq") {
    const questions = faqData.map(({ question, answer }) => `<section><h2>${escapeHtml(question)}</h2><p>${escapeHtml(answer)}</p></section>`).join("");
    return `<main class="seo-prerender" style="max-width:900px;margin:0 auto;padding:48px 24px;line-height:1.7"><h1>Course and Admission FAQs</h1><p>${escapeHtml(page.description)}</p>${questions}<p>For questions not covered here, <a href="/contact">contact Hunar The Skill House</a>.</p></main>`;
  }

  if (pathname === "/about") {
    return `<main class="seo-prerender" style="max-width:900px;margin:0 auto;padding:48px 24px;line-height:1.7"><h1>About Hunar The Skill House</h1><p>Hunar The Skill House is a practical skill development institute in Mullanpur Dakha, Ludhiana, powered by Byteblaze Technologies. Its training approach connects guided instruction with lab practice and projects across technology, artificial intelligence and digital business.</p><h2>Practical training in Mullanpur Dakha</h2><p>The campus is at ${escapeHtml(siteConfig.location)}. Programs include digital marketing, web development, AI, graphic design and video editing. Program content and availability vary; use the <a href="/courses">course directory</a> to review details and <a href="/contact">contact the institute</a> with questions.</p><h2>Learning support</h2><p>Hunar’s stated approach emphasizes guided practice, individual workstations and project work. Learners can ask about course prerequisites, curriculum, batch schedules and certificate requirements before enrolling. Placement support, where available, does not guarantee employment.</p><p>Learn about <a href="/workshop">AI training</a>, browse <a href="/blog">learning articles</a>, or review <a href="/faq">frequently asked questions</a>.</p></main>`;
  }

  if (pathname === "/testimonials") {
    const quotes = testimonialsData.map((item) => `<blockquote><p>“${escapeHtml(item.quote)}”</p><footer>${escapeHtml(item.name)} · ${escapeHtml(item.course)}</footer></blockquote>`).join("");
    return `<main class="seo-prerender" style="max-width:900px;margin:0 auto;padding:48px 24px;line-height:1.7"><h1>Student Experiences at Hunar</h1><p>${escapeHtml(page.description)}</p>${quotes}<p>Experiences are individual. Learn about the <a href="/courses">courses</a> or <a href="/contact">ask Hunar a question</a>.</p></main>`;
  }

  if (pathname === "/contact") {
    return `<main class="seo-prerender" style="max-width:900px;margin:0 auto;padding:48px 24px;line-height:1.7"><h1>Contact Hunar The Skill House</h1><p>${escapeHtml(page.description)}</p><h2>Campus address</h2><address>${escapeHtml(siteConfig.location)}<br>${escapeHtml(siteConfig.landmark)}</address><h2>Contact details</h2><p>Phone: <a href="tel:${escapeHtml(siteConfig.phoneRaw)}">${escapeHtml(siteConfig.phone)}</a><br>Email: <a href="mailto:${escapeHtml(siteConfig.email)}">${escapeHtml(siteConfig.email)}</a><br>Hours: ${escapeHtml(siteConfig.officeHours.weekdays)}; ${escapeHtml(siteConfig.officeHours.sunday)}</p><p>See available <a href="/courses">courses</a> or review <a href="/faq">admission FAQs</a>.</p></main>`;
  }

  if (pathname === "/enroll") {
    return `<main class="seo-prerender" style="max-width:900px;margin:0 auto;padding:48px 24px;line-height:1.7"><h1>Course Enquiry and Enrollment</h1><p>${escapeHtml(page.description)}</p><p>Review the <a href="/courses">course directory</a> and contact Hunar to ask about current schedules, availability, fees, prerequisites and enrollment steps. Course terms may vary by program and batch.</p><p>Call <a href="tel:${escapeHtml(siteConfig.phoneRaw)}">${escapeHtml(siteConfig.phone)}</a> or email <a href="mailto:${escapeHtml(siteConfig.email)}">${escapeHtml(siteConfig.email)}</a>.</p></main>`;
  }

  if (pathname === "/verify") {
    return `<main class="seo-prerender" style="max-width:900px;margin:0 auto;padding:48px 24px;line-height:1.7"><h1>Verify a Hunar Certificate</h1><p>${escapeHtml(page.description)}</p><p>Use the certificate verification form on this page and enter the verification code printed on the certificate. If you need help, <a href="/contact">contact Hunar The Skill House</a>.</p></main>`;
  }

  if (pathname === "/page/privacy-policy" || pathname === "/page/terms-conditions") {
    return `<main class="seo-prerender" style="max-width:900px;margin:0 auto;padding:48px 24px;line-height:1.7"><h1>${escapeHtml(page.title.replace(/\s\|\sHunar.*$/, ""))}</h1><p>${escapeHtml(page.description)}</p><p>This information applies to Hunar The Skill House and its public website. For questions about this page, <a href="/contact">contact the institute</a>.</p></main>`;
  }

  const heading = page.noindex ? "Authorized Access" : page.title.replace(/\s\|\sHunar.*$/, "");
  return `<main class="seo-prerender" style="max-width:900px;margin:0 auto;padding:48px 24px;line-height:1.7"><h1>${escapeHtml(heading)}</h1><p>${escapeHtml(page.description)}</p></main>`;
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
  const rootPattern = /<div id="root">[\s\S]*?<\/div>/i;
  if (!rootPattern.test(html)) {
    throw new Error(`Unable to find the React root while prerendering ${pathname}.`);
  }
  html = html.replace(rootPattern, `<div id="root">${renderStaticContent(pathname, page)}</div>`);
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
