import { coursesData } from "./coursesData.js";
import { faqData } from "./faqData.js";
import { siteConfig } from "./siteConfig.js";

export const seoLandingPages = {
  "/course-fees-ludhiana": {
    title: "Course Fees & Installments in Ludhiana | Hunar",
    description: "Compare course durations, ask about current fees and installment options, and book a campus visit at Hunar The Skill House in Mullanpur Dakha.",
    h1: "Course Fees & Installment Options",
    intro: "Planning a course is easier when you can compare what you will learn, how long it takes and what the total cost includes. Hunar The Skill House offers practical programs in Mullanpur Dakha, Ludhiana. Fees vary by course, duration and current batch; contact the admissions team for the latest written fee details before enrolling.",
    sections: [
      {
        heading: "Compare course formats before you decide",
        paragraphs: [
          `The published catalog currently includes ${coursesData.length} programs across technology, marketing, creative media and foundational computer skills. Course durations range from a 30-day workshop to multi-month programs. Review each course page for its current duration, learning mode, curriculum, tools and example projects.`,
          "Ask whether the quoted fee covers the full stated curriculum, lab access, required software or materials, assessment and certificate issuance. Confirm any additional charges, payment dates and refund or deferral terms in writing."
        ]
      },
      {
        heading: "Installment questions to ask",
        paragraphs: [
          "Flexible installment arrangements may be available for selected programs. Ask the admissions counselor to confirm eligibility, the amount due at registration, installment dates and whether any fees apply to the arrangement. Do not rely on an old quote or assume that every course uses the same payment plan.",
          "A demo or campus conversation is a good time to discuss your learning goals, prerequisites, timetable and budget together. You can also ask to review the course outline and understand what support is included before making a decision."
        ]
      },
      {
        heading: "Get current course fee details",
        paragraphs: [
          `Call ${siteConfig.phone} or email ${siteConfig.email} with the course name you are considering. You can also use the contact page to request the current fee structure and ask about an available demo. Hunar's campus is at ${siteConfig.location}.`
        ]
      }
    ],
    faqs: [
      {
        question: "Where can I find the current fees for a Hunar course?",
        answer: `Fees vary by program and batch. Contact Hunar at ${siteConfig.phone} or ${siteConfig.email} to request the current fee details in writing before enrolling.`
      },
      {
        question: "Can I pay course fees in installments?",
        answer: faqData.find((item) => item.question === "Can I pay the course fee in installments?")?.answer || "Ask the admissions team whether installments are available for your chosen program and batch, and confirm all payment dates and terms in writing."
      },
      {
        question: "What should I compare besides the course fee?",
        answer: "Compare the curriculum, duration, learning mode, instructor guidance, lab access, project work, certificate terms and any additional costs. Ask for the current details for your chosen batch."
      }
    ]
  },
  "/digital-marketing-course-ludhiana": {
    title: "Digital Marketing Course in Ludhiana | Hunar",
    description: "Explore practical digital marketing training near Ludhiana: SEO, paid ads, analytics and AI tools at Hunar's Mullanpur Dakha campus.",
    h1: "Digital Marketing Course in Ludhiana",
    intro: "Hunar The Skill House offers digital marketing training from its campus in Mullanpur Dakha, Ludhiana. The published programs cover search engine optimization, paid advertising, social media, analytics and AI-supported marketing workflows. Learners can compare the diploma and focused programs in the catalog and ask the admissions team which current batch best fits their experience and goals.",
    sections: [
      {
        heading: "Learn marketing through practical work",
        paragraphs: [
          "Digital marketing combines audience research, useful content, discoverability, campaign execution and measurement. Hunar's published digital marketing curriculum includes keyword research, on-page and technical SEO, local search, Meta and Google Ads, analytics, conversion optimization and campaign reporting. Check the specific program page for its current topics and duration.",
          "The diploma listing describes hands-on campaign exercises and a live advertising budget for students. Ask the institute to confirm the current budget, eligibility, campaign supervision and any terms that apply to your batch before enrolling. Advertising spend is used for supervised learning and does not guarantee sales, leads or a particular marketing result."
        ]
      },
      {
        heading: "Who may benefit from this training?",
        paragraphs: [
          "The subject can suit beginners exploring marketing roles, business owners learning how digital channels work, and professionals adding campaign or analytics skills. Prior experience and entry requirements differ by program; discuss your background with the instructor or admissions counselor before choosing a level.",
          "Practical projects can help learners explain how they approached a brief, selected an audience, built campaign material and interpreted results. A portfolio supports applications and client conversations, but employment and freelance outcomes depend on individual skills, market conditions and employer requirements."
        ]
      },
      {
        heading: "Compare related marketing programs",
        paragraphs: [
          "Hunar's catalog also lists performance marketing, social media growth and Google-focused programs. These courses have related topics but different emphasis. Compare each syllabus and ask which one is intended for broad foundations, a focused specialization or a particular level; don't choose on title alone.",
          `The campus is at ${siteConfig.location}. Prospective learners from Mullanpur Dakha and nearby parts of Ludhiana can contact Hunar to confirm travel details, available batch times, current fees and whether a demo visit can be arranged.`
        ]
      }
    ],
    faqs: [
      {
        question: "Where is the digital marketing training held?",
        answer: `Training is offered at Hunar The Skill House's Mullanpur Dakha campus: ${siteConfig.location}. Contact the institute to confirm the current delivery mode for your chosen batch.`
      },
      {
        question: "What topics are covered in the digital marketing programs?",
        answer: "Published topics include SEO, paid advertising, social media, analytics, conversion optimization and AI-supported marketing workflows. The exact curriculum depends on the program; check its course page and ask for the current syllabus."
      },
      {
        question: "How do I ask about fees and batch timings?",
        answer: `Contact Hunar at ${siteConfig.phone} or visit the contact page to request current fees, available batch timings and a demo appointment.`
      }
    ]
  }
};
