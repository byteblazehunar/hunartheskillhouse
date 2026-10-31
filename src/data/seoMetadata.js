import { blogData } from "./blogData.js";
import { coursesData } from "./coursesData.js";
import { faqData } from "./faqData.js";
import { siteConfig } from "./siteConfig.js";

export const SITE_URL = "https://hunar.courses";
export const DEFAULT_IMAGE = `${SITE_URL}/logo-light.png`;
const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export const pageMetadata = {
  "/": {
    title: "Skill Courses in Mullanpur Dakha | Hunar The Skill House",
    description: "Practical AI, digital marketing, web development and design courses in Mullanpur Dakha, Ludhiana. ISO 9001:2015 certified with workstation-based training.",
    keywords: "skill development institute Mullanpur, computer courses Mullanpur Dakha, AI course Ludhiana, web development course Ludhiana, digital marketing course Ludhiana, Hunar The Skill House"
  },
  "/courses": {
    title: "AI, Technology & Digital Skills Courses in Ludhiana | Hunar",
    description: "Hunar offers 12 job-ready courses in Mullanpur Dakha: AI, full-stack web development, digital marketing, graphic design and video editing. Each course includes individual workstation access and 1-on-1 mentor guidance.",
    keywords: "courses in Ludhiana, computer institute Mullanpur, AI training Ludhiana, digital marketing course, web development course, graphic design course Ludhiana"
  },
  "/workshop": {
    title: "30 Days AI Workshop in Mullanpur Dakha | Hunar",
    description: "Hunar's 30 Days AI Workshop covers 29 hands-on modules: prompt engineering, HeyGen avatars, Make.com automations, Claude coding and AI agents. No coding required. ISO-certified certificate included.",
    keywords: "AI workshop Mullanpur, 30 days AI workshop Ludhiana, practical artificial intelligence training, AI tools course Punjab"
  },
  "/about": {
    title: "About Hunar The Skill House | Mullanpur Dakha, Ludhiana",
    description: "Hunar The Skill House is a DPIIT-recognized, ISO 9001:2015 certified skill training institute in Mullanpur Dakha, Ludhiana. Founded by Gurlove Malhi, powered by Byteblaze Technologies. Individual workstations, live ad budgets, mentor-led learning.",
    keywords: "Hunar The Skill House about, skill institute Mullanpur Dakha, Gurlove Malhi founder, DPIIT recognized institute Ludhiana"
  },
  "/testimonials": {
    title: "Student Reviews & Experiences | Hunar The Skill House",
    description: "Read verified student reviews from Hunar The Skill House, Mullanpur Dakha. Students share their experiences in digital marketing, AI, web development and design training. 4.9/5 average rating.",
    keywords: "Hunar student reviews, Hunar testimonials Ludhiana, skill courses Mullanpur review, Hunar The Skill House rating"
  },
  "/faq": {
    title: "Courses, Fees & Admission FAQs | Hunar The Skill House",
    description: "Common questions about Hunar The Skill House: What courses are available? How much do they cost? Is placement support provided? What is the certificate? Find answers here.",
    keywords: "Hunar admissions FAQ, course fees Ludhiana, Hunar placement support, skill course certificate Mullanpur, Hunar contact"
  },
  "/blog": {
    title: "AI, Web Dev & Digital Marketing Articles | Hunar The Skill House",
    description: "Practical career and learning articles from Hunar The Skill House faculty in Mullanpur Dakha. Topics include AI tools for beginners, job-ready web development, and digital marketing with AI.",
    keywords: "AI learning articles Ludhiana, web development career guide, digital marketing AI tips, Hunar blog"
  },
  "/careers": {
    title: "Careers at Hunar The Skill House | Join Our Team",
    description: "Explore career opportunities at Hunar The Skill House. Join our team of educators, mentors, creators and operators in Mullanpur Dakha, Ludhiana.",
    keywords: "Hunar careers, jobs at Hunar The Skill House, teaching jobs Ludhiana, mentor jobs Mullanpur Dakha"
  },
  "/contact": {
    title: "Contact Hunar The Skill House | Mullanpur Dakha, Ludhiana",
    description: "Contact Hunar The Skill House: First Floor, UCO Bank, Ferozpur Road, Mullanpur Dakha, Ludhiana. Call +91 94637-95116. Book a free demo class or campus visit Monday–Saturday 9 AM–7 PM.",
    keywords: "contact Hunar Mullanpur, Hunar phone number, skill institute address Ludhiana, book demo class Hunar"
  },
  "/verify": {
    title: "Verify a Hunar Certificate | Hunar The Skill House",
    description: "Verify the authenticity of a Hunar The Skill House certificate online. Enter the certificate verification code to confirm the holder's name, course, and completion date.",
    keywords: "verify Hunar certificate, Hunar certificate verification, ISO certified course certificate Ludhiana"
  },
  "/enroll": {
    title: "Course Enquiry & Enrollment | Hunar The Skill House",
    description: "Enquire about enrolling in a practical skill course at Hunar The Skill House, Mullanpur Dakha. Fill the form or call +91 94637-95116 for course details, batch schedules and fees.",
    keywords: "enroll skill course Ludhiana, Hunar admission enquiry, course fees Mullanpur, Hunar batch schedule"
  },
  "/login": {
    title: "Sign In | Hunar The Skill House",
    description: "Sign in to your authorized Hunar The Skill House account.",
    noindex: true
  },
  "/page/privacy-policy": {
    title: "Privacy Policy | Hunar The Skill House",
    description: "Read how Hunar The Skill House collects, uses and protects your personal information submitted through our website forms and student portal.",
    keywords: "Hunar privacy policy, data protection Hunar"
  },
  "/page/terms-conditions": {
    title: "Terms & Conditions | Hunar The Skill House",
    description: "Read the terms and conditions governing use of the Hunar The Skill House website, courses, certificates and student services.",
    keywords: "Hunar terms and conditions, Hunar website terms"
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
    "@type": ["EducationalOrganization", "LocalBusiness"],
    "@id": ORGANIZATION_ID,
    name: siteConfig.name,
    url: SITE_URL,
    logo: DEFAULT_IMAGE,
    image: DEFAULT_IMAGE,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    priceRange: "₹₹",
    openingHours: ["Mo-Sa 09:00-19:00"],
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.location,
      addressLocality: "Mullanpur Dakha",
      addressRegion: "Punjab",
      postalCode: "141101",
      addressCountry: "IN"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 30.8248,
      longitude: 75.7315
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
        title: `${course.title} Course in Ludhiana | Hunar The Skill House`,
        description: `${course.title} course at Hunar The Skill House, Mullanpur Dakha, Ludhiana. ${course.shortDesc} Duration: ${course.duration}. Mode: ${course.mode}. ISO 9001:2015 certified. Book a free demo class.`,
        keywords: `${course.title} course Ludhiana, ${course.category} course Mullanpur Dakha, ${course.title} training Punjab, ${course.category} training Ludhiana, Hunar ${course.title}`,
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
        description: `${post.excerpt} Published by ${post.author} (${post.authorRole}) at Hunar The Skill House, Mullanpur Dakha. ${post.readTime}.`,
        keywords: [...new Set([post.category, post.title, ...(post.tags || []), "Hunar The Skill House blog", post.author])].join(", "),
        type: "article",
        image: new URL(post.image, SITE_URL).href,
        schema: {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          image: new URL(post.image, SITE_URL).href,
          author: { "@type": "Person", name: post.author },
          datePublished: post.date,
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
