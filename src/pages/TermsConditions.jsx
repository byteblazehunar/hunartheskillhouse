import React from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "../data/siteConfig";

export default function TermsConditions() {
  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
      <section className="section-tight" style={{
        backgroundColor: "var(--color-surface-secondary)",
        borderBottom: "1px solid var(--color-border)"
      }}>
        <div className="container" style={{ maxWidth: "840px" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "16px" }}>
            <Link to="/" style={{ color: "var(--color-text-secondary)" }}>Home</Link>
            <span style={{ margin: "0 8px" }}>/</span>
            <span style={{ color: "var(--color-brand-text)", fontWeight: "600" }}>Terms & Conditions</span>
          </div>

          <h1 style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", fontWeight: "700", marginBottom: "14px", letterSpacing: "-0.02em" }}>
            Terms & Conditions
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem" }}>
            Hunar The Skill House • Powered by Byteblaze Technologies (ISO 9001:2015 Certified)
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: "840px" }}>
          <div className="hunar-card" style={{
            padding: "40px",
            lineHeight: "1.8",
            color: "var(--color-text-primary)",
            fontSize: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "24px"
          }}>
            <section>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "8px" }}>
                1. Institutional Agreement
              </h2>
              <p style={{ color: "var(--color-text-secondary)" }}>
                By accessing this website, enrolling in training tracks, or participating in workshop sessions
                at Hunar The Skill House, you agree to comply with our campus code of conduct, lab workstation
                guidelines, and academic honesty policies.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "8px" }}>
                2. Lab Attendance & Individual Workstation Access
              </h2>
              <p style={{ color: "var(--color-text-secondary)" }}>
                Each enrolled student is allocated an individual computer workstation for practical sessions.
                Students are expected to maintain minimum 80% attendance to qualify for portfolio project reviews,
                mock interviews, and official certificate issuance.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "8px" }}>
                3. Practical Ad Budget Terms (Digital Marketing)
              </h2>
              <p style={{ color: "var(--color-text-secondary)" }}>
                For programs including the ₹10,000 practical advertising budget, funds are disbursed and allocated
                under instructor supervision across approved client ad accounts to test live campaign hypotheses.
                Budget allocations are non-cashable and non-transferable.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "8px" }}>
                4. Placement Support & Best-Effort Assistance
              </h2>
              <p style={{ color: "var(--color-text-secondary)" }}>
                Placement support is provided on a best-effort, merit basis dependent on portfolio completion,
                capstone project evaluation, and interview readiness. Hunar The Skill House provides direct connections,
                interview scheduling, and resume optimization, but does not guarantee employment.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "8px" }}>
                5. Certification Issuance & Online Verification
              </h2>
              <p style={{ color: "var(--color-text-secondary)" }}>
                Certificates are awarded upon successful completion of required project milestones.
                Every credential carries a unique serial code permanently registered on our online verification system.
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
