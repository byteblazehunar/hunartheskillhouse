import { coursesData } from "./coursesData.js";
import { siteConfig } from "./siteConfig.js";

export const faqCategories = [
  "All",
  "Admissions & Enrollment",
  "Courses & Learning",
  "Fees & Payment",
  "Certificates & Placement"
];

export const faqData = [
  {
    id: "f1",
    category: "Courses & Learning",
    question: "Is the training practical or theory-based?",
    answer: "Programs include practical exercises and project work as described in each course curriculum. The Digital Marketing diploma listing describes supervised campaign practice using a ₹10,000 live advertising budget; ask the admissions team to confirm the current terms for your batch."
  },
  {
    id: "f12",
    category: "Courses & Learning",
    question: "What courses and programs does Hunar offer?",
    answer: `The current catalog lists ${coursesData.length} programs: ${coursesData.map((course) => course.title).join(", ")}. Course availability and batch schedules can change, so contact the team to confirm the latest options.`
  },
  {
    id: "f2",
    category: "Certificates & Placement",
    question: "Will I get a certificate after completing the course?",
    answer: "Certificate eligibility and completion requirements depend on the program. Hunar provides an online certificate verification page; ask the admissions team to confirm the certificate terms and verification process for your course."
  },
  {
    id: "f3",
    category: "Certificates & Placement",
    question: "Do you guarantee placement?",
    answer: "Career and placement preparation may be available depending on the program. Ask the admissions team what support is currently included in your chosen course. Training and placement support do not guarantee a job; outcomes depend on your skills, portfolio and employer requirements."
  },
  {
    id: "f4",
    category: "Admissions & Enrollment",
    question: "What are the batch timings?",
    answer: `Batch timings and availability vary. Contact our admissions team at ${siteConfig.phone} to confirm the current schedule for your chosen program.`
  },
  {
    id: "f5",
    category: "Courses & Learning",
    question: "Is the 30 Days AI Workshop suitable for beginners?",
    answer: "The workshop listing describes the program as open to all levels and focuses on practical AI tools. Review the current workshop outline and ask the admissions team whether any specific prerequisites apply to your batch."
  },
  {
    id: "f6",
    category: "Admissions & Enrollment",
    question: "Is there an entrance test for admission?",
    answer: "No entrance test is listed as a requirement. Ask the admissions team whether your chosen program has any prerequisites or recommended experience before you enroll."
  },
  {
    id: "f7",
    category: "Courses & Learning",
    question: "Are classes online or offline?",
    answer: `Course listings show the learning mode for each program. Hunar's campus is at ${siteConfig.location}; contact the team to confirm the delivery mode and facilities for your chosen batch.`
  },
  {
    id: "f8",
    category: "Fees & Payment",
    question: "Can I pay the course fee in installments?",
    answer: "Installment availability and terms can depend on the course and batch. Ask the admissions team for current eligibility, payment dates and any additional charges, and confirm the terms in writing before enrolling."
  },
  {
    id: "f9",
    category: "Fees & Payment",
    question: "How do I find out the exact course fees?",
    answer: `Fees vary by program and batch. Use Book Free Demo or contact Hunar on WhatsApp at ${siteConfig.phone} to request current fee details and confirm any additional charges before enrolling.`
  },
  {
    id: "f10",
    category: "Certificates & Placement",
    question: "How can an employer or student verify a Hunar certificate?",
    answer: "Use the Verify Certificate page and enter the verification code printed on the certificate. If you need help or the record cannot be found, contact Hunar using the details on the Contact page."
  },
  {
    id: "f11",
    category: "Admissions & Enrollment",
    question: "How do I book a free demo session?",
    answer: "Use the Book Free Demo button to submit your program of interest and preferred timing. The admissions team will contact you to confirm availability."
  }
];
