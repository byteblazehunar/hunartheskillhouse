import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Star,
  Users,
  ShieldCheck
} from "lucide-react";
import { courseCategories } from "../data/coursesData";
import { placementsData } from "../data/placementsData";
import { testimonialsData } from "../data/testimonialsData";
import { siteConfig } from "../data/siteConfig";
import SectionHeading from "../components/SectionHeading";
import CourseCard from "../components/CourseCard";
import TrustBadges from "../components/TrustBadges";
import LearningJourney from "../components/LearningJourney";
import { ScrollReveal, ScrollItem } from "../components/ScrollReveal";
import AnimatedCounter from "../components/AnimatedCounter";
import { useSiteContent } from "../context/SiteContentContext";
import usePublicCatalog from "../hooks/usePublicCatalog";

export default function Home({ onOpenDemo }) {
  const shouldReduceMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState("All");
  const { content } = useSiteContent();
  const { courses } = usePublicCatalog();
  const homepage = content.homepage || {};
  const homepageStats = Array.isArray(homepage.stats) ? homepage.stats : [
    { label: "Industry Programs", value: "12+" },
    { label: "Students Trained", value: "1,000+" },
    { label: "Internship Support", value: "100%" },
    { label: "Placement Rating", value: "4.9/5" }
  ];

  const filteredCourses =
    activeCategory === "All"
      ? courses
      : courses.filter((c) => c.category === activeCategory);

  const featuredCourse = courses.find((c) => c.slug === "diploma-in-digital-marketing") || courses[0];
  const aiWorkshop = courses.find((c) => c.slug === "30-days-ai-workshop");
  const categories = ["All", ...new Set([...courseCategories.filter((category) => category !== "All"), ...courses.map((course) => course.category)])];

  return (
    <div>
      {/* ═══ HERO SECTION ════════════════════════════════════════════ */}
      <section className="home-hero" style={{
        paddingTop: "clamp(48px, 6vw, 76px)",
        paddingBottom: "clamp(56px, 7vw, 88px)",
        position: "relative"
      }}>
        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr)",
            gap: "clamp(36px, 5vw, 64px)",
            alignItems: "center"
          }} className="hero-grid">
            {/* Left Content */}
            <div className="hero-content">
              {/* Institutional Eyebrow */}
              <motion.div
                className="eyebrow"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: shouldReduceMotion ? 0.2 : 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {homepage.badge || "Academic Year 2026 · Mullanpur Dakha, Ludhiana"}
              </motion.div>

              {/* Headline — requirement 1: opacity 0 -> 1, y 30px -> 0, duration 0.8s */}
              <motion.h1
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: shouldReduceMotion ? 0.3 : 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontSize: "clamp(2.1rem, 3.8vw, 3.1rem)",
                  fontWeight: "700",
                  lineHeight: "1.18",
                  marginBottom: "20px",
                  letterSpacing: "-0.025em",
                  color: "var(--color-text-primary)"
                }}
              >
                {homepage.heroTitle || "Practical AI & Technology Courses in Mullanpur Dakha."}
              </motion.h1>

              {/* Subtitle — requirement 1: delay 0.15s */}
              <motion.p
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: shouldReduceMotion ? 0.3 : 0.8, delay: shouldReduceMotion ? 0 : 0.15, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontSize: "1.05rem",
                  lineHeight: "1.75",
                  color: "var(--color-text-secondary)",
                  marginBottom: "32px",
                  maxWidth: "540px"
                }}
              >
                {homepage.heroSubtitle || "Mullanpur Dakha's premier institute for job-ready skills. Experience 100% practical workstation labs with live ₹10,000 advertising budgets, real client repositories, and dedicated placement support across India."}
              </motion.p>

              {/* CTAs — requirement 1: delay 0.25s */}
              <motion.div
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: shouldReduceMotion ? 0.3 : 0.8, delay: shouldReduceMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  flexWrap: "wrap",
                  marginBottom: "32px"
                }}
              >
                <button
                  onClick={() => onOpenDemo()}
                  className="btn btn-primary btn-lg"
                >
                  Book Free Demo Class
                  <ArrowRight size={16} />
                </button>

                <Link to="/courses" className="btn btn-outline btn-lg">
                  Explore All Programs
                </Link>
              </motion.div>

              {/* Trust Markers — delay 0.35s */}
              <motion.div
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: shouldReduceMotion ? 0.3 : 0.8, delay: shouldReduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  flexWrap: "wrap",
                  fontSize: "0.82rem",
                  color: "var(--color-text-muted)",
                  borderTop: "1px solid var(--color-border)",
                  paddingTop: "20px"
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: "var(--color-brand-text)", fontSize: "0.6rem" }}>●</span>
                  ISO 9001:2015 Certified
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: "var(--color-brand-text)", fontSize: "0.6rem" }}>●</span>
                  ₹10,000 Live Ad Capital
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: "var(--color-brand-text)", fontSize: "0.6rem" }}>●</span>
                  DPIIT #startupindia
                </span>
              </motion.div>
            </div>

            <div className="hero-media" style={{ display: "flex", justifyContent: "center" }}>
              <div className="hero-founder-container home-founder-visual" style={{ width: "min(100%, 390px)", position: "relative" }}>
                <img
                  src="/assets/founder-portrait-light.jpg"
                  alt="Gurlove Malhi, founder of Hunar The Skill House"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/assets/founder-cutout-tight.png";
                  }}
                  style={{ width: "100%", aspectRatio: "4 / 5", objectFit: "cover", objectPosition: "center top", borderRadius: "var(--radius-xl)", display: "block", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-lg)" }}
                />
                <div className="hero-founder-badge" style={{ position: "absolute", left: "18px", right: "18px", bottom: "18px", padding: "14px 18px", borderRadius: "var(--radius-md)", background: "rgba(28, 29, 25, 0.9)", color: "#F5F3E9", backdropFilter: "blur(8px)" }}>
                  <strong style={{ display: "block", fontSize: "1rem" }}>Gurlove Malhi</strong>
                  <span style={{ fontSize: "0.78rem", color: "#D9D7CB" }}>Founder, Hunar The Skill House</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <style>{`
          @media (max-width: 860px) {
            .hero-grid {
              grid-template-columns: 1fr !important;
              gap: 28px !important;
            }
            .hero-media {
              order: 2;
              max-width: 260px !important;
              margin: 0 auto;
            }
            .hero-content {
              order: 1;
            }
            .hero-founder-container {
              max-width: 280px !important;
            }
            .hero-founder-badge {
              padding: 10px 18px !important;
            }
          }
          @media (max-width: 480px) {
            .hero-media {
              max-width: 220px !important;
            }
          }
        `}</style>
      </section>

      {/* ═══ TRUST STRIP ═════════════════════════════════════════════ */}
      <TrustBadges />

      <section className="section-tight stats-glance-section" aria-label="Hunar at a glance">
        <div className="container stats-glance-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "16px"
        }}>
          {homepageStats.map((stat, index) => (
            <div className="home-stat-card" key={`${stat.label}-${index}`} style={{
              padding: "20px",
              textAlign: "center",
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              userSelect: "none"
            }}>
              <div style={{ fontSize: "1.55rem", fontWeight: 800, color: "var(--color-brand-text)", userSelect: "none" }}>{stat.value}</div>
              <div style={{ marginTop: "4px", color: "var(--color-text-secondary)", fontSize: "0.82rem" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ PROGRAMS ════════════════════════════════════════════════ */}
      <ScrollReveal as="section" className="section" id="programs">
        <div className="container">
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "32px"
          }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: "8px" }}>
                Career-Focused Curriculum
              </div>
              <h2>Job-Ready Programs</h2>
              <p style={{ marginTop: "6px" }}>
                Built around actual employer hiring requirements and production workflows.
              </p>
            </div>

            <Link to="/courses" className="btn btn-outline btn-sm">
              View All Programs
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Category Filter */}
          <div style={{
            display: "flex",
            gap: "6px",
            overflowX: "auto",
            paddingBottom: "12px",
            marginBottom: "32px"
          }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "7px 16px",
                  borderRadius: "var(--radius-pill)",
                  border: "1px solid",
                  borderColor: activeCategory === cat ? "var(--color-brand)" : "var(--color-border)",
                  backgroundColor: activeCategory === cat ? "var(--color-brand-subtle-bg)" : "transparent",
                  color: activeCategory === cat ? "var(--color-brand-text)" : "var(--color-text-secondary)",
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                  whiteSpace: "nowrap"
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Course Grid */}
          <div className="course-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(330px, 100%), 1fr))",
            gap: "24px"
          }}>
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} onOpenDemo={onOpenDemo} />
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* ═══ FEATURED PROGRAM — Editorial layout ═════════════════════ */}
      {featuredCourse && (
        <ScrollReveal as="section" className="section bg-section-alt" style={{
          borderTop: "1px solid var(--color-border)",
          borderBottom: "1px solid var(--color-border)"
        }}>
          <div className="container">
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "clamp(32px, 5vw, 64px)",
              alignItems: "center"
            }} className="featured-grid">
              {/* Image */}
              <div>
                <div
                  className="course-preview-container"
                  style={{
                    borderRadius: "var(--radius-lg)",
                    overflow: "hidden",
                    border: "1px solid var(--color-border)"
                  }}
                >
                  <img
                    src={featuredCourse.image || "/hunar_modern_lab.jpg"}
                    alt={featuredCourse.title}
                    className="course-preview-img"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </div>

                {/* Compact stats with AnimatedCounter */}
                <div style={{
                  marginTop: "16px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px"
                }}>
                  <div style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    padding: "14px"
                  }}>
                    <div style={{
                      fontSize: "1.3rem",
                      fontWeight: "700",
                      fontFamily: "var(--font-heading)",
                      color: "var(--color-brand-text)"
                    }}>
                      <AnimatedCounter value={10000} prefix="₹" />
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                      Live ad budget per student
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    padding: "14px"
                  }}>
                    <div style={{
                      fontSize: "1.3rem",
                      fontWeight: "700",
                      fontFamily: "var(--font-heading)",
                      color: "var(--color-text-primary)"
                    }}>
                      <AnimatedCounter value={100} suffix="%" />
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                      Practical lab training
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div>
                <div style={{
                  fontSize: "0.72rem",
                  fontWeight: "700",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-brand-text)",
                  marginBottom: "10px"
                }}>
                  Flagship Program
                </div>
                <h2 style={{ marginBottom: "14px" }}>
                  {featuredCourse.title}
                </h2>
                <p style={{
                  fontSize: "1rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: "1.7",
                  marginBottom: "24px"
                }}>
                  {featuredCourse.tagline}
                </p>

                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginBottom: "28px"
                }}>
                  {featuredCourse.highlights.slice(0, 5).map((point, i) => (
                    <div key={i} style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      fontSize: "0.92rem"
                    }}>
                      <CheckCircle2 size={16} color="var(--color-brand-text)" style={{ flexShrink: 0, marginTop: "3px" }} />
                      <span style={{ color: "var(--color-text-primary)" }}>{point}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => onOpenDemo(featuredCourse.id, featuredCourse.title)}
                    className="btn btn-primary"
                  >
                    Inquire / Book Demo
                    <ArrowRight size={16} />
                  </button>
                  <Link to={`/course/${featuredCourse.slug}`} className="btn btn-outline">
                    View Full Syllabus
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <style>{`
            @media (max-width: 768px) {
              .featured-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </ScrollReveal>
      )}

      {/* ═══ AI WORKSHOP — Clean banner ═══════════════════════════════ */}
      {aiWorkshop && (
        <ScrollReveal as="section" className="section">
          <div className="container">
            <div style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-xl)",
              padding: "clamp(32px, 5vw, 48px)",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "32px",
              alignItems: "center"
            }} className="workshop-grid">
              <div>
                <div style={{
                  fontSize: "0.72rem",
                  fontWeight: "700",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-brand-text)",
                  marginBottom: "10px"
                }}>
                  30-Day Bootcamp
                </div>
                <h2 style={{ marginBottom: "12px" }}>
                  30 Days AI Workshop
                </h2>
                <p style={{
                  color: "var(--color-text-secondary)",
                  fontSize: "1rem",
                  lineHeight: "1.7",
                  marginBottom: "24px"
                }}>
                  Master 29 daily hands-on AI modules: Prompt Engineering, HeyGen avatars,
                  Claude coding workflows, Make.com automations, and custom AI agents.
                </p>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <Link to="/workshop" className="btn btn-primary">
                    Explore Modules
                    <ArrowRight size={16} />
                  </Link>
                  <button
                    onClick={() => onOpenDemo(aiWorkshop.id, aiWorkshop.title)}
                    className="btn btn-outline"
                  >
                    Book Free AI Demo
                  </button>
                </div>
              </div>

              {/* Key facts — simple text grid, no cards */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px"
              }}>
                {[
                  { label: <AnimatedCounter value={29} suffix=" Days" />, desc: "One practical AI tool daily" },
                  { label: "Zero Coding", desc: "Students, pros & businesses" },
                  { label: "AI Avatars", desc: "HeyGen, ElevenLabs, Runway" },
                  { label: "Certificate", desc: "ISO 9001 verified credential" }
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{
                      fontSize: "1.1rem",
                      fontWeight: "700",
                      fontFamily: "var(--font-heading)",
                      color: "var(--color-brand-text)",
                      marginBottom: "2px"
                    }}>
                      {item.label}
                    </div>
                    <div style={{
                      fontSize: "0.82rem",
                      color: "var(--color-text-muted)"
                    }}>
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <style>{`
            @media (max-width: 768px) {
              .workshop-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </ScrollReveal>
      )}

      {/* ═══ WHY HUNAR — Asymmetrical Layout ════════════════════════════ */}
      <section className="section bg-section-alt" style={{
        borderTop: "1px solid var(--color-border)"
      }}>
        <div className="container">
          <ScrollReveal stagger={0.08}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.5fr",
              gap: "clamp(40px, 6vw, 80px)",
              alignItems: "flex-start"
            }} className="why-layout">
              <ScrollItem>
                <div style={{
                  fontSize: "0.72rem",
                  fontWeight: "700",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-brand-text)",
                  marginBottom: "12px"
                }}>
                  Why Choose Hunar
                </div>
                <h2 style={{ marginBottom: "20px", fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)" }}>
                  Beyond Online Tutorials
                </h2>
                <p style={{
                  fontSize: "1.05rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: "1.7",
                  marginBottom: "32px"
                }}>
                  YouTube tutorials can't give you real ad budgets, code reviews, individual workstations, or verified placement support. Our approach bridges the gap between passive watching and actual doing.
                </p>
                
                <div style={{ padding: "24px", backgroundColor: "var(--color-surface)", borderLeft: "4px solid var(--color-brand)", borderRadius: "0 var(--radius-md) var(--radius-md) 0" }}>
                  <h3 style={{ fontSize: "1.1rem", marginBottom: "8px" }}>Real Budget, Real Stakes</h3>
                  <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>
                    In digital marketing, we provide ₹10,000 real capital to deploy on Meta and Google Ads. You learn how auctions and bidding work in production.
                  </p>
                </div>
              </ScrollItem>

              <ScrollItem>
                <div style={{ display: "flex", flexDirection: "column", gap: "32px", marginTop: "24px" }}>
                  <div style={{ display: "flex", gap: "20px" }}>
                    <div style={{ color: "var(--color-brand-text)", fontWeight: "800", fontSize: "1.4rem", opacity: 0.8 }}>01</div>
                    <div>
                      <h3 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>1-on-1 Mentor Guidance</h3>
                      <p style={{ fontSize: "0.95rem", color: "var(--color-text-secondary)", lineHeight: "1.7" }}>
                        Learn directly from practitioners. Get instant feedback on bugs, design choices, and campaign funnels instead of struggling alone for days.
                      </p>
                    </div>
                  </div>
                  <div style={{ height: "1px", backgroundColor: "var(--color-border)" }} />
                  <div style={{ display: "flex", gap: "20px" }}>
                    <div style={{ color: "var(--color-brand-text)", fontWeight: "800", fontSize: "1.4rem", opacity: 0.8 }}>02</div>
                    <div>
                      <h3 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>Institutional Credibility</h3>
                      <p style={{ fontSize: "0.95rem", color: "var(--color-text-secondary)", lineHeight: "1.7" }}>
                        Backed by Byteblaze Technologies, ISO 9001:2015 certified, MSME & DPIIT registered. Every credential comes with an employer-verifiable code.
                      </p>
                    </div>
                  </div>
                  <div style={{ height: "1px", backgroundColor: "var(--color-border)" }} />
                  <div style={{ display: "flex", gap: "20px" }}>
                    <div style={{ color: "var(--color-brand-text)", fontWeight: "800", fontSize: "1.4rem", opacity: 0.8 }}>03</div>
                    <div>
                      <h3 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>100% Practical Labs</h3>
                      <p style={{ fontSize: "0.95rem", color: "var(--color-text-secondary)", lineHeight: "1.7" }}>
                        No rote theory sessions. Work on your dedicated system and apply what you learn immediately through active assignments.
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollItem>
            </div>
          </ScrollReveal>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .why-layout { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* ═══ LEARNING JOURNEY ════════════════════════════════════════ */}
      <LearningJourney />

      {/* ═══ PLACEMENTS ══════════════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <ScrollReveal stagger={0.06}>
            <ScrollItem>
              <SectionHeading
                kicker="Career Outcomes"
                title="Where Our Students Work"
                subtitle="Verified placement records and career transitions from Hunar batches."
              />
            </ScrollItem>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "20px",
              marginBottom: "36px"
            }}>
              {placementsData.map((p) => (
                <ScrollItem key={p.id}>
                  <div
                    className="hunar-card"
                    style={{ padding: "24px" }}
                  >
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      marginBottom: "14px"
                    }}>
                      <div style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        backgroundColor: "var(--color-brand-subtle-bg)",
                        border: "1px solid var(--color-brand-border)",
                        color: "var(--color-brand-text)",
                        fontWeight: "700",
                        fontSize: "1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}>
                        {p.avatar}
                      </div>
                      <div>
                        <h4 style={{ fontSize: "1rem", marginBottom: "2px", color: "var(--color-text-primary)" }}>
                          {p.name}
                        </h4>
                        <div style={{ fontSize: "0.82rem", color: "var(--color-brand-text)", fontWeight: "600" }}>
                          {p.role}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      fontSize: "0.82rem",
                      color: "var(--color-text-secondary)",
                      marginBottom: "10px"
                    }}>
                      {p.company}
                    </div>

                    <div style={{
                      fontSize: "0.75rem",
                      color: "var(--color-text-muted)"
                    }}>
                      {p.course} · {p.batch}
                    </div>
                  </div>
                </ScrollItem>
              ))}
            </div>

            <ScrollItem style={{ textAlign: "center" }}>
              <Link to="/testimonials" className="btn btn-outline">
                View All Success Stories
                <ArrowRight size={14} />
              </Link>
            </ScrollItem>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ MENTORS — Editorial, not card-based ═════════════════��═══ */}
      <section className="section bg-section-alt" style={{
        borderTop: "1px solid var(--color-border)"
      }}>
        <div className="container">
          <ScrollReveal stagger={0.08}>
            <ScrollItem>
              <SectionHeading
                kicker="Expert Faculty"
                title="Learn From Working Industry Practitioners"
                subtitle="Our mentors are active technology builders and creative directors with enterprise track records."
              />
            </ScrollItem>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              maxWidth: "800px",
              margin: "0 auto"
            }} className="mentors-grid">
              {/* Mentor 1 */}
              <ScrollItem>
                <div style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "28px"
                }}>
                  <div style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--color-brand-subtle-bg)",
                    border: "1px solid var(--color-brand-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                    fontWeight: "800",
                    color: "var(--color-brand-text)",
                    marginBottom: "16px"
                  }}>
                    PS
                  </div>
                  <h3 style={{ fontSize: "1.15rem", marginBottom: "4px" }}>
                    {content.faculty?.leadInstructor || "Paramjit Singh"}
                  </h3>
                  <div style={{
                    color: "var(--color-brand-text)",
                    fontWeight: "600",
                    fontSize: "0.82rem",
                    marginBottom: "10px"
                  }}>
                    {content.faculty?.domains || "Teacher — Web Dev, AI & Digital Marketing"}
                  </div>
                  <p style={{
                    fontSize: "0.88rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: "1.65",
                    marginBottom: "12px"
                  }}>
                    {content.faculty?.pedagogy || "Lead faculty member dedicated to hands-on student mastery across Web Development, Artificial Intelligence (AI), and Digital Marketing."}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {(content.faculty?.domains || "Web Development, Artificial Intelligence (AI), Digital Marketing")
                      .split(",")
                      .map((domain) => domain.trim())
                      .filter(Boolean)
                      .map((domain) => (
                        <span key={domain} className="badge-pill badge-pill-brand" style={{ fontSize: "0.72rem" }}>{domain}</span>
                      ))}
                  </div>
                </div>
              </ScrollItem>

              {/* Mentor 2 */}
              <ScrollItem>
                <div style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "28px"
                }}>
                  <div style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--color-brand-subtle-bg)",
                    border: "1px solid var(--color-brand-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                    fontWeight: "800",
                    color: "var(--color-brand-text)",
                    marginBottom: "16px"
                  }}>
                    LS
                  </div>
                  <h3 style={{ fontSize: "1.15rem", marginBottom: "4px" }}>
                    Lakshay Sharma
                  </h3>
                  <div style={{
                    color: "var(--color-brand-text)",
                    fontWeight: "600",
                    fontSize: "0.82rem",
                    marginBottom: "10px"
                  }}>
                    Lead Creative & Motion Graphics Mentor
                  </div>
                  <p style={{
                    fontSize: "0.88rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: "1.65"
                  }}>
                    Specialist in brand identity, video editing, After Effects typography,
                    and AI visual workflows for commercial campaigns.
                  </p>
                </div>
              </ScrollItem>
            </div>
          </ScrollReveal>

          <style>{`
            @media (max-width: 640px) {
              .mentors-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ════════════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <ScrollReveal stagger={0.08}>
            <ScrollItem>
              <SectionHeading
                kicker="Student Experiences"
                title="Genuine Reviews From Our Learners"
                subtitle="Real, verified feedback from students who built their skills at Hunar."
              />
            </ScrollItem>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))",
              gap: "20px"
            }}>
              {testimonialsData.slice(0, 3).map((item) => (
                <ScrollItem key={item.id} style={{ display: "flex" }}>
                  <div
                    className="hunar-card"
                    style={{ display: "flex", flexDirection: "column", padding: "28px", width: "100%" }}
                  >
                    <div style={{ display: "flex", gap: "3px", marginBottom: "14px" }}>
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="var(--color-brand)" color="var(--color-brand)" />
                      ))}
                    </div>

                    <p style={{
                      fontSize: "0.92rem",
                      color: "var(--color-text-primary)",
                      lineHeight: "1.7",
                      fontStyle: "italic",
                      marginBottom: "20px",
                      flexGrow: 1
                    }}>
                      "{item.quote}"
                    </p>

                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      borderTop: "1px solid var(--color-border)",
                      paddingTop: "14px"
                    }}>
                      <div style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        backgroundColor: "var(--color-brand-subtle-bg)",
                        border: "1px solid var(--color-brand-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                        color: "var(--color-brand-text)",
                        fontSize: "0.82rem"
                      }}>
                        {item.initials}
                      </div>
                      <div>
                        <h4 style={{ fontSize: "0.9rem", marginBottom: "1px" }}>
                          {item.name}
                        </h4>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                          {item.course}
                        </span>
                      </div>
                    </div>
                  </div>
                </ScrollItem>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══════════════════════════════════════════════ */}
      <section className="section" style={{
        paddingTop: "clamp(64px, 8vw, 104px)",
        paddingBottom: "clamp(64px, 8vw, 104px)"
      }}>
        <div className="container">
          <ScrollReveal>
            <div style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-xl)",
              padding: "clamp(36px, 6vw, 56px)",
              textAlign: "center"
            }}>
              <div style={{
                fontSize: "0.72rem",
                fontWeight: "700",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-brand-text)",
                marginBottom: "12px"
              }}>
                Start Your Journey Today
              </div>
              <h2 style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                fontWeight: "800",
                marginBottom: "14px",
                letterSpacing: "-0.02em"
              }}>
                Ready to Build Skills That Get You Hired?
              </h2>
              <p style={{
                fontSize: "1rem",
                color: "var(--color-text-secondary)",
                maxWidth: "560px",
                margin: "0 auto 28px",
                lineHeight: "1.7"
              }}>
                Join students who have advanced their careers at Hunar.
                Book a free demo or speak with a counselor.
              </p>

              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                flexWrap: "wrap"
              }}>
                <button
                  onClick={() => onOpenDemo()}
                  className="btn btn-primary btn-lg"
                >
                  Book Free Demo
                  <ArrowRight size={16} />
                </button>

                <a
                  href={siteConfig.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                >
                  WhatsApp Us
                </a>

                <Link to="/contact" className="btn btn-outline">
                  Visit Campus
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
