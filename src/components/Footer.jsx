import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, ArrowUp } from "lucide-react";
import { siteConfig } from "../data/siteConfig";
import { useTheme } from "../context/ThemeContext";
import { useSiteContent } from "../context/SiteContentContext";
import usePublicCatalog from "../hooks/usePublicCatalog";

export default function Footer() {
  const { theme } = useTheme();
  const { content } = useSiteContent();
  const { courses } = usePublicCatalog();
  const contact = content.contact || {};
  const location = contact.address || siteConfig.location;
  const phone = contact.phone || siteConfig.phone;
  const email = contact.email || siteConfig.email;
  const officeHours = contact.officeHours || siteConfig.officeHours.weekdays;
  const logoSrc = theme === "light" ? "/logo-light.png" : "/logo-dark.png";

  const scrollToTop = (e) => {
    e.preventDefault();
    if (window.lenis) {
      window.lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      backgroundColor: "var(--color-surface)",
      borderTop: "1px solid var(--color-border)",
      paddingTop: "64px",
      paddingBottom: "32px",
      color: "var(--color-text-secondary)",
      transition: "background-color var(--transition-theme)"
    }}>
      <div className="container">
        {/* Main Footer Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr 1fr 1.2fr",
          gap: "40px",
          marginBottom: "48px"
        }} className="footer-grid">
          {/* Column 1: Brand */}
          <div>
            <Link to="/" style={{ display: "inline-block", marginBottom: "16px" }} aria-label="Hunar The Skill House Home">
              <img
                src={logoSrc}
                alt="Hunar The Skill House"
                style={{ height: "42px", width: "auto", display: "block" }}
              />
            </Link>
            <p style={{
              fontSize: "0.9rem",
              lineHeight: "1.7",
              marginBottom: "20px",
              color: "var(--color-text-secondary)",
              maxWidth: "320px"
            }}>
              {siteConfig.shortDesc} Practical learning, live client projects, and dedicated placement support in Mullanpur, Ludhiana.
            </p>

            {/* Accreditations — compact */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              fontSize: "0.82rem",
              color: "var(--color-text-secondary)"
            }}>
              <span>✓ ISO 9001:2015 Certified</span>
              <span>✓ DPIIT #startupindia Registered</span>
              <span>✓ MSME Registered Enterprise</span>
            </div>

            {/* Social Links */}
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <a
                href={siteConfig.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-surface-secondary)",
                  color: "var(--color-text-secondary)",
                  border: "1px solid var(--color-border)",
                  transition: "all var(--transition-fast)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-brand)";
                  e.currentTarget.style.color = "var(--color-brand-on)";
                  e.currentTarget.style.borderColor = "var(--color-brand)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-surface-secondary)";
                  e.currentTarget.style.color = "var(--color-text-secondary)";
                  e.currentTarget.style.borderColor = "var(--color-border)";
                }}
                aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>

              <a
                href={siteConfig.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-surface-secondary)",
                  color: "var(--color-text-secondary)",
                  border: "1px solid var(--color-border)",
                  transition: "all var(--transition-fast)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-brand)";
                  e.currentTarget.style.color = "var(--color-brand-on)";
                  e.currentTarget.style.borderColor = "var(--color-brand)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-surface-secondary)";
                  e.currentTarget.style.color = "var(--color-text-secondary)";
                  e.currentTarget.style.borderColor = "var(--color-border)";
                }}
                aria-label="Facebook"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>

              <a
                href={siteConfig.socials.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-surface-secondary)",
                  color: "var(--color-whatsapp)",
                  border: "1px solid var(--color-border)",
                  transition: "all var(--transition-fast)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#25D366";
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.borderColor = "#25D366";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-surface-secondary)";
                  e.currentTarget.style.color = "var(--color-whatsapp)";
                  e.currentTarget.style.borderColor = "var(--color-border)";
                }}
                aria-label="WhatsApp"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h2 style={{
              fontSize: "0.82rem",
              fontWeight: "700",
              color: "var(--color-text-primary)",
              marginBottom: "18px",
              textTransform: "uppercase",
              letterSpacing: "0.06em"
            }}>
              Quick Links
            </h2>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { to: "/", label: "Home" },
                { to: "/courses", label: "All Programs" },
                { to: "/workshop", label: "30 Days AI Workshop" },
                { to: "/about", label: "About Hunar" },
                { to: "/testimonials", label: "Testimonials" },
                { to: "/faq", label: "FAQ" },
                { to: "/blog", label: "Articles" },
                { to: "/contact", label: "Contact" },
                { to: "/enroll", label: "Enroll" },
                { to: "/verify", label: "Verify Certificate" }
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    style={{
                      color: "var(--color-text-secondary)",
                      fontSize: "0.88rem",
                      display: "inline-block",
                      padding: "4px 0",
                      transition: "color var(--transition-fast)"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-brand-text)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Programs */}
          <div>
            <h2 style={{
              fontSize: "0.82rem",
              fontWeight: "700",
              color: "var(--color-text-primary)",
              marginBottom: "18px",
              textTransform: "uppercase",
              letterSpacing: "0.06em"
            }}>
              Programs
            </h2>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
              {courses.map((course) => (
                <li key={course.slug}>
                  <Link
                    to={`/course/${course.slug}`}
                    style={{
                      color: "var(--color-text-secondary)",
                      fontSize: "0.88rem",
                      display: "inline-block",
                      padding: "4px 0",
                      transition: "color var(--transition-fast)"
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "var(--color-brand-text)")}
                    onMouseLeave={(e) => (e.target.style.color = "var(--color-text-secondary)")}
                  >
                    {course.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h2 style={{
              fontSize: "0.82rem",
              fontWeight: "700",
              color: "var(--color-text-primary)",
              marginBottom: "18px",
              textTransform: "uppercase",
              letterSpacing: "0.06em"
            }}>
              Campus & Contact
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.88rem" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <MapPin size={16} style={{ flexShrink: 0, marginTop: "3px", color: "var(--color-text-muted)" }} />
                <span>{location}</span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <Phone size={16} style={{ flexShrink: 0, color: "var(--color-text-muted)" }} />
                <a href={`tel:${phone}`} style={{
                  color: "var(--color-text-primary)",
                  fontWeight: "600"
                }}>
                  {phone}
                </a>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <Mail size={16} style={{ flexShrink: 0, color: "var(--color-text-muted)" }} />
                <a href={`mailto:${email}`} style={{ color: "var(--color-text-secondary)" }}>
                  {email}
                </a>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <Clock size={16} style={{ flexShrink: 0, marginTop: "3px", color: "var(--color-text-muted)" }} />
                <div>
                  <div style={{ fontSize: "0.82rem" }}>{officeHours}</div>
                  {!contact.officeHours && <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>{siteConfig.officeHours.sunday}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: "1px solid var(--color-border)",
          paddingTop: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          fontSize: "0.78rem",
          color: "var(--color-text-muted)"
        }}>
          <div>
            © {currentYear} Hunar — The Skill House · Powered by Byteblaze Technologies
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link
              to="/page/privacy-policy"
              style={{ color: "var(--color-text-muted)", transition: "color var(--transition-fast)" }}
              onMouseEnter={(e) => (e.target.style.color = "var(--color-text-primary)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--color-text-muted)")}
            >
              Privacy
            </Link>
            <Link
              to="/page/terms-conditions"
              style={{ color: "var(--color-text-muted)", transition: "color var(--transition-fast)" }}
              onMouseEnter={(e) => (e.target.style.color = "var(--color-text-primary)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--color-text-muted)")}
            >
              Terms
            </Link>
            <button
              onClick={scrollToTop}
              style={{
                background: "var(--color-surface-secondary)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-secondary)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.78rem",
                fontWeight: "600",
                padding: "4px 10px",
                borderRadius: "var(--radius-sm)",
                transition: "all var(--transition-fast)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-brand)";
                e.currentTarget.style.color = "var(--color-brand-text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.color = "var(--color-text-secondary)";
              }}
            >
              <span>Top</span>
              <ArrowUp size={12} />
            </button>
          </div>
        </div>

        {/* Student Design Credit */}
        <div style={{
          borderTop: "1px solid var(--color-border)",
          paddingTop: "14px",
          marginTop: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          fontSize: "0.78rem"
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--color-text-muted)"
          }}>
            <span style={{
              display: "inline-block",
              width: "10px",
              height: "2px",
              backgroundColor: "var(--color-brand)",
              borderRadius: "1px",
              flexShrink: 0
            }} aria-hidden="true" />
            <span style={{ color: "var(--color-text-muted)" }}>
              Designed by Students
            </span>
            <span style={{ color: "var(--color-border)" }}>—</span>
            <span style={{
              color: "var(--color-text-primary)",
              fontWeight: "600",
              letterSpacing: "0.01em"
            }}>
              Mayur Arora &amp; Harman Preet Singh
            </span>
          </div>

          <div style={{
            fontSize: "0.74rem",
            color: "var(--color-text-muted)",
            opacity: 0.85
          }}>
            Hunar — The Skill House · Student Design Project
          </div>
        </div>
      </div>

      {/* Responsive footer grid */}
      <style>{`
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 560px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </footer>
  );
}
