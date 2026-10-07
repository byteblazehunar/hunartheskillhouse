import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  ShieldCheck,
  Building2
} from "lucide-react";
import { siteConfig } from "../data/siteConfig";
import { coursesData } from "../data/coursesData";
import { useTheme } from "../context/ThemeContext";

export default function Contact() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    course: "",
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [emailWarning, setEmailWarning] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMsg("Please fill in your name and phone number.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    const newLead = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      course: formData.course || "Contact Page Inquiry",
      message: formData.message.trim(),
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLead)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Unable to submit your inquiry. Please try again.");
      }
      setEmailWarning(result.emailSent ? "" : result.message);
      setSubmitted(true);
    } catch (err) {
      console.error("Contact inquiry submission failed:", err);
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
        <div className="container">
          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "16px" }}>
            <Link to="/" style={{ color: "var(--color-text-secondary)" }}>Home</Link>
            <span style={{ margin: "0 8px" }}>/</span>
            <span style={{ color: "var(--color-brand-text)", fontWeight: "600" }}>Contact & Campus</span>
          </div>

          <div className="eyebrow">
            Talk to an Academic Counselor
          </div>

          <h1 style={{ fontSize: "clamp(2.2rem, 3.8vw, 3.2rem)", fontWeight: "700", marginBottom: "16px" }}>
            Get in Touch With Hunar
          </h1>

          <p style={{
            fontSize: "1.05rem",
            color: "var(--color-text-secondary)",
            maxWidth: "700px",
            lineHeight: "1.7"
          }}>
            Visit our state-of-the-art computer training campus on Ferozpur Road in Mullanpur Dakha,
            or contact us by phone or WhatsApp to book your free demo class.
          </p>
        </div>
      </section>

      {/* Main Contact Grid */}
      <section className="section">
        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "40px"
          }}>
            {/* Left: Contact Info & Hours */}
            <div>
              <div className="hunar-card" style={{ padding: "36px", marginBottom: "30px" }}>
                <h2 style={{ fontSize: "1.4rem", color: "var(--color-text-primary)", marginBottom: "24px" }}>
                  Campus Details
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "22px", fontSize: "0.95rem" }}>
                  <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <div style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--color-brand-subtle-bg)",
                      border: "1px solid var(--color-brand-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      <MapPin size={20} color="var(--color-brand-text)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "4px" }}>Our Location</div>
                      <div style={{ color: "var(--color-text-secondary)", lineHeight: "1.5" }}>
                        {siteConfig.location}
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginTop: "4px" }}>
                        Landmark: {siteConfig.landmark}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <div style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--color-brand-subtle-bg)",
                      border: "1px solid var(--color-brand-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      <Phone size={20} color="var(--color-brand-text)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "4px" }}>Phone Helpline</div>
                      <a href={`tel:${siteConfig.phone}`} style={{ color: "var(--color-brand-text)", fontWeight: "700", fontSize: "1.05rem" }}>
                        {siteConfig.phone}
                      </a>
                      <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginTop: "2px" }}>
                        Available Mon–Sat: 9:00 AM – 7:00 PM IST
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <div style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--color-brand-subtle-bg)",
                      border: "1px solid var(--color-brand-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      <Mail size={20} color="var(--color-brand-text)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "4px" }}>Email Address</div>
                      <a href={`mailto:${siteConfig.email}`} style={{ color: "var(--color-text-secondary)" }}>
                        {siteConfig.email}
                      </a>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <div style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--color-brand-subtle-bg)",
                      border: "1px solid var(--color-brand-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      <Clock size={20} color="var(--color-brand-text)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "4px" }}>Office Hours</div>
                      <div style={{ color: "var(--color-text-secondary)" }}>{siteConfig.officeHours.weekdays}</div>
                      <div style={{ color: "var(--color-text-muted)", fontSize: "0.82rem" }}>{siteConfig.officeHours.sunday}</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "30px", paddingTop: "24px", borderTop: "1px solid var(--color-border)" }}>
                  <a
                    href={siteConfig.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp btn-full"
                  >
                    Chat on WhatsApp Directly
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Interactive Message Form */}
            <div>
              <div className="hunar-card" style={{ padding: "36px" }}>
                <h2 style={{ fontSize: "1.4rem", color: "var(--color-text-primary)", marginBottom: "8px" }}>
                  Send an Inquiry
                </h2>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", marginBottom: "24px" }}>
                  Fill in your details and an academic counselor will get in touch with you shortly.
                </p>

                {submitted ? (
                  <div style={{ textAlign: "center", padding: "30px 10px" }}>
                    <CheckCircle2 size={50} color="var(--color-success)" style={{ margin: "0 auto 16px" }} />
                    <h3 style={{ fontSize: "1.4rem", color: "var(--color-text-primary)", marginBottom: "8px" }}>
                      Message Sent!
                    </h3>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "20px" }}>
                      Thank you for contacting Hunar The Skill House. Our team will review your message
                      and respond to <strong>{formData.phone}</strong> within 24 hours.
                    </p>
                    {emailWarning && (
                      <p role="status" style={{ color: "var(--color-danger)", fontSize: "0.85rem", marginBottom: "16px" }}>
                        {emailWarning}
                      </p>
                    )}
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setEmailWarning("");
                        setFormData({ name: "", phone: "", email: "", course: "", message: "" });
                      }}
                      className="btn btn-outline"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {errorMsg && (
                      <div style={{
                        background: "rgba(197, 48, 48, 0.1)",
                        border: "1px solid var(--color-danger)",
                        color: "var(--color-danger)",
                        padding: "10px 14px",
                        borderRadius: "var(--radius-md)",
                        fontSize: "0.85rem",
                        marginBottom: "16px",
                        fontWeight: "500"
                      }}>
                        {errorMsg}
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Your full name"
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
                        placeholder="e.g. 94637 95116"
                        className="form-input"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        placeholder="yourname@gmail.com"
                        className="form-input"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Program Interested In</label>
                      <select
                        className="form-select"
                        value={formData.course}
                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      >
                        <option value="">-- Select Course --</option>
                        {coursesData.map((c) => (
                          <option key={c.id} value={c.title}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">How can we help you?</label>
                      <textarea
                        className="form-textarea"
                        rows="4"
                        placeholder="Ask about batch timings, fees, demo classes, syllabus..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary btn-full"
                      style={{ padding: "14px" }}
                    >
                      {loading ? "Sending..." : "Send Message"}
                    </button>

                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      marginTop: "14px",
                      fontSize: "0.78rem",
                      color: "var(--color-text-muted)"
                    }}>
                      <ShieldCheck size={14} color="var(--color-brand-text)" />
                      <span>Privacy guaranteed. We respond strictly by phone/email.</span>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Embedded Map Section */}
          <div style={{ marginTop: "60px" }}>
            <h3 style={{ fontSize: "1.35rem", color: "var(--color-text-primary)", marginBottom: "16px" }}>
              Campus Location Map — Mullanpur Dakha, Ludhiana
            </h3>
            <div style={{
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
              border: "1px solid var(--color-border)",
              height: "380px"
            }}>
              <iframe
                title="Hunar The Skill House Campus Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3424.3411440628373!2d75.6481615!3d30.8771146!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391a82643a672cf3%3A0xb363dc0b4461eb4c!2sUCO%20Bank%2C%20Mullanpur%20Dakha!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
