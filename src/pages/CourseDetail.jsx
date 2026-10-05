import React, { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  Clock,
  Award,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Phone
} from "lucide-react";
import { coursesData } from "../data/coursesData";
import { siteConfig } from "../data/siteConfig";
import CourseCard from "../components/CourseCard";

export default function CourseDetail({ onOpenDemo }) {
  const { slug } = useParams();
  const course = coursesData.find((c) => c.slug === slug);
  const [openModule, setOpenModule] = useState(0);

  if (!course) {
    return <Navigate to="/courses" replace />;
  }

  const relatedCourses = coursesData
    .filter((c) => c.id !== course.id && (c.category === course.category || c.featured))
    .slice(0, 3);

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ═══ COURSE HERO ═══════════════════════════════════════════════ */}
      <section className="section-tight" style={{
        borderBottom: "1px solid var(--color-border)"
      }}>
        <div className="container">
          {/* Breadcrumb */}
          <div style={{
            fontSize: "0.82rem",
            color: "var(--color-text-muted)",
            marginBottom: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap"
          }}>
            <Link to="/" style={{ color: "var(--color-text-secondary)" }}>Home</Link>
            <span>/</span>
            <Link to="/courses" style={{ color: "var(--color-text-secondary)" }}>Programs</Link>
            <span>/</span>
            <span style={{ color: "var(--color-brand-text)" }}>{course.title}</span>
          </div>

          {/* Category & Badge */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "14px",
            flexWrap: "wrap"
          }}>
            <span style={{
              fontSize: "0.72rem",
              fontWeight: "700",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-brand-text)"
            }}>
              {course.category}
            </span>
            {course.badge && (
              <span className="badge badge-subtle">{course.badge}</span>
            )}
          </div>

          <h1 style={{ marginBottom: "14px" }}>
            {course.title}
          </h1>

          <p style={{
            fontSize: "1.05rem",
            color: "var(--color-text-secondary)",
            maxWidth: "700px",
            lineHeight: "1.7",
            marginBottom: "24px"
          }}>
            {course.tagline || course.shortDesc}
          </p>

          {/* Meta strip */}
          <div style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            fontSize: "0.88rem",
            color: "var(--color-text-secondary)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Clock size={15} color="var(--color-text-muted)" />
              <span>Duration: <strong>{course.duration}</strong></span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Award size={15} color="var(--color-text-muted)" />
              <span>ISO 9001 Certified</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span>Mode: <strong>{course.mode}</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MAIN CONTENT & SIDEBAR ═════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "40px",
            alignItems: "flex-start"
          }} className="course-layout">
            {/* Left Column */}
            <div>
              {/* Overview */}
              <div style={{ marginBottom: "40px" }}>
                <h2 style={{ fontSize: "1.35rem", marginBottom: "14px" }}>
                  About This Program
                </h2>
                <p style={{ fontSize: "1rem", lineHeight: "1.8", marginBottom: "12px" }}>
                  {course.shortDesc}
                </p>
                <p style={{ fontSize: "1rem", lineHeight: "1.8" }}>
                  At Hunar The Skill House, every curriculum is structured around active execution.
                  You will work in our Mullanpur Dakha computer lab with individual workstations,
                  practicing with industry-standard software and receiving direct mentorship.
                </p>
              </div>

              {/* Highlights */}
              <div style={{
                marginBottom: "40px",
                padding: "28px",
                backgroundColor: "var(--color-surface-secondary)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--color-border)"
              }}>
                <h2 style={{ fontSize: "1.35rem", marginBottom: "18px" }}>
                  Key Highlights
                </h2>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "12px"
                }}>
                  {course.highlights.map((h, i) => (
                    <div key={i} style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px"
                    }}>
                      <CheckCircle2 size={16} color="var(--color-brand-text)" style={{ flexShrink: 0, marginTop: "3px" }} />
                      <span style={{
                        fontSize: "0.9rem",
                        color: "var(--color-text-primary)",
                        lineHeight: "1.5"
                      }}>
                        {h}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Curriculum Accordion */}
              {course.curriculum && (
                <div style={{ marginBottom: "40px" }}>
                  <h2 style={{ fontSize: "1.35rem", marginBottom: "8px" }}>
                    Curriculum & Learning Roadmap
                  </h2>
                  <p style={{
                    fontSize: "0.92rem",
                    marginBottom: "20px"
                  }}>
                    Structured modules from core fundamentals to live deployments.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {course.curriculum.map((mod, idx) => {
                      const isOpen = openModule === idx;
                      return (
                        <div
                          key={idx}
                          style={{
                            border: "1px solid",
                            borderColor: isOpen ? "var(--color-brand-border)" : "var(--color-border)",
                            borderRadius: "var(--radius-md)",
                            backgroundColor: isOpen ? "var(--color-brand-subtle-bg)" : "var(--color-surface)",
                            overflow: "hidden",
                            transition: "all var(--transition-fast)"
                          }}
                        >
                          <button
                            onClick={() => setOpenModule(isOpen ? -1 : idx)}
                            style={{
                              width: "100%",
                              padding: "14px 18px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              background: "none",
                              border: "none",
                              color: "var(--color-text-primary)",
                              textAlign: "left",
                              cursor: "pointer",
                              fontSize: "0.95rem",
                              fontWeight: "600"
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <span style={{
                                fontSize: "0.7rem",
                                fontWeight: "700",
                                background: "var(--color-brand-subtle-bg)",
                                color: "var(--color-brand-text)",
                                padding: "2px 8px",
                                borderRadius: "var(--radius-sm)",
                                border: "1px solid var(--color-brand-border)"
                              }}>
                                {mod.module}
                              </span>
                              <span>{mod.title}</span>
                            </div>
                            {isOpen
                              ? <ChevronUp size={16} color="var(--color-brand-text)" />
                              : <ChevronDown size={16} color="var(--color-text-muted)" />
                            }
                          </button>

                          {isOpen && (
                            <div style={{
                              padding: "0 18px 16px 18px",
                              borderTop: "1px solid var(--color-border)"
                            }}>
                              <ul style={{
                                listStyle: "none",
                                display: "flex",
                                flexDirection: "column",
                                gap: "6px",
                                paddingTop: "12px"
                              }}>
                                {mod.topics.map((t, ti) => (
                                  <li key={ti} style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "8px",
                                    fontSize: "0.88rem",
                                    color: "var(--color-text-secondary)"
                                  }}>
                                    <span style={{ color: "var(--color-brand)" }}>•</span>
                                    <span>{t}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tools */}
              {course.tools && (
                <div style={{ marginBottom: "40px" }}>
                  <h2 style={{ fontSize: "1.35rem", marginBottom: "14px" }}>
                    Tools & Technologies
                  </h2>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {course.tools.map((tool, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: "var(--color-surface-secondary)",
                          border: "1px solid var(--color-border)",
                          padding: "6px 14px",
                          borderRadius: "var(--radius-pill)",
                          fontSize: "0.85rem",
                          fontWeight: "500",
                          color: "var(--color-text-primary)"
                        }}
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {course.projects && (
                <div style={{ marginBottom: "40px" }}>
                  <h2 style={{ fontSize: "1.35rem", marginBottom: "16px" }}>
                    Practical Projects
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {course.projects.map((proj, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: "18px",
                          backgroundColor: "var(--color-surface-secondary)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-md)"
                        }}
                      >
                        <h4 style={{
                          fontSize: "1rem",
                          marginBottom: "4px",
                          color: "var(--color-text-primary)"
                        }}>
                          {proj.title}
                        </h4>
                        <p style={{ fontSize: "0.88rem", lineHeight: "1.6" }}>
                          {proj.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Career Roles */}
              {course.careerRoles && (
                <div>
                  <h2 style={{ fontSize: "1.35rem", marginBottom: "14px" }}>
                    Career Roles
                  </h2>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {course.careerRoles.map((role, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: "var(--color-surface-secondary)",
                          border: "1px solid var(--color-border)",
                          padding: "6px 14px",
                          borderRadius: "var(--radius-pill)",
                          fontSize: "0.85rem",
                          fontWeight: "500",
                          color: "var(--color-text-primary)"
                        }}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sticky Sidebar */}
            <div style={{ position: "sticky", top: "90px" }}>
              <div style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "28px",
                boxShadow: "var(--shadow-lg)"
              }}>
                <div style={{ marginBottom: "18px" }}>
                  <div style={{
                    fontSize: "0.72rem",
                    fontWeight: "700",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-brand-text)",
                    marginBottom: "8px"
                  }}>
                    Admissions Open
                  </div>
                  <h3 style={{ fontSize: "1.25rem", marginBottom: "6px" }}>
                    Enroll in This Program
                  </h3>
                  <p style={{ fontSize: "0.85rem" }}>
                    Book a free demo to visit our campus and experience our practical lab.
                  </p>
                </div>

                {/* Benefits */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  fontSize: "0.85rem",
                  paddingBottom: "18px",
                  borderBottom: "1px solid var(--color-border)",
                  marginBottom: "18px"
                }}>
                  {[
                    "ISO 9001 Certificate",
                    "100% Practical lab access",
                    "Real projects & portfolio",
                    "Placement support",
                    "Flexible batch timings"
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "var(--color-text-secondary)"
                    }}>
                      <CheckCircle2 size={14} color="var(--color-brand)" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onOpenDemo(course.id, course.title)}
                  className="btn btn-primary btn-full"
                  style={{ marginBottom: "10px", padding: "13px" }}
                >
                  Book Free Demo
                  <ArrowRight size={16} />
                </button>

                <a
                  href={`https://wa.me/${siteConfig.phoneRaw}?text=Hi%2C%20I%20am%20interested%20in%20${encodeURIComponent(course.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp btn-full"
                  style={{ marginBottom: "18px" }}
                >
                  WhatsApp Counselor
                </a>

                {/* Mentor */}
                {course.mentor && (
                  <div style={{
                    backgroundColor: "var(--color-surface-secondary)",
                    borderRadius: "var(--radius-md)",
                    padding: "14px",
                    border: "1px solid var(--color-border)",
                    fontSize: "0.82rem"
                  }}>
                    <div style={{ fontWeight: "600", marginBottom: "2px" }}>
                      Instructor: {course.mentor.name}
                    </div>
                    <div style={{ color: "var(--color-brand-text)", fontSize: "0.78rem" }}>
                      {course.mentor.role}
                    </div>
                    <div style={{ color: "var(--color-text-muted)", marginTop: "4px", fontSize: "0.78rem" }}>
                      {course.mentor.exp}
                    </div>
                  </div>
                )}

                <div style={{
                  marginTop: "14px",
                  textAlign: "center",
                  fontSize: "0.78rem",
                  color: "var(--color-text-muted)"
                }}>
                  Questions? Call{" "}
                  <a href={`tel:${siteConfig.phone}`} style={{
                    color: "var(--color-brand-text)",
                    fontWeight: "600"
                  }}>
                    {siteConfig.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .course-layout {
              grid-template-columns: 1fr !important;
            }
            .course-layout > div:last-child {
              position: static !important;
            }
          }
        `}</style>
      </section>

      {/* ═══ RELATED PROGRAMS ═════════════════════════════════════════ */}
      <section className="section-tight bg-section-alt" style={{
        borderTop: "1px solid var(--color-border)"
      }}>
        <div className="container">
          <h2 style={{ marginBottom: "24px" }}>
            Related Programs
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px"
          }}>
            {relatedCourses.map((rc) => (
              <div
                key={rc.id}
                className="hunar-card"
                style={{ padding: "22px" }}
              >
                <div style={{
                  fontSize: "0.7rem",
                  fontWeight: "600",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--color-brand-text)",
                  marginBottom: "8px"
                }}>
                  {rc.category}
                </div>
                <h4 style={{ fontSize: "1.05rem", marginBottom: "8px" }}>
                  {rc.title}
                </h4>
                <p style={{ fontSize: "0.85rem", marginBottom: "14px" }}>
                  {rc.shortDesc}
                </p>
                <Link
                  to={`/course/${rc.slug}`}
                  style={{
                    color: "var(--color-brand-text)",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  View Program
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
