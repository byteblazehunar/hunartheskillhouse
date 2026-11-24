import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";
import { seoLandingPages } from "../data/seoLandingPages";
import { siteConfig } from "../data/siteConfig";

export default function SeoLandingPage() {
  const { pathname } = useLocation();
  const page = seoLandingPages[pathname];

  if (!page) return null;

  return (
    <div style={{ minHeight: "100vh" }}>
      <section className="section-tight" style={{ backgroundColor: "var(--color-surface-secondary)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="container">
          <nav aria-label="Breadcrumb" style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "16px" }}>
            <Link to="/" style={{ color: "var(--color-text-secondary)" }}>Home</Link>
            <span aria-hidden="true" style={{ margin: "0 8px" }}>/</span>
            <Link to="/courses" style={{ color: "var(--color-text-secondary)" }}>Courses</Link>
            <span aria-hidden="true" style={{ margin: "0 8px" }}>/</span>
            <span aria-current="page" style={{ color: "var(--color-brand-text)", fontWeight: 600 }}>{page.h1}</span>
          </nav>
          <span className="badge badge-brand" style={{ marginBottom: "12px" }}>HUNAR THE SKILL HOUSE · LUDHIANA</span>
          <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 3.4rem)", maxWidth: "850px", marginBottom: "16px" }}>{page.h1}</h1>
          <p style={{ fontSize: "1.05rem", color: "var(--color-text-secondary)", maxWidth: "780px", lineHeight: 1.8 }}>{page.intro}</p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "24px" }}>
            <Link className="btn btn-primary" to="/contact" style={{ minHeight: "44px" }}>Ask about a course <ArrowRight size={16} /></Link>
            <a className="btn btn-outline" href={`tel:${siteConfig.phoneRaw}`} style={{ minHeight: "44px" }}><Phone size={16} /> Call {siteConfig.phone}</a>
          </div>
        </div>
      </section>

      <main className="section">
        <div className="container" style={{ maxWidth: "900px" }}>
          {page.sections.map((section) => (
            <section key={section.heading} style={{ marginBottom: "36px" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "14px" }}>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph} style={{ color: "var(--color-text-secondary)", lineHeight: 1.85, marginBottom: "14px" }}>{paragraph}</p>)}
            </section>
          ))}

          <section aria-labelledby="seo-page-faqs" style={{ marginTop: "48px" }}>
            <h2 id="seo-page-faqs" style={{ fontSize: "1.5rem", marginBottom: "18px" }}>Frequently asked questions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {page.faqs.map((faq) => (
                <article key={faq.question} style={{ padding: "20px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
                  <h3 style={{ fontSize: "1.05rem", marginBottom: "8px" }}>{faq.question}</h3>
                  <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.75 }}>{faq.answer}</p>
                </article>
              ))}
            </div>
          </section>

          <nav aria-label="Related course pages" style={{ display: "flex", gap: "12px 20px", flexWrap: "wrap", marginTop: "36px" }}>
            <Link to="/courses">Browse all courses</Link>
            <Link to="/course/diploma-in-digital-marketing">Digital marketing diploma</Link>
            <Link to="/faq">Admissions FAQs</Link>
            <Link to="/contact">Contact Hunar</Link>
          </nav>
        </div>
      </main>
    </div>
  );
}
