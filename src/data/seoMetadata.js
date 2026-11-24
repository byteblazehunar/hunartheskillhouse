import { blogData } from "./blogData.js";
import { coursesData } from "./coursesData.js";
import { faqData } from "./faqData.js";
import { seoLandingPages } from "./seoLandingPages.js";
import { siteConfig } from "./siteConfig.js";

export const SITE_URL = "https://hunar.courses";
export const DEFAULT_IMAGE = `${SITE_URL}/logo-light.png`;
const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export const pageMetadata = {
  "/": {
    title: "AI, Digital Marketing & Web Courses | Hunar Ludhiana",
    description: "Learn AI, digital marketing, web development and design at Hunar The Skill House in Mullanpur Dakha, Ludhiana. Explore courses and book a free demo.",
    keywords: "skill development institute Mullanpur, computer courses Mullanpur Dakha, AI course Ludhiana, web development course Ludhiana, digital marketing course Ludhiana, Hunar The Skill House"
  },
  "/courses": {
    title: "Skill Development Courses in Ludhiana | Hunar",
    description: "Explore 12 practical courses in AI, web development, digital marketing, design and more at Hunar's Mullanpur Dakha campus. Compare programs and book a demo.",
    keywords: "courses in Ludhiana, computer institute Mullanpur, AI training Ludhiana, digital marketing course, web development course, graphic design course Ludhiana"
  },
  "/workshop": {
    title: "30-Day AI Workshop in Ludhiana | Hunar",
    description: "Explore Hunar's hands-on 30-day AI workshop in Mullanpur Dakha, covering prompt writing, AI media and automation. Ask about the next batch.",
    keywords: "AI workshop Mullanpur, 30 days AI workshop Ludhiana, practical artificial intelligence training, AI tools course Punjab"
  },
  "/about": {
    title: "About Hunar The Skill House | Ludhiana",
    description: "Meet Hunar The Skill House, a practical skills institute in Mullanpur Dakha, Ludhiana. Learn about our campus, training approach and programs.",
    keywords: "Hunar The Skill House about, skill institute Mullanpur Dakha, Gurlove Malhi founder, DPIIT recognized institute Ludhiana"
  },
  "/testimonials": {
    title: "Student Experiences | Hunar The Skill House",
    description: "Read student experiences with digital marketing, AI, web development and design training at Hunar The Skill House in Mullanpur Dakha, Ludhiana.",
    keywords: "Hunar student reviews, Hunar testimonials Ludhiana, skill courses Mullanpur review, Hunar The Skill House rating"
  },
  "/faq": {
    title: "Course, Fees & Admission FAQs | Hunar",
    description: "Find answers about Hunar courses, fees, batch timings, practical training and certificates. Contact our Mullanpur Dakha team for current details.",
    keywords: "Hunar admissions FAQ, course fees Ludhiana, Hunar placement support, skill course certificate Mullanpur, Hunar contact"
  },
  "/blog": {
    title: "AI, Marketing & Career Articles | Hunar",
    description: "Explore practical learning and career articles from Hunar The Skill House faculty in Mullanpur Dakha, Ludhiana.",
    keywords: "AI learning articles Ludhiana, web development career guide, digital marketing AI tips, Hunar blog"
  },
  "/careers": {
    title: "Careers at Hunar The Skill House | Ludhiana",
    description: "Explore career opportunities with Hunar The Skill House's educators, mentors and team in Mullanpur Dakha, Ludhiana.",
    keywords: "Hunar careers, jobs at Hunar The Skill House, teaching jobs Ludhiana, mentor jobs Mullanpur Dakha"
  },
  "/contact": {
    title: "Contact Hunar The Skill House | Ludhiana",
    description: `Visit Hunar The Skill House in Mullanpur Dakha, Ludhiana. Call ${siteConfig.phone} to ask about courses, current fees or a campus visit.`,
    keywords: "contact Hunar Mullanpur, Hunar phone number, skill institute address Ludhiana, book demo class Hunar"
  },
  "/verify": {
    title: "Verify a Hunar Certificate | Online",
    description: "Check a Hunar The Skill House certificate using its verification code. Contact the institute if you need help confirming certificate details.",
    keywords: "verify Hunar certificate, Hunar certificate verification, ISO certified course certificate Ludhiana"
  },
  "/enroll": {
    title: "Course Enquiry & Enrollment | Hunar",
    description: "Ask about courses, batch schedules and current fees at Hunar The Skill House in Mullanpur Dakha, Ludhiana.",
    noindex: true
  },
  "/login": {
    title: "Sign In | Hunar The Skill House",
    description: "Sign in to your authorized Hunar The Skill House account.",
    noindex: true
  },
  "/page/privacy-policy": {
    title: "Privacy Policy | Hunar The Skill House",
    description: "Learn how Hunar The Skill House handles information submitted through its website forms and student portal.",
    keywords: "Hunar privacy policy, data protection Hunar"
  },
  "/page/terms-conditions": {
    title: "Terms & Conditions | Hunar The Skill House",
    description: "Review the terms for using the Hunar The Skill House website, courses, certificates and student services.",
    keywords: "Hunar terms and conditions, Hunar website terms"
  },
  ...Object.fromEntries(Object.entries(seoLandingPages).map(([pathname, page]) => [pathname, {
    title: page.title,
    description: page.description,
    keywords: page.keywords || ""
  }]))
};

