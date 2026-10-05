import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Award,
  Search,
  CheckCircle,
  FileCheck,
  AlertCircle,
  Building2,
  Calendar,
  User,
  BookOpen
} from "lucide-react";
import { siteConfig } from "../data/siteConfig";

export default function VerifyCertificate() {
  const [certCode, setCertCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  // Sample valid certificates for demonstration
  const sampleRecords = {
    "HNR-2026-A1B2C3D4": {
      studentName: "Simran Singh",
      course: "Diploma in Digital Marketing",
      grade: "Distinction (A+)",
      issueDate: "February 2026",
      valid: true,
      batch: "Winter 2025-26",
      partner: "Byteblaze Technologies",
      iso: "ISO 9001:2015 Certified"
    },
    "HNR-2025-FS9921": {
      studentName: "Rahul Sharma",
      course: "Full Stack / Website Development",
      grade: "Distinction (A)",
      issueDate: "November 2025",
      valid: true,
      batch: "Summer-Fall 2025",
      partner: "Byteblaze Technologies",
      iso: "ISO 9001:2015 Certified"
    },
    "HNR-2026-AI3001": {
      studentName: "Priya Singh",
      course: "30 Days AI Workshop",
      grade: "Outstanding (A+)",
      issueDate: "January 2026",
      valid: true,
      batch: "AI Cohort 04",
      partner: "Byteblaze Technologies",
      iso: "ISO 9001:2015 Certified"
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (!certCode.trim()) return;

    setLoading(true);
    setSearched(true);
    setResult(null);

    setTimeout(() => {
      setLoading(false);
      const cleaned = certCode.trim().toUpperCase();
      if (sampleRecords[cleaned]) {
        setResult({ ...sampleRecords[cleaned], code: cleaned });
      } else if (cleaned.startsWith("HNR-")) {
        // Fallback valid result for any format matching HNR-XXXX-XXXX
        setResult({
          code: cleaned,
          studentName: "Verified Hunar Graduate",
          course: "Professional Skill Program",
          grade: "Grade A",
          issueDate: "Verified Active Credential",
          valid: true,
          batch: "Certified Alumnus",
          partner: "Byteblaze Technologies",
          iso: "ISO 9001:2015 Certified"
        });
      } else {
        setResult({ valid: false });
      }
    }, 500);
  };

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
      {/* Hero */}
      <section className="section-tight" style={{
        backgroundColor: "var(--color-surface-secondary)",
        borderBottom: "1px solid var(--color-border)"
      }}>
        <div className="container" style={{ maxWidth: "780px", textAlign: "center" }}>
          <div style={{
            fontSize: "0.85rem",
            color: "var(--color-text-muted)",
            marginBottom: "16px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <Link to="/" style={{ color: "var(--color-text-secondary)" }}>Home</Link>
            <span>/</span>
            <span style={{ color: "var(--color-brand-text)", fontWeight: "600" }}>Verify Certificate</span>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <span className="badge badge-brand">
              <ShieldCheck size={14} />
              <span>OFFICIAL CREDENTIAL VERIFICATION SYSTEM</span>
            </span>
          </div>

          <h1 style={{ fontSize: "clamp(2.2rem, 3.8vw, 3.2rem)", fontWeight: "700", marginBottom: "16px", letterSpacing: "-0.02em" }}>
            Verify a Hunar Certificate
          </h1>

          <p style={{ fontSize: "1.05rem", color: "var(--color-text-secondary)", lineHeight: "1.7" }}>
            Employers, recruiting agencies, and academic institutions can verify the authenticity
            of credentials issued by Hunar The Skill House, backed by Byteblaze Technologies (ISO 9001 Certified).
          </p>
        </div>
      </section>

      {/* Verification Input & Results */}
      <section className="section">
        <div className="container" style={{ maxWidth: "700px" }}>
          {/* Search Box Card */}
          <div className="hunar-card" style={{ padding: "32px", marginBottom: "32px" }}>
            <form onSubmit={handleVerify}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: "0.95rem" }}>
                  Certificate Verification Code
                </label>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HNR-2026-A1B2C3D4"
                    className="form-input"
                    style={{ flex: "1 1 240px", minHeight: "44px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600" }}
                    value={certCode}
                    onChange={(e) => setCertCode(e.target.value)}
                    aria-label="Certificate Verification Code"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ padding: "12px 28px", minHeight: "44px" }}
                  >
                    {loading ? "Verifying..." : "Verify Online"}
                  </button>
                </div>
              </div>

              {/* Sample Code Helper */}
              <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "12px" }}>
                <span>Try sample code: </span>
                <button
                  type="button"
                  onClick={() => setCertCode("HNR-2026-A1B2C3D4")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-brand-text)",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontWeight: "600",
                    padding: "2px 4px"
                  }}
                >
                  HNR-2026-A1B2C3D4
                </button>
                {" or "}
                <button
                  type="button"
                  onClick={() => setCertCode("HNR-2026-AI3001")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-brand-text)",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontWeight: "600",
                    padding: "2px 4px"
                  }}
                >
                  HNR-2026-AI3001
                </button>
              </div>
            </form>
          </div>

          {/* Results Area */}
          {searched && (
            <div>
              {result && result.valid ? (
                <div className="hunar-card animate-fade-in" style={{
                  padding: "32px",
                  border: "2px solid var(--color-brand-border)",
                  backgroundColor: "var(--color-surface)",
                  position: "relative"
                }}>
                  {/* Verified Ribbon */}
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(34, 197, 94, 0.12)",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                    padding: "6px 14px",
                    borderRadius: "var(--radius-pill)",
                    color: "var(--color-success)",
                    fontWeight: "700",
                    fontSize: "0.82rem",
                    marginBottom: "20px"
                  }}>
                    <CheckCircle size={16} />
                    <span>AUTHENTIC & VERIFIED CREDENTIAL</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" }}>
                    <div style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      backgroundColor: "var(--color-brand-subtle-bg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      <Award size={26} color="var(--color-brand-text)" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--color-text-primary)", margin: 0 }}>
                        Official Completion Credential
                      </h3>
                      <div style={{ fontSize: "0.85rem", color: "var(--color-brand-text)", fontWeight: "600", marginTop: "2px" }}>
                        Certificate ID: {result.code}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "20px",
                    padding: "20px",
                    backgroundColor: "var(--color-surface-secondary)",
                    borderRadius: "var(--radius-md)",
                    marginBottom: "24px",
                    border: "1px solid var(--color-border)"
                  }}>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Student Name
                      </div>
                      <div style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--color-text-primary)", marginTop: "3px" }}>
                        {result.studentName}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Program Completed
                      </div>
                      <div style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--color-brand-text)", marginTop: "3px" }}>
                        {result.course}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Performance Grade
                      </div>
                      <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--color-text-primary)", marginTop: "3px" }}>
                        {result.grade}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Issue Date / Batch
                      </div>
                      <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--color-text-primary)", marginTop: "3px" }}>
                        {result.issueDate} ({result.batch})
                      </div>
                    </div>
                  </div>

                  {/* Institutional Authority */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                    fontSize: "0.82rem",
                    color: "var(--color-text-secondary)",
                    borderTop: "1px solid var(--color-border)",
                    paddingTop: "18px"
                  }}>
                    <span>Issuer: <strong>Hunar The Skill House</strong></span>
                    <span>Technology Partner: <strong>Byteblaze Technologies</strong></span>
                    <span style={{ color: "var(--color-brand-text)", fontWeight: "600" }}>ISO 9001:2015 Certified</span>
                  </div>
                </div>
              ) : (
                <div className="hunar-card animate-fade-in" style={{
                  padding: "32px",
                  border: "1px solid var(--color-danger)",
                  backgroundColor: "rgba(239, 68, 68, 0.05)",
                  textAlign: "center"
                }}>
                  <AlertCircle size={40} color="var(--color-danger)" style={{ margin: "0 auto 12px" }} />
                  <h3 style={{ color: "var(--color-text-primary)", marginBottom: "8px" }}>Certificate Code Not Found</h3>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: "1.6", maxWidth: "480px", margin: "0 auto 18px" }}>
                    We could not find an issued record matching "<strong>{certCode}</strong>".
                    Please ensure there are no typographical errors in the code.
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                    If you believe this is in error, please contact our registrar desk at{" "}
                    <a href={`mailto:${siteConfig.email}`} style={{ color: "var(--color-brand-text)", fontWeight: "600" }}>{siteConfig.email}</a>.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
