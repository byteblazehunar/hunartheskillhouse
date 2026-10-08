import { blogData } from "./blogData.js";
import { coursesData } from "./coursesData.js";
import { faqData } from "./faqData.js";
import { siteConfig } from "./siteConfig.js";

export const SITE_URL = "https://www.hunar.courses";
export const DEFAULT_IMAGE = `${SITE_URL}/logo-light.png`;
const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export const pageMetadata = {
  "/": {
    title: "Skill Courses in Mullanpur Dakha | Hunar The Skill House",
    description: "Explore practical AI, web, digital marketing and design courses at Hunar in Mullanpur Dakha, Ludhiana. Learn through guided training and projects.",
    keywords: "skill development institute Mullanpur, computer courses Mullanpur Dakha, AI course Ludhiana, web development course Ludhiana"
  },
  "/courses": {
    title: "AI, Technology & Digital Skills Courses in Ludhiana | Hunar",
    description: "Compare practical courses in AI, full-stack web development, digital marketing, graphic design and video editing at Hunar in Mullanpur Dakha.",
    keywords: "courses in Ludhiana, computer institute Mullanpur, AI training Ludhiana, digital marketing course, web development course"
  },
  "/workshop": {
    title: "Practical AI Workshop in Mullanpur Dakha | Hunar",
    description: "Explore Hunar's hands-on AI workshop in Mullanpur Dakha, Ludhiana, covering practical AI tools, prompts and project-based learning.",
    keywords: "AI workshop Mullanpur, AI course Ludhiana, practical artificial intelligence training"
  },
  "/about": {
    title: "About Hunar The Skill House | Mullanpur Dakha, Ludhiana",
    description: "Learn about Hunar The Skill House, its practical training approach, mentors and campus in Mullanpur Dakha, Ludhiana, Punjab.",
    keywords: "Hunar The Skill House, skill institute Mullanpur, practical training Ludhiana"
  },
  "/testimonials": {
    title: "Student Experiences | Hunar The Skill House, Ludhiana",
    description: "Read learner experiences about practical courses and training at Hunar The Skill House in Mullanpur Dakha, Ludhiana.",
    keywords: "Hunar student reviews, skill courses Ludhiana, Hunar Mullanpur testimonials"
  },
  "/faq": {
    title: "Course & Admission FAQs | Hunar The Skill House",
    description: "Find answers about courses, admissions, fees, certificates and placement support at Hunar The Skill House in Mullanpur Dakha.",
    keywords: "Hunar admissions FAQ, course fees Ludhiana, skill course questions Mullanpur"
  },
  "/blog": {
    title: "Learning & Career Articles | Hunar The Skill House",
    description: "Read practical articles on AI, web development and digital marketing from Hunar The Skill House in Mullanpur Dakha, Ludhiana.",
    keywords: "AI learning articles, web development career, digital marketing insights"
  },
  "/contact": {
    title: "Contact Hunar The Skill House | Mullanpur Dakha, Ludhiana",
    description: "Contact Hunar The Skill House about courses, admissions and demo classes. Visit our campus on Ferozpur Road in Mullanpur Dakha, Ludhiana.",
    keywords: "contact Hunar Mullanpur, skill institute address Ludhiana, course enquiry"
  },
  "/verify": {
    title: "Verify a Hunar Certificate | Hunar The Skill House",
    description: "Check a Hunar The Skill House certificate using its verification code on the official certificate verification page.",
    keywords: "verify Hunar certificate, certificate verification Hunar"
  },
  "/enroll": {
    title: "Course Enquiry & Enrollment | Hunar The Skill House",
    description: "Ask about enrolling in a practical skill course at Hunar The Skill House in Mullanpur Dakha, Ludhiana.",
    keywords: "enroll skill course Ludhiana, Hunar admission, course enquiry Mullanpur"
  },
  "/login": {
    title: "Sign In | Hunar The Skill House",
    description: "Sign in to your authorized Hunar The Skill House account.",
    noindex: true
  },
  "/page/privacy-policy": {
    title: "Privacy Policy | Hunar The Skill House",
    description: "Read how Hunar The Skill House handles website enquiries and personal information.",
    keywords: "Hunar privacy policy"
  },
  "/page/terms-conditions": {
    title: "Terms & Conditions | Hunar The Skill House",
    description: "Read the website and service terms for Hunar The Skill House.",
    keywords: "Hunar terms and conditions"
  }
};

