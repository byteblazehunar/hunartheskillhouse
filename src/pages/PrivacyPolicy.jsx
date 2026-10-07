import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { siteConfig } from "../data/siteConfig";

export default function PrivacyPolicy() {
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
            <span style={{ color: "var(--color-brand-text)", fontWeight: "600" }}>Privacy Policy</span>
          </div>

          <h1 style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", fontWeight: "700", marginBottom: "14px", letterSpacing: "-0.02em" }}>
            Privacy Policy
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem" }}>
            Last Updated: March 2026 • Hunar The Skill House, Mullanpur Dakha, Ludhiana
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
                1. Overview and Commitment
              </h2>
              <p style={{ color: "var(--color-text-secondary)" }}>
                Hunar The Skill House ("we", "our", or "us"), an initiative powered by Byteblaze Technologies,
                is dedicated to protecting the privacy and personal data of our students, website visitors, and program enrollees.
                This Privacy Policy outlines how we collect, store, and utilize your information when you access https://www.hunar.courses
                or interact with our campus representatives in Mullanpur Dakha, Ludhiana.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "8px" }}>
                2. Information We Collect
              </h2>
              <p style={{ color: "var(--color-text-secondary)" }}>
                We collect personal information that you provide voluntarily when booking a free demo class,
                submitting an enrollment inquiry, verifying a certificate, or contacting our counselor desk.
                This includes: Full Name, Phone / WhatsApp Number, Email Address, Program of Interest, and Educational Background.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "8px" }}>
                3. Purpose of Processing
              </h2>
              <p style={{ color: "var(--color-text-secondary)" }}>
                Your data is processed strictly for:
              </p>
              <ul style={{ paddingLeft: "20px", color: "var(--color-text-secondary)", marginTop: "8px" }}>
                <li>Confirming demo class slots and scheduling campus visits.</li>
                <li>Transmitting curriculum outlines, batch schedules, and fee receipts.</li>
                <li>Registering certificate credentials with our ISO 9001:2015 verification registry.</li>
                <li>Facilitating placement drives and internship coordination with partner tech companies.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "8px" }}>
                4. Data Protection & Non-Disclosure
              </h2>
              <p style={{ color: "var(--color-text-secondary)" }}>
                We do NOT sell, rent, or lease student information to third-party marketing companies.
                All records are retained on secure cloud infrastructure managed by Byteblaze Technologies with
                role-based encryption.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "8px" }}>
                5. Contacting the Grievance Officer
              </h2>
              <p style={{ color: "var(--color-text-secondary)" }}>
                If you have questions regarding this privacy policy or wish to request data correction, contact:
                <br />
                <strong>Registrar, Hunar The Skill House</strong><br />
                First Floor, UCO Bank, Ferozpur Road, Mullanpur Dakha, Ludhiana – 141101<br />
                Email: byteblaze.hunar@gmail.com | Phone: +91 94637-95116
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