export const privateSeoPaths = [
  "/login",
  "/enroll",
  "/admin",
  "/portal/student",
  "/portal/staff",
  "/portal/admin",
  "/portal/operations",
  "/operations"
];

export function isPrivateSeoPath(pathname) {
  return pathname === "/login" ||
    pathname === "/enroll" ||
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

export function getCourseFaqs(course) {
  return [
    {
      question: `How long is the ${course.title} course?`,
      answer: `The published duration is ${course.duration}. Contact Hunar to confirm the schedule and current batch availability.`
    },
    {
      question: `What does the ${course.title} course cover?`,
      answer: `${course.title} covers practical topics including ${(course.highlights || []).slice(0, 3).join(", ")}. Review the course page for its full curriculum and project details.`
    },
    {
      question: `What are the fees for the ${course.title} course?`,
      answer: `Fees vary by program and batch. Contact Hunar at ${siteConfig.phone} to request current fee details and ask about any installment options before enrolling.`
    },
    {
      question: `Where is the ${course.title} course held?`,
      answer: `Hunar The Skill House is located at ${siteConfig.location}. Ask the team to confirm the learning mode for your chosen batch.`
    }
  ];
}

function getRawPageMetadata(pathname) {
  if (pathname.startsWith("/course/")) {
    const slug = pathname.slice("/course/".length);
    const course = coursesData.find((item) => item.slug === slug);
    if (course) {
      const description = `${course.title} training in Mullanpur Dakha, Ludhiana. ${course.duration}, practical projects and mentor guidance. Explore the curriculum and ask about a demo.`;
      const faqs = getCourseFaqs(course);
      return {
        title: `${course.title} Course | Hunar Ludhiana`,
        description,
        image: new URL(course.image, SITE_URL).href,
        keywords: `${course.title} course Ludhiana, ${course.category} course Mullanpur Dakha, ${course.title} training Punjab`,
        schema: {
          "@context": "https://schema.org",
          "@type": "Course",
          name: course.title,
          description: course.shortDesc,
          provider: { "@id": ORGANIZATION_ID },
          url: `${SITE_URL}${pathname}`,
          inLanguage: "en-IN",
          educationalLevel: course.level,
          courseMode: "onsite",
          teaches: (course.highlights || []).slice(0, 6)
        },
        additionalSchemas: [{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map(({ question, answer }) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: { "@type": "Answer", text: answer }
          }))
        }],
        faqs
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
          publisher: { "@id": ORGANIZATION_ID },
          mainEntityOfPage: `${SITE_URL}${pathname}`
        }
      };
    }
  }

  const landingPage = seoLandingPages[pathname];
  if (landingPage) {
    const page = { ...pageMetadata[pathname] };
    page.schema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: landingPage.h1,
      description: landingPage.description,
      url: `${SITE_URL}${pathname}`,
      inLanguage: "en-IN",
      publisher: { "@id": ORGANIZATION_ID }
    };
    page.additionalSchemas = [{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: landingPage.faqs.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer }
      }))
    }];
    page.faqs = landingPage.faqs;
    return page;
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

function limitMetadataText(value, limit) {
  const text = String(value || "").trim();
  if (text.length <= limit) return text;
  const shortened = text.slice(0, limit - 1);
  const lastSpace = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, lastSpace > 0 ? lastSpace : shortened.length)}…`;
}

function getBreadcrumbSchema(pathname, pageTitle) {
  if (pathname === "/") return null;
  const parts = pathname.split("/").filter(Boolean);
  const items = [{ name: "Home", url: SITE_URL }];

  if (parts[0] === "course" && parts[1]) {
    const course = coursesData.find((item) => item.slug === parts[1]);
    items.push({ name: "Courses", url: `${SITE_URL}/courses` });
    items.push({ name: course?.title || pageTitle, url: `${SITE_URL}${pathname}` });
  } else if (parts[0] === "blog" && parts[1]) {
    const post = blogData.find((item) => item.slug === parts[1]);
    items.push({ name: "Articles", url: `${SITE_URL}/blog` });
    items.push({ name: post?.title || pageTitle, url: `${SITE_URL}${pathname}` });
  } else {
    items.push({ name: pageTitle, url: `${SITE_URL}${pathname}` });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function getPageMetadata(pathname) {
  const page = getRawPageMetadata(pathname);
  const title = limitMetadataText(page.title, 65);
  const description = limitMetadataText(page.description, 158);
  const breadcrumb = getBreadcrumbSchema(pathname, title);
  return {
    ...page,
    title,
    description,
    ...(breadcrumb ? { additionalSchemas: [...(page.additionalSchemas || []), breadcrumb] } : {})
  };
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
  const isOrganizationSchema = page.schema["@id"] === ORGANIZATION_ID;
  const schemas = [
    ...(isOrganizationSchema ? [] : [page.schema]),
    ...(page.additionalSchemas || [])
  ];
  return {
    "@context": "https://schema.org",
    "@graph": [organizationSchema(), websiteSchema, ...schemas].map((item) =>
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