export const privateSeoPaths = [
  "/login",
  "/admin",
  "/portal/student",
  "/portal/staff",
  "/portal/admin",
  "/portal/operations",
  "/operations"
];

export function isPrivateSeoPath(pathname) {
  return pathname === "/login" ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/portal/") ||
    pathname === "/operations" ||
    pathname.startsWith("/operations/") ||
    pathname.startsWith("/activate/");
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": ORGANIZATION_ID,
    name: siteConfig.name,
    url: SITE_URL,
    logo: DEFAULT_IMAGE,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.location,
      addressLocality: "Mullanpur Dakha",
      addressRegion: "Punjab",
      postalCode: "141101",
      addressCountry: "IN"
    },
    sameAs: Object.values(siteConfig.socials)
  };
}

export function getPageMetadata(pathname) {
  if (pathname.startsWith("/course/")) {
    const slug = pathname.slice("/course/".length);
    const course = coursesData.find((item) => item.slug === slug);
    if (course) {
      return {
        title: `${course.title} Course in Ludhiana | Hunar`,
        description: `Learn ${course.title} through practical projects at Hunar in Mullanpur Dakha, Ludhiana.`,
        keywords: `${course.title}, ${course.category} course Ludhiana, ${course.category} training Mullanpur`,
        schema: {
          "@context": "https://schema.org",
          "@type": "Course",
          name: course.title,
          description: course.shortDesc,
          provider: { "@id": ORGANIZATION_ID },
          url: `${SITE_URL}${pathname}`
        }
      };
    }
  }

  if (pathname.startsWith("/blog/")) {
    const slug = pathname.slice("/blog/".length);
    const post = blogData.find((item) => item.slug === slug);
    if (post) {
      return {
        title: `${post.title} | Hunar The Skill House`,
        description: post.excerpt,
        keywords: `${post.category}, ${post.title}, Hunar The Skill House`,
        type: "article",
        schema: {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          image: new URL(post.image, SITE_URL).href,
          author: { "@type": "Person", name: post.author },
          publisher: { "@id": ORGANIZATION_ID },
          mainEntityOfPage: `${SITE_URL}${pathname}`
        }
      };
    }
  }

  const metadata = pageMetadata[pathname];
  if (!metadata) {
    return {
      title: isPrivateSeoPath(pathname) ? "Authorized Access | Hunar The Skill House" : "Page Not Found | Hunar The Skill House",
      description: "This Hunar The Skill House page is not public content.",
      noindex: true
    };
  }

  const page = { ...metadata };
  if (pathname === "/") {
    page.schema = organizationSchema();
  } else if (pathname === "/faq") {
    page.schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqData.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer }
      }))
    };
  } else if (pathname === "/courses") {
    page.schema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Hunar The Skill House Courses",
      itemListElement: coursesData.map((course, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/course/${course.slug}`,
        name: course.title
      }))
    };
  }
  return page;
}

export function getStructuredData(page) {
  if (!page.schema) return null;

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: siteConfig.name,
    url: SITE_URL,
    publisher: { "@id": ORGANIZATION_ID },
    inLanguage: "en-IN"
  };
  const pageSchema = page.schema["@type"] !== "EducationalOrganization"
    ? [page.schema]
    : [];
  return {
    "@context": "https://schema.org",
    "@graph": [organizationSchema(), websiteSchema, ...pageSchema].map((item) =>
      Object.fromEntries(Object.entries(item).filter(([key]) => key !== "@context"))
    )
  };
}

export function getPublicSeoPaths() {
  const staticPaths = Object.keys(pageMetadata).filter((pathname) => !pageMetadata[pathname].noindex);
  const coursePaths = coursesData.map(({ slug }) => `/course/${slug}`);
  const blogPaths = blogData.map(({ slug }) => `/blog/${slug}`);
  return [...new Set([...staticPaths, ...coursePaths, ...blogPaths])];
}
