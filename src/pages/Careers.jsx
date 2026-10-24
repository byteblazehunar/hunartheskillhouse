import React from "react";
import { ExternalLink, BriefcaseBusiness, Users, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const JOB_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSc4fO7sXsfYKwRdItHOzMlioiZUtN65aKoVHY6iKptOT-IowA/viewform?pli=1";

export default function Careers() {
  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
      <section className="section-tight" style={{ backgroundColor: "var(--color-surface-secondary)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="container">
          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "16px" }}>
            <Link to="/" style={{ color: "var(--color-text-secondary)" }}>Home</Link>
            <span style={{ margin: "0 8px" }}>/</span>
            <span style={{ color: "var(--color-brand-text)", fontWeight: "600" }}>Careers</span>
          </div>
          <div className="eyebrow">Grow with Hunar</div>
          <h1 style={{ fontSize: "clamp(2.3rem, 5vw, 4.2rem)", maxWidth: "820px", marginBottom: "18px" }}>
            Build the next generation of skilled professionals.
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "1.08rem", lineHeight: "1.75", maxWidth: "700px" }}>
            We are looking for educators, mentors, creators and operators who care about practical learning and meaningful careers.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: "18px", marginBottom: "42px" }}>
            {[
              [BriefcaseBusiness, "Purpose-led work", "Work on programs that turn curiosity into employable skills."],
              [Users, "People-first culture", "Learn with a team that values ownership, respect and collaboration."],
              [Sparkles, "Keep growing", "Bring your perspective and keep sharpening your craft with us."]
            ].map(([Icon, title, description]) => (
              <div key={title} className="hunar-card" style={{ padding: "24px" }}>
                <Icon size={24} color="var(--color-brand-text)" aria-hidden="true" />
                <h2 style={{ fontSize: "1.05rem", margin: "16px 0 8px" }}>{title}</h2>
                <p style={{ color: "var(--color-text-secondary)", lineHeight: "1.6", fontSize: "0.92rem", margin: 0 }}>{description}</p>
              </div>
            ))}
          </div>

          <div className="hunar-card" style={{ padding: "clamp(20px, 4vw, 42px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", flexWrap: "wrap", marginBottom: "24px" }}>
              <div>
                <div className="eyebrow">Open opportunities</div>
                <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", margin: "8px 0" }}>Apply to join Hunar</h2>
                <p style={{ color: "var(--color-text-secondary)", lineHeight: "1.6", margin: 0, maxWidth: "650px" }}>
                  Complete our job application form below. Your response goes directly to the Hunar hiring team.
                </p>
              </div>
              <a className="btn btn-outline" href={JOB_FORM_URL} target="_blank" rel="noopener noreferrer">
                Open in new tab <ExternalLink size={16} />
              </a>
            </div>
            <div style={{ border: "1px solid var(--color-brand-border)", borderRadius: "var(--radius-lg)", padding: "clamp(24px, 5vw, 48px)", background: "var(--color-surface-secondary)", textAlign: "center" }}>
              <div style={{ width: "56px", height: "56px", display: "grid", placeItems: "center", margin: "0 auto 18px", borderRadius: "50%", background: "var(--color-brand-subtle-bg)", color: "var(--color-brand-text)" }}>
                <BriefcaseBusiness size={26} aria-hidden="true" />
              </div>
              <h3 style={{ fontSize: "clamp(1.2rem, 3vw, 1.6rem)", marginBottom: "10px" }}>Ready to take the next step?</h3>
              <p style={{ color: "var(--color-text-secondary)", lineHeight: "1.65", maxWidth: "540px", margin: "0 auto 22px" }}>
                Our secure Google application form opens in a new tab so it works reliably on every device.
              </p>
              <a className="btn btn-primary" href={JOB_FORM_URL} target="_blank" rel="noopener noreferrer">
                Apply now <ExternalLink size={16} />
              </a>
            </div>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.82rem", margin: "14px 0 0", textAlign: "center" }}>
              The application form opens securely in a new tab.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
