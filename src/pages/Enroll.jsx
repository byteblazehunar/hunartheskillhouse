import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Clock,
  Phone,
  ArrowRight
} from "lucide-react";
import { coursesData } from "../data/coursesData";
import { siteConfig } from "../data/siteConfig";

export default function Enroll() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    course: "Diploma in Digital Marketing",
    timing: "Morning Batch (10:00 AM - 1:00 PM)",
    qualification: "Undergraduate / Graduate",
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMsg("Please fill in your name and phone number.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          course: formData.course,
          preferredTiming: formData.timing,
          message: [formData.qualification, formData.message.trim()].filter(Boolean).join("\n")
        })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Unable to submit your enrollment request. Please try again.");
      }
      setSubmitted(true);
    } catch (err) {
      console.error("Enrollment request submission failed:", err);
      setErrorMsg(err.message || "Unable to reach the admissions service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
      {/* Hero */}
      <section className="section-tight" style={{
        backgroundColor: "var(--color-surface-secondary)",
        borderBottom: "1px solid var(--color-border)"
      }}>
        <div className="container" style={{ maxWidth: "760px", textAlign: "center" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "16px" }}>
            <Link to="/" style={{ color: "var(--color-text-secondary)" }}>Home</Link>
            <span style={{ margin: "0 8px" }}>/</span>
            <span style={{ color: "var(--color-brand-text)", fontWeight: "600" }}>Admissions & Enrollment</span>
          </div>

          <span className="badge badge-brand" style={{ marginBottom: "12px" }}>
            <Sparkles size={12} />
            <span>ADMISSIONS OPEN 2026</span>
          </span>

          <h1 style={{ fontSize: "clamp(2.2rem, 3.8vw, 3.2rem)", fontWeight: "700", marginBottom: "16px", letterSpacing: "-0.02em" }}>
            Enroll at Hunar The Skill House
          </h1>

          <p style={{
            fontSize: "1.05rem",
            color: "var(--color-text-secondary)",
            lineHeight: "1.7"
          }}>
            Secure your seat in our upcoming batches at Mullanpur Dakha. Experience 100% practical lab training,
            dedicated workstations, and placement support.
          </p>
        </div>
      </section>

      {/* Enrollment Form Section */}
      <section className="section">
        <div className="container" style={{ maxWidth: "680px" }}>
          <div className="hunar-card" style={{ padding: "36px 28px" }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "24px 8px" }}>
                <CheckCircle2 size={54} color="var(--color-success)" style={{ margin: "0 auto 16px" }} />
                <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "10px" }}>
                  Enrollment Request Submitted!
                </h2>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: "1.7", marginBottom: "24px" }}>
                  Thank you, <strong>{formData.name}</strong>. An admissions counselor will call you at{" "}
                  <strong style={{ color: "var(--color-brand-text)" }}>{formData.phone}</strong> within 24 hours
                  to confirm your admission, batch timing, and campus orientation details.
                </p>

                <div style={{
                  backgroundColor: "var(--color-surface-secondary)",
                  padding: "18px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  textAlign: "left",
                  fontSize: "0.85rem",
                  marginBottom: "24px"
                }}>
                  <div style={{ color: "var(--color-brand-text)", fontWeight: "700", marginBottom: "4px" }}>
                    Campus Address for Walk-ins:
                  </div>
                  <div style={{ color: "var(--color-text-secondary)" }}>{siteConfig.location}</div>
                  <div style={{ color: "var(--color-text-muted)", marginTop: "4px" }}>Helpline: {siteConfig.phone}</div>
                </div>

                <Link to="/" className="btn btn-primary btn-full" style={{ minHeight: "48px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  Return to Homepage
                </Link>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: "1.35rem", fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "8px" }}>
                  Student Admission Application
                </h3>
                <p style={{ fontSize: "0.88rem", color: "var(--color-text-secondary)", marginBottom: "24px" }}>
                  Please enter your accurate contact details so we can reserve your workstation.
                </p>

                {errorMsg && (
                  <div style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid var(--color-danger)",
                    color: "var(--color-danger)",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.85rem",
                    marginBottom: "16px",
                    fontWeight: "600"
                  }}>
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jaspreet Kaur"
                      className="form-input"
                      style={{ minHeight: "44px" }}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
                    <div className="form-group">
                      <label className="form-label">Phone / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 94637 95116"
                        className="form-input"
                        style={{ minHeight: "44px" }}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        placeholder="name@gmail.com"
                        className="form-input"
                        style={{ minHeight: "44px" }}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Select Program *</label>
                    <select
                      className="form-select"
                      style={{ minHeight: "44px" }}
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    >
                      {coursesData.map((c) => (
                        <option key={c.id} value={c.title}>
                          {c.title} ({c.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
                    <div className="form-group">
                      <label className="form-label">Preferred Batch Timing</label>
                      <select
                        className="form-select"
                        style={{ minHeight: "44px" }}
                        value={formData.timing}
                        onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                      >
                        <option value="Morning Batch (10:00 AM - 1:00 PM)">Morning Batch (10:00 AM - 1:00 PM)</option>
                        <option value="Afternoon Batch (2:00 PM - 5:00 PM)">Afternoon Batch (2:00 PM - 5:00 PM)</option>
                        <option value="Evening Batch (5:00 PM - 7:00 PM)">Evening Batch (5:00 PM - 7:00 PM)</option>
                        <option value="Weekend Special">Weekend Special</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Current Background</label>
                      <select
                        className="form-select"
                        style={{ minHeight: "44px" }}
                        value={formData.qualification}
                        onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      >
                        <option value="10th / 12th Student">10th / 12th Student</option>
                        <option value="College Undergraduate">College Undergraduate</option>
                        <option value="Graduate / Job Seeker">Graduate / Job Seeker</option>
                        <option value="Working Professional">Working Professional</option>
                        <option value="Business Owner">Business Owner</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Any specific questions or goals? (Optional)</label>
                    <textarea
                      className="form-textarea"
                      rows="3"
                      placeholder="Tell us what you want to achieve through this course..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary btn-full"
                    style={{ padding: "14px", marginTop: "10px", minHeight: "48px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                  >
                    {loading ? "Submitting Application..." : "Submit Enrollment Application"}
                  </button>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    marginTop: "16px",
                    fontSize: "0.8rem",
                    color: "var(--color-text-muted)"
                  }}>
                    <ShieldCheck size={14} color="var(--color-brand-text)" />
                    <span>ISO 9001:2015 Quality Verified Institute • No Spam Policy</span>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
