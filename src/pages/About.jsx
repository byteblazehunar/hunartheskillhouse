import React from "react";
import { Link } from "react-router-dom";
import {
  Award,
  ShieldCheck,
  Building2,
  Cpu,
  CheckCircle2,
  Users,
  Compass,
  ArrowRight,
  MapPin,
  Laptop
} from "lucide-react";
import { siteConfig } from "../data/siteConfig";
import { ScrollReveal, ScrollItem } from "../components/ScrollReveal";
import { motion } from "framer-motion";
import { useSiteContent } from "../context/SiteContentContext";

export default function About({ onOpenDemo }) {
  const { content } = useSiteContent();
  const about = content.about || {};
  const founder = content.founder || {};
  const faculty = content.faculty || {};
  const contact = content.contact || {};
  const facultyDomains = (faculty.domains || "Web Development, Artificial Intelligence (AI), Digital Marketing")
    .split(",")
    .map((domain) => domain.trim())
    .filter(Boolean);
  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
      {/* ═══ HERO ══════════════════════════════════════════════════════ */}
      <section className="section-tight" style={{
        backgroundColor: "var(--color-surface-secondary)",
        borderBottom: "1px solid var(--color-border)",
        position: "relative"
      }}>
        <div className="container">
          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "16px" }}>
            <Link to="/" style={{ color: "var(--color-text-secondary)" }}>Home</Link>
            <span style={{ margin: "0 8px" }}>/</span>
            <span style={{ color: "var(--color-brand-text)", fontWeight: "600" }}>About Us</span>
          </div>

          <div className="eyebrow">
            About Hunar The Skill House
          </div>

          <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 3.4rem)", fontWeight: "700", marginBottom: "18px" }}>
            {about.heading || "Mullanpur's First AI-Powered, Job-Ready Skill Institute"}
          </h1>

          <p style={{
            fontSize: "1.1rem",
            color: "var(--color-text-secondary)",
            maxWidth: "760px",
            lineHeight: "1.8"
          }}>
            {about.description || "Hunar – The Skill House is an institutional skill development center powered by Byteblaze Technologies. Founded with a singular mission: bridge the divide between textbook theory and actual industry execution through individual workstations, live ad budgets, and daily mentor guidance."}
          </p>
          <p style={{ marginTop: "12px", color: "var(--color-text-muted)", fontSize: "0.88rem" }}>
            Established {about.establishedYear || "2024"} · {about.campus || contact.address || siteConfig.location}
          </p>
        </div>
      </section>

      {/* ═══ INSTITUTIONAL ACCREDITATION STRIP ════════════════════════ */}
      <section style={{
        padding: "36px 0",
        backgroundColor: "var(--color-surface-secondary)",
        borderBottom: "1px solid var(--color-border)"
      }}>
        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "24px"
          }}>
            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              <Award size={30} color="var(--color-brand-text)" />
              <div>
                <h4 style={{ fontSize: "0.95rem", color: "var(--color-text-primary)", marginBottom: "2px" }}>DPIIT #startupindia</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", margin: 0 }}>Recognized by Govt of India</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              <ShieldCheck size={30} color="var(--color-brand-text)" />
              <div>
                <h4 style={{ fontSize: "0.95rem", color: "var(--color-text-primary)", marginBottom: "2px" }}>ISO 9001:2015</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", margin: 0 }}>Certified Quality Management</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              <Building2 size={30} color="var(--color-brand-text)" />
              <div>
                <h4 style={{ fontSize: "0.95rem", color: "var(--color-text-primary)", marginBottom: "2px" }}>MSME Registered</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", margin: 0 }}>Ministry of MSME, Govt of India</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              <Cpu size={30} color="var(--color-brand-text)" />
              <div>
                <h4 style={{ fontSize: "0.95rem", color: "var(--color-text-primary)", marginBottom: "2px" }}>Byteblaze Technologies</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", margin: 0 }}>Enterprise Technology Partner</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MISSION & GENESIS ═════════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "clamp(36px, 5vw, 64px)",
            alignItems: "center"
          }} className="about-split-grid">
            <div>
              <div className="eyebrow">
                Our Genesis & Mission
              </div>
              <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", marginBottom: "20px" }}>
                {about.heading || "Closing the Practical Skills Gap in Punjab"}
              </h2>
              <p style={{ fontSize: "1.02rem", color: "var(--color-text-secondary)", lineHeight: "1.8", marginBottom: "16px" }}>
                {about.mission || "For decades, students in regional centers outside major metro hubs were faced with a frustrating dilemma: travel long distances to metropolitan institutes, or purchase pre-recorded online courses that offer zero accountability and no real feedback."}
              </p>
              <p style={{ fontSize: "1.02rem", color: "var(--color-text-secondary)", lineHeight: "1.8", marginBottom: "24px" }}>
                {about.vision || "Hunar was established right on Ferozpur Road in Mullanpur Dakha, Ludhiana, to deliver world-class, production-grade training locally. We replaced passive lectures with individual computer workstations, theoretical slide decks with live client ad accounts, and generic certificates with publicly verifiable portfolios."}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <CheckCircle2 size={18} color="var(--color-brand-text)" />
                  <span style={{ color: "var(--color-text-primary)", fontWeight: "600" }}>100% Practical lab workstation training</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <CheckCircle2 size={18} color="var(--color-brand-text)" />
                  <span style={{ color: "var(--color-text-primary)", fontWeight: "600" }}>Live ₹10K ad budget per student in Digital Marketing</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <CheckCircle2 size={18} color="var(--color-brand-text)" />
                  <span style={{ color: "var(--color-text-primary)", fontWeight: "600" }}>Modern AI tools embedded in every curriculum track</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <CheckCircle2 size={18} color="var(--color-brand-text)" />
                  <span style={{ color: "var(--color-text-primary)", fontWeight: "600" }}>Direct placement network with agencies & IT firms across India</span>
                </div>
              </div>
            </div>

            <div>
              <div style={{
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-md)",
                backgroundColor: "var(--color-surface-secondary)"
              }}>
                <img
                  src="/assets/hunar_modern_lab.jpg"
                  alt="Hunar The Skill House Lab Workstation"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>
              <div style={{
                fontSize: "0.82rem",
                color: "var(--color-text-muted)",
                marginTop: "10px",
                textAlign: "center"
              }}>
                Individual workstation training lab at Hunar Campus, Mullanpur Dakha
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 860px) {
            .about-split-grid {
              grid-template-columns: 1fr !important;
              gap: 32px !important;
            }
          }
        `}</style>
      </section>

      {/* ═══ FOUNDER PROFILE — Editorial Biography & Vision ═══════════ */}
      <section className="section bg-section-alt" style={{
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
        position: "relative",
        overflow: "hidden"
      }}>
        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "0.85fr 1.15fr",
            gap: "clamp(48px, 7vw, 84px)",
            alignItems: "flex-start"
          }} className="about-founder-grid">
            
            {/* Left Column: Authentic Framed Portrait */}
            <motion.div
              style={{ position: "relative", maxWidth: "440px", margin: "0 auto", width: "100%" }}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Hunar-Yellow Frame Accent */}
              <div style={{
                position: "absolute",
                top: "16px",
                right: "-16px",
                bottom: "-16px",
                left: "16px",
                border: "2px solid var(--color-brand)",
                borderRadius: "var(--radius-xl)",
                zIndex: 0,
                pointerEvents: "none",
                opacity: 0.9
              }}></div>
              
              <div 
                className="owner-portrait-container"
                style={{
                  position: "relative",
                  borderRadius: "var(--radius-xl)",
                  overflow: "hidden",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  zIndex: 1,
                  boxShadow: "var(--shadow-lg)"
                }}>
                <img
                  src="/assets/founder-portrait-dark.jpg"
                  alt="Gurlove Malhi, Founder of Hunar The Skill House"
                  className="owner-portrait-img"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    aspectRatio: "3/4",
                    objectFit: "cover",
                    objectPosition: "center top"
                  }}
                />

                {/* Vertical Watermark Accent */}
                <div style={{
                  position: "absolute",
                  top: "22px",
                  left: "14px",
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                  transform: "rotate(180deg)",
                  fontSize: "0.72rem",
                  fontWeight: "800",
                  letterSpacing: "0.28em",
                  color: "rgba(239, 219, 25, 0.4)",
                  pointerEvents: "none",
                  userSelect: "none",
                  zIndex: 2
                }}>
                  HUNAR · THE SKILL HOUSE
                </div>

                {/* Bottom Identification Plate */}
                <div style={{
                  position: "absolute",
                  bottom: "16px",
                  left: "16px",
                  right: "16px",
                  backgroundColor: "rgba(17, 18, 15, 0.9)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(239, 219, 25, 0.25)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  zIndex: 2
                }}>
                  <div>
                    <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#F5F3E9" }}>
                      {founder.name || "Gurlove Malhi"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-brand)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {founder.title || "Founder & Institutional Director"}
                    </div>
                  </div>
                  <div style={{
                    fontSize: "0.7rem",
                    color: "rgba(245, 243, 233, 0.6)",
                    textAlign: "right"
                  }}>
                    {founder.location || "Mullanpur Dakha"}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Detailed Editorial Biography & Vision */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="eyebrow">
                OUR FOUNDER
              </div>
              <h2 style={{ 
                fontSize: "clamp(2rem, 3.2vw, 2.75rem)", 
                marginBottom: "8px",
                lineHeight: "1.2",
                letterSpacing: "-0.02em"
              }}>
                Meet {founder.name || "Gurlove Malhi"}
              </h2>
              <div style={{ fontSize: "0.95rem", color: "var(--color-brand-text)", fontWeight: "600", marginBottom: "20px" }}>
                {founder.title || "Founder"}, {founder.organization || "Hunar The Skill House"}
              </div>

              {/* Factual Institutional Biography */}
              <div style={{ color: "var(--color-text-secondary)", fontSize: "1.02rem", lineHeight: "1.8", marginBottom: "24px" }}>
                <p style={{ marginBottom: "14px" }}>
                  {founder.experience || "Gurlove Malhi founded Hunar The Skill House with a commitment to making world-class, production-grade technical training directly accessible to learners in Mullanpur Dakha and surrounding regions of Punjab."}
                </p>
                <p style={{ marginBottom: "14px" }}>
                  Recognizing that traditional institutes often focus on rote memorization while online tutorials lack accountability, he partnered with Byteblaze Technologies to engineer an institutional curriculum anchored entirely in practical workstation execution, live advertising budgets, and daily desk mentorship.
                </p>
              </div>

              {/* Distinct Founder's Message Area */}
              <div style={{
                position: "relative",
                padding: "20px 24px",
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderLeft: "3px solid var(--color-brand)",
                borderRadius: "var(--radius-md)",
                marginBottom: "28px"
              }}>
                <div style={{ fontSize: "0.76rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-brand-text)", marginBottom: "10px" }}>
                  FOUNDER'S MESSAGE
                </div>
                <p style={{
                  fontSize: "1rem",
                  color: "var(--color-text-primary)",
                  lineHeight: "1.75",
                  marginBottom: "12px",
                  fontWeight: "500",
                  fontStyle: "normal"
                }}>
                  “{founder.quote || "When we founded Hunar The Skill House, powered by Byteblaze Technologies, our objective was straightforward: remove the academic pretense and teach students what modern industries and businesses actually pay for."}”
                </p>
              </div>

              {/* Signature & Credentials Block */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "20px",
                paddingTop: "12px",
                borderTop: "1px solid var(--color-border)"
              }}>
                <div>
                  <div style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontStyle: "italic",
                    fontSize: "1.35rem",
                    color: "var(--color-brand-text)",
                    fontWeight: "700",
                    lineHeight: "1.2"
                  }}>
                    {founder.name || "Gurlove Malhi"}
                  </div>
                  <div style={{
                    fontSize: "0.78rem",
                    color: "var(--color-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginTop: "2px"
                  }}>
                    {founder.title || "Founder & Institutional Director"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button onClick={() => onOpenDemo()} className="btn btn-primary btn-sm">
                    Book a 1-on-1 Counseling Session
                    <ArrowRight size={14} />
                  </button>
                  <Link to="/contact" className="btn btn-outline btn-sm">
                    Visit Campus
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <style>{`
          @media (max-width: 960px) {
            .about-founder-grid {
              grid-template-columns: 1fr !important;
              gap: 48px !important;
            }
          }
        `}</style>
      </section>

      {/* ═══ FACULTY & TEACHERS SECTION ═══════════════════════════════ */}
      <section className="section" style={{
        borderBottom: "1px solid var(--color-border)",
        backgroundColor: "var(--color-surface)"
      }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 44px" }}>
            <div className="eyebrow">
              Faculty &amp; Instructors
            </div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", marginBottom: "12px" }}>
              Learn Directly From Active Industry Practitioners
            </h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem" }}>
              Our faculty members are hands-on practitioners who mentor each student individually at their workstation every day.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "28px"
          }}>
            {/* Teacher: Paramjit Singh */}
            <div style={{
              backgroundColor: "var(--color-surface-secondary)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-xl)",
              padding: "32px 28px",
              display: "flex",
              flexDirection: "column"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "18px" }}>
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "var(--radius-lg)",
                  backgroundColor: "var(--color-brand-subtle-bg)",
                  border: "1px solid var(--color-brand-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  fontWeight: "800",
                  color: "var(--color-brand-text)",
                  flexShrink: 0
                }}>
                  {(faculty.leadInstructor || "Paramjit Singh").split(/\s+/).map((part) => part[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "2px" }}>
                    {faculty.leadInstructor || "Paramjit Singh"}
                  </h3>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-brand-text)", fontWeight: "700" }}>
                    {faculty.title || "Teacher"}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: "600" }}>
                  Teaches:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {facultyDomains.map((domain) => (
                    <span key={domain} className="badge-pill badge-pill-brand" style={{ fontSize: "0.8rem", padding: "4px 12px" }}>
                      {domain}
                    </span>
                  ))}
                </div>
              </div>

              <p style={{
                fontSize: "0.92rem",
                color: "var(--color-text-secondary)",
                lineHeight: "1.7",
                marginBottom: "20px",
                flex: 1
              }}>
                {faculty.pedagogy || "Leads curriculum delivery across full-stack web engineering, practical AI automation workflows, and performance-based digital marketing campaigns with real client ad budgets."}
              </p>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link to="/courses" className="btn btn-outline" style={{ fontSize: "0.85rem", padding: "8px 16px" }}>
                  View Courses
                  <ArrowRight size={14} />
                </Link>
                <Link to="/workshop" className="btn btn-outline" style={{ fontSize: "0.85rem", padding: "8px 16px" }}>
                  AI Workshop
                </Link>
              </div>
            </div>

            {/* Mentor: Lakshay Sharma */}
            <div style={{
              backgroundColor: "var(--color-surface-secondary)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-xl)",
              padding: "32px 28px",
              display: "flex",
              flexDirection: "column"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "18px" }}>
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "var(--radius-lg)",
                  backgroundColor: "var(--color-brand-subtle-bg)",
                  border: "1px solid var(--color-brand-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  fontWeight: "800",
                  color: "var(--color-brand-text)",
                  flexShrink: 0
                }}>
                  LS
                </div>
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "2px" }}>
                    Lakshay Sharma
                  </h3>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-brand-text)", fontWeight: "700" }}>
                    Creative &amp; Motion Mentor
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: "600" }}>
                  Teaches:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  <span className="badge-pill badge-pill-brand" style={{ fontSize: "0.8rem", padding: "4px 12px" }}>
                    Graphic Design &amp; Brand Identity
                  </span>
                  <span className="badge-pill badge-pill-brand" style={{ fontSize: "0.8rem", padding: "4px 12px" }}>
                    Video Editing &amp; Motion Graphics
                  </span>
                </div>
              </div>

              <p style={{
                fontSize: "0.92rem",
                color: "var(--color-text-secondary)",
                lineHeight: "1.7",
                marginBottom: "20px",
                flex: 1
              }}>
                Specializes in commercial visual communication, Premiere Pro timeline editing, After Effects typography, brand identity guidelines, and AI image generation.
              </p>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link to="/courses" className="btn btn-outline" style={{ fontSize: "0.85rem", padding: "8px 16px" }}>
                  Explore Creative Tracks
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CAMPUS ENVIRONMENT GALLERY ═══════════════════════════════ */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 44px" }}>
            <div className="eyebrow">
              Campus Environment
            </div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", marginBottom: "12px" }}>
              A Workspace Engineered for Focus
            </h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem" }}>
              High-speed internet, dedicated workstations, and collaborative review spaces in Mullanpur Dakha.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "28px"
          }} className="about-gallery-grid">
            <div 
              className="course-preview-container"
              style={{
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-sm)"
              }}>
              <img
                src="/assets/hunar_modern_lab.jpg"
                alt="Hunar Lab Workstations"
                className="course-preview-img"
                style={{ width: "100%", height: "280px", objectFit: "cover" }}
              />
              <div style={{ padding: "16px 20px", backgroundColor: "var(--color-surface)" }}>
                <h4 style={{ fontSize: "0.95rem", marginBottom: "4px" }}>Dedicated Workstations</h4>
                <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", margin: 0 }}>
                  Each learner gets their own machine configured with production software.
                </p>
              </div>
            </div>

            <div 
              className="course-preview-container"
              style={{
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-sm)"
              }}>
              <img
                src="/assets/hunar_mentor_review.jpg"
                alt="Hunar 1-on-1 Mentorship Review"
                className="course-preview-img"
                style={{ width: "100%", height: "280px", objectFit: "cover" }}
              />
              <div style={{ padding: "16px 20px", backgroundColor: "var(--color-surface)" }}>
                <h4 style={{ fontSize: "0.95rem", marginBottom: "4px" }}>1-on-1 Portfolio Reviews</h4>
                <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", margin: 0 }}>
                  Daily desk reviews where mentors help debug code, critique designs, and refine funnels.
                </p>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .about-gallery-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </section>

      {/* ═══ CAMPUS LOCATION & VISITING ═══════════════════════════════ */}
      <section className="section-tight" style={{
        backgroundColor: "var(--color-surface-secondary)",
        borderTop: "1px solid var(--color-border)"
      }}>
        <div className="container">
          <div style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "clamp(32px, 5vw, 48px)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "24px"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-brand-text)", fontWeight: "700", marginBottom: "8px", fontSize: "0.85rem" }}>
                <MapPin size={18} />
                <span>VISIT OUR MULLANPUR DAKHA CAMPUS</span>
              </div>
              <h3 style={{ fontSize: "1.45rem", color: "var(--color-text-primary)", marginBottom: "8px" }}>
                Experience the Lab in Person
              </h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", maxWidth: "560px" }}>
                {contact.address || siteConfig.location}. {contact.officeHours || "Walk in Monday to Saturday, 9:00 AM – 7:00 PM IST."}
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button onClick={() => onOpenDemo()} className="btn btn-primary">
                Book Campus Visit / Free Demo
              </button>
              <Link to="/contact" className="btn btn-outline">
                Contact Details & Map
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
