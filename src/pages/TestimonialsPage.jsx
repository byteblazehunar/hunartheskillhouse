import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, ArrowRight } from "lucide-react";
import { testimonialsData } from "../data/testimonialsData";

export default function TestimonialsPage({ onOpenDemo }) {
  const [testimonials, setTestimonials] = useState(testimonialsData);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setTestimonials(data);
        }
      })
      .catch(() => {});
  }, []);

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
            <span style={{ color: "var(--color-brand-text)", fontWeight: "600" }}>Testimonials</span>
          </div>

          <div className="eyebrow">
            Learner Feedback
          </div>

          <h1 style={{ fontSize: "clamp(2.2rem, 3.8vw, 3.2rem)", fontWeight: "700", marginBottom: "16px" }}>
            Student Stories & Genuine Reviews
          </h1>

          <p style={{
            fontSize: "1.05rem",
            color: "var(--color-text-secondary)",
            maxWidth: "740px",
            lineHeight: "1.7"
          }}>
            Real, verified feedback from students and alumni about their learning journey,
            hands-on lab workstation training, and mentor support at Hunar The Skill House.
          </p>
        </div>
      </section>

      {/* Genuine Testimonials Grid */}
      <section className="section bg-section-alt" style={{
        borderTop: "1px solid var(--color-border)"
      }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 44px" }}>
            <div className="eyebrow">
              Learner Experiences
            </div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", marginBottom: "12px" }}>
              What Our Students Say
            </h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem" }}>
              Genuine feedback from students and alumni about their learning journey at Hunar.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "28px"
          }}>
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="hunar-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "30px 26px"
                }}
              >
                <div style={{ display: "flex", gap: "4px", marginBottom: "16px" }}>
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={15} fill="#D4A017" color="#D4A017" />
                  ))}
                </div>

                <p style={{
                  fontSize: "0.95rem",
                  color: "var(--color-text-primary)",
                  lineHeight: "1.75",
                  fontStyle: "italic",
                  marginBottom: "24px",
                  flexGrow: 1
                }}>
                  "{item.quote}"
                </p>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  borderTop: "1px solid var(--color-border)",
                  paddingTop: "16px"
                }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-brand-subtle-bg)",
                    border: "1px solid var(--color-brand-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    color: "var(--color-brand-text)",
                    fontSize: "0.88rem"
                  }}>
                    {item.initials}
                  </div>
                  <div>
                    <h4 style={{ fontSize: "0.95rem", color: "var(--color-text-primary)", marginBottom: "2px" }}>
                      {item.name}
                    </h4>
                    <span style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                      {item.course}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Institutional Final CTA */}
      <section className="section-tight" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "clamp(36px, 5vw, 56px)",
            boxShadow: "var(--shadow-sm)"
          }}>
            <h3 style={{ fontSize: "1.75rem", color: "var(--color-text-primary)", marginBottom: "12px" }}>
              Start Building Your Own Career Success
            </h3>
            <p style={{ color: "var(--color-text-secondary)", maxWidth: "580px", margin: "0 auto 24px", lineHeight: "1.7" }}>
              Book a free demo session to tour our computer lab and discuss course options with our mentors.
            </p>
            <button onClick={() => onOpenDemo()} className="btn btn-primary btn-lg">
              <span>Book Free Demo Class</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
