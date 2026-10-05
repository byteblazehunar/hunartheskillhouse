import React, { useState, useEffect } from "react";
import { X, CheckCircle, ShieldCheck } from "lucide-react";
import { coursesData } from "../data/coursesData";
import { siteConfig } from "../data/siteConfig";

export default function InquiryModal({ isOpen, onClose, preselectedCourseTitle = "" }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    course: preselectedCourseTitle || "",
    timing: "Morning Batch (10:00 AM - 1:00 PM)",
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (preselectedCourseTitle) {
      setFormData((prev) => ({ ...prev, course: preselectedCourseTitle }));
    }
  }, [preselectedCourseTitle]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
      setSubmitted(false);
      setErrorMsg("");
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMsg("Please provide your name and contact phone number.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    const newLead = {
      id: "lead-" + Date.now(),
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      course: formData.course || "General Inquiry",
      preferredTiming: formData.timing,
      message: formData.message.trim(),
      status: "New",
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Send to Node backend API
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLead)
      });
    } catch (err) {
      console.warn("Node API offline, falling back to local storage:", err);
    }

    try {
      // 2. Sync to browser localStorage for Admin Panel offline/client compatibility
      const currentLeads = JSON.parse(localStorage.getItem("hunar_leads") || "[]");
      localStorage.setItem("hunar_leads", JSON.stringify([newLead, ...currentLeads]));
      window.dispatchEvent(new Event("hunar_data_changed"));
    } catch (err) {
      console.warn("Error saving to localStorage:", err);
    }

    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "var(--color-overlay)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="animate-fade-in"
        data-lenis-prevent
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          width: "100%",
          maxWidth: "480px",
          padding: "32px 28px",
          position: "relative",
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "var(--shadow-xl)"
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "var(--color-surface-secondary)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-secondary)",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all var(--transition-fast)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--color-brand-border)";
            e.currentTarget.style.color = "var(--color-text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border)";
            e.currentTarget.style.color = "var(--color-text-secondary)";
          }}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "16px 8px" }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "rgba(45, 138, 78, 0.1)",
              border: "2px solid var(--color-success)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 18px"
            }}>
              <CheckCircle size={28} color="var(--color-success)" />
            </div>

            <h3 style={{ fontSize: "1.35rem", marginBottom: "10px" }}>
              Request Received!
            </h3>
            <p style={{ fontSize: "0.92rem", lineHeight: "1.65", marginBottom: "20px" }}>
              Thank you, <strong>{formData.name}</strong>. Our counselor will call you at{" "}
              <strong style={{ color: "var(--color-brand-text)" }}>{formData.phone}</strong>{" "}
              within 24 hours to confirm your free demo for{" "}
              <strong>{formData.course || "your chosen program"}</strong>.
            </p>

            <div style={{
              background: "var(--color-surface-secondary)",
              borderRadius: "var(--radius-md)",
              padding: "14px",
              marginBottom: "20px",
              textAlign: "left",
              fontSize: "0.82rem",
              border: "1px solid var(--color-border)"
            }}>
              <div style={{ fontWeight: "600", marginBottom: "4px", color: "var(--color-text-primary)" }}>
                Campus Location
              </div>
              <div style={{ color: "var(--color-text-secondary)" }}>
                {siteConfig.location}
              </div>
              <div style={{ color: "var(--color-text-muted)", marginTop: "4px" }}>
                Helpline: {siteConfig.phone}
              </div>
            </div>

            <button onClick={onClose} className="btn btn-primary btn-full">
              Done
            </button>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: "20px" }}>
              <div style={{
                fontSize: "0.72rem",
                fontWeight: "600",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-brand-text)",
                marginBottom: "6px"
              }}>
                Free 1-on-1 Consultation
              </div>
              <h3 id="modal-title" style={{ fontSize: "1.35rem", fontWeight: "700", marginBottom: "6px" }}>
                Book Your Free Demo Class
              </h3>
              <p style={{ fontSize: "0.88rem", color: "var(--color-text-secondary)" }}>
                Experience our practical lab environment and talk to mentors before deciding.
              </p>
            </div>

            {errorMsg && (
              <div style={{
                background: "rgba(197, 48, 48, 0.08)",
                border: "1px solid var(--color-danger)",
                color: "var(--color-danger)",
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                fontSize: "0.85rem",
                marginBottom: "14px"
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
                  placeholder="e.g. Jaspreet Singh"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 98765 43210"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Program of Interest</label>
                <select
                  className="form-select"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                >
                  <option value="">— Choose Program —</option>
                  {coursesData.map((c) => (
                    <option key={c.id} value={c.title}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div className="form-group">
                  <label className="form-label">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="name@email.com"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Timing</label>
                  <select
                    className="form-select"
                    value={formData.timing}
                    onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                  >
                    <option value="Morning Batch (10:00 AM - 1:00 PM)">Morning</option>
                    <option value="Afternoon Batch (2:00 PM - 5:00 PM)">Afternoon</option>
                    <option value="Evening Batch (5:00 PM - 7:00 PM)">Evening</option>
                    <option value="Weekend / Flexible">Weekend</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Questions (Optional)</label>
                <textarea
                  placeholder="Tell us what you want to achieve..."
                  className="form-textarea"
                  rows="2"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-full"
                style={{
                  marginTop: "6px",
                  padding: "13px",
                  minHeight: "48px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.95rem"
                }}
              >
                {loading ? "Processing..." : "Confirm Free Demo Booking"}
              </button>

              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                marginTop: "12px",
                fontSize: "0.75rem",
                color: "var(--color-text-muted)"
              }}>
                <ShieldCheck size={13} />
                <span>Your information is confidential. No spam.</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
