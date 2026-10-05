import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronDown, ChevronUp, HelpCircle, Phone, ArrowRight } from "lucide-react";
import { faqData, faqCategories } from "../data/faqData";
import { siteConfig } from "../data/siteConfig";

export default function FAQPage({ onOpenDemo }) {
  const [selectedCat, setSelectedCat] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIds, setOpenIds] = useState({ f1: true, f2: true });
  const [faqs, setFaqs] = useState(faqData);

  useEffect(() => {
    fetch("/api/faqs")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setFaqs(data);
        }
      })
      .catch(() => {});
  }, []);

  const toggleFAQ = (id) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredFAQs = faqs.filter((item) => {
    const matchesCat = selectedCat === "All" || item.category === selectedCat;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
      {/* Hero */}
      <section className="section-tight" style={{
        backgroundColor: "var(--color-surface-secondary)",
        borderBottom: "1px solid var(--color-border)"
      }}>
        <div className="container">
          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "16px" }}>
            <Link to="/" style={{ color: "var(--color-text-secondary)" }}>Home</Link>
            <span style={{ margin: "0 8px" }}>/</span>
            <span style={{ color: "var(--color-brand-text)", fontWeight: "600" }}>Frequently Asked Questions</span>
          </div>

          <span className="badge badge-brand" style={{ marginBottom: "12px" }}>
            TRANSPARENT ADMISSIONS
          </span>

          <h1 style={{ fontSize: "clamp(2.2rem, 3.8vw, 3.2rem)", fontWeight: "700", marginBottom: "16px", letterSpacing: "-0.02em" }}>
            Frequently Asked Questions
          </h1>

          <p style={{
            fontSize: "1.05rem",
            color: "var(--color-text-secondary)",
            maxWidth: "700px",
            lineHeight: "1.7"
          }}>
            Find quick, transparent answers about our course structure, batch timings,
            practical lab training, fee installment plans, and certification verification in Mullanpur Dakha.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section style={{
        padding: "20px 0",
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)"
      }}>
        <div className="container">
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px"
          }}>
            {/* Search Input */}
            <div style={{ position: "relative", flex: "1 1 300px", maxWidth: "420px" }}>
              <Search
                size={18}
                color="var(--color-text-secondary)"
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                placeholder="Search questions (e.g. fees, certificate, timings)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "42px", minHeight: "44px" }}
                aria-label="Search frequently asked questions"
              />
            </div>

            {/* Category Filter */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} role="group" aria-label="FAQ categories">
              {faqCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  style={{
                    padding: "8px 18px",
                    minHeight: "44px",
                    borderRadius: "var(--radius-pill)",
                    border: "1px solid",
                    borderColor: selectedCat === cat ? "var(--color-brand)" : "var(--color-border)",
                    backgroundColor: selectedCat === cat ? "var(--color-brand-subtle-bg)" : "var(--color-surface-secondary)",
                    color: selectedCat === cat ? "var(--color-brand-text)" : "var(--color-text-secondary)",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all var(--transition-fast)"
                  }}
                  aria-pressed={selectedCat === cat}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion List */}
      <section className="section">
        <div className="container" style={{ maxWidth: "860px" }}>
          {filteredFAQs.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "60px 20px",
              backgroundColor: "var(--color-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)"
            }}>
              <HelpCircle size={40} color="var(--color-brand-text)" style={{ marginBottom: "14px" }} />
              <h3 style={{ color: "var(--color-text-primary)", marginBottom: "8px" }}>No matching answers found</h3>
              <p style={{ color: "var(--color-text-secondary)", marginBottom: "20px" }}>
                Can't find what you're looking for? Reach out directly to our counselor.
              </p>
              <a
                href={siteConfig.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
                style={{ minHeight: "44px", display: "inline-flex", alignItems: "center" }}
              >
                Ask on WhatsApp
              </a>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filteredFAQs.map((faq) => {
                const isOpen = !!openIds[faq.id];
                return (
                  <div
                    key={faq.id}
                    style={{
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid",
                      borderColor: isOpen ? "var(--color-brand-border)" : "var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      overflow: "hidden",
                      transition: "all var(--transition-fast)"
                    }}
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-ans-${faq.id}`}
                      style={{
                        width: "100%",
                        minHeight: "56px",
                        padding: "18px 24px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "16px",
                        background: "none",
                        border: "none",
                        color: "var(--color-text-primary)",
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: "1.02rem",
                        fontWeight: "600"
                      }}
                    >
                      <span>{faq.question}</span>
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: isOpen ? "var(--color-brand)" : "var(--color-surface-secondary)",
                        color: isOpen ? "var(--color-brand-on)" : "var(--color-text-secondary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}>
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>

                    {isOpen && (
                      <div
                        id={`faq-ans-${faq.id}`}
                        style={{
                          padding: "0 24px 22px 24px",
                          color: "var(--color-text-secondary)",
                          fontSize: "0.94rem",
                          lineHeight: "1.75",
                          borderTop: "1px solid var(--color-border)",
                          paddingTop: "16px"
                        }}
                      >
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Direct Help Strip */}
          <div style={{
            marginTop: "60px",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "36px",
            textAlign: "center"
          }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "8px" }}>
              Still have a question?
            </h3>
            <p style={{ color: "var(--color-text-secondary)", maxWidth: "560px", margin: "0 auto 24px", fontSize: "0.95rem" }}>
              Our counselors in Mullanpur Dakha are available Monday to Saturday to answer queries on phone or WhatsApp.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
              <button onClick={() => onOpenDemo()} className="btn btn-primary" style={{ minHeight: "44px" }}>
                <span>Book Free Demo Class</span>
                <ArrowRight size={16} />
              </button>
              <a
                href={`tel:${siteConfig.phone}`}
                className="btn btn-outline"
                style={{ minHeight: "44px" }}
              >
                <Phone size={16} color="var(--color-brand-text)" />
                <span>Call {siteConfig.phone}</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
