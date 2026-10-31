import React from "react";
import SectionHeading from "./SectionHeading";
import { ScrollReveal, ScrollItem } from "./ScrollReveal";

export default function LearningJourney() {
  const steps = [
    {
      number: "01",
      title: "Learn Core Fundamentals",
      desc: "Grasp foundational concepts through clear, mentor-led explanations without academic fluff."
    },
    {
      number: "02",
      title: "Practice in the Lab",
      desc: "Work on daily guided exercises directly in professional software and development tools."
    },
    {
      number: "03",
      title: "Build Real Projects",
      desc: "Deploy live campaigns with ₹10K budgets or architect full-stack applications from scratch."
    },
    {
      number: "04",
      title: "Curate Your Portfolio",
      desc: "Document live case studies on GitHub and Behance that prove your actual capabilities."
    },
    {
      number: "05",
      title: "Launch Your Career",
      desc: "Prepare with mock interviews, ATS resume tuning, and direct placement support across India."
    }
  ];

  return (
    <section className="section bg-section-alt">
      <div className="container">
        <ScrollReveal stagger={0.08}>
          <ScrollItem>
            <SectionHeading
              kicker="Our Practical Philosophy"
              title="How You Learn At Hunar"
              subtitle="We replace passive tutorial watching with active engineering, live creative execution, and direct feedback."
            />
          </ScrollItem>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "2px",
            position: "relative"
          }} className="journey-grid">
            {steps.map((step, idx) => (
              <ScrollItem
                key={idx}
                style={{
                  padding: "28px 20px",
                  backgroundColor: "var(--color-surface)",
                  borderRadius: idx === 0 ? "var(--radius-lg) 0 0 var(--radius-lg)" :
                                 idx === steps.length - 1 ? "0 var(--radius-lg) var(--radius-lg) 0" : "0",
                  position: "relative"
                }}
              >
                <div style={{
                  fontSize: "1.8rem",
                  fontWeight: "700",
                  fontFamily: "var(--font-heading)",
                  color: "var(--color-brand-text)",
                  opacity: 0.6,
                  lineHeight: 1,
                  marginBottom: "14px",
                  letterSpacing: "-0.02em"
                }}>
                  {step.number}
                </div>

                <h3 style={{
                  fontSize: "1rem",
                  marginBottom: "8px",
                  color: "var(--color-text-primary)"
                }}>
                  {step.title}
                </h3>

                <p style={{
                  fontSize: "0.85rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: "1.6"
                }}>
                  {step.desc}
                </p>
              </ScrollItem>
            ))}
          </div>
        </ScrollReveal>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .journey-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .journey-grid > div {
            border-radius: 0 !important;
          }
          .journey-grid > div:first-child {
            border-radius: var(--radius-lg) 0 0 0 !important;
          }
          .journey-grid > div:nth-child(2) {
            border-radius: 0 var(--radius-lg) 0 0 !important;
          }
        }
        @media (max-width: 560px) {
          .journey-grid {
            grid-template-columns: 1fr !important;
          }
          .journey-grid > div {
            border-radius: 0 !important;
          }
          .journey-grid > div:first-child {
            border-radius: var(--radius-lg) var(--radius-lg) 0 0 !important;
          }
          .journey-grid > div:last-child {
            border-radius: 0 0 var(--radius-lg) var(--radius-lg) !important;
          }
        }
      `}</style>
    </section>
  );
}
