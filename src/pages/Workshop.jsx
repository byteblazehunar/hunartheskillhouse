import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Cpu,
  Video,
  Code2,
  Bot,
  Zap,
  ArrowRight,
  ShieldCheck,
  User,
  Clock,
  Layers,
  Award
} from "lucide-react";
import { siteConfig } from "../data/siteConfig";
import AnimatedCounter from "../components/AnimatedCounter";

export default function Workshop({ onOpenDemo }) {
  const dailyModules = [
    { day: "Day 01", title: "Learn the Art of Writing Better Prompts", category: "Foundation" },
    { day: "Day 02", title: "Understand How AI Models Work", category: "Foundation" },
    { day: "Day 03", title: "Build Your Own Custom AI Assistants", category: "Agents" },
    { day: "Day 04", title: "Connect AI with Your Favorite Tools", category: "Integration" },
    { day: "Day 05", title: "Research Faster with AI", category: "Research" },
    { day: "Day 06", title: "Create Presentations with ChatGPT", category: "Productivity" },
    { day: "Day 07", title: "Build AI Apps with Google AI Studio", category: "Development" },
    { day: "Day 08", title: "Explore the Power of NotebookLLM", category: "Research" },
    { day: "Day 09", title: "Use the SCQA Framework for Better Thinking", category: "Strategy" },
    { day: "Day 10", title: "Boost Your Productivity with AI Tools", category: "Productivity" },
    { day: "Day 11", title: "Automate Meetings with AI", category: "Automation" },
    { day: "Day 12", title: "Create Content Faster with AI", category: "Content" },
    { day: "Day 13", title: "Learn Advanced AI Skills with Claude", category: "Advanced AI" },
    { day: "Day 14", title: "Unlock More Features with Claude MCP", category: "Advanced AI" },
    { day: "Day 15", title: "Make Data Easy to Understand", category: "Analytics" },
    { day: "Day 16", title: "Create Videos with HeyGen", category: "Video Gen" },
    { day: "Day 17", title: "Generate Voices in Multiple Languages", category: "Voice AI" },
    { day: "Day 18", title: "Create Music with AI", category: "Audio AI" },
    { day: "Day 19", title: "Design Stunning Images with Nano Banana", category: "Visual AI" },
    { day: "Day 20", title: "Create Ads in Minutes", category: "Marketing" },
    { day: "Day 21", title: "Make Professional Videos Without Editing", category: "Video AI" },
    { day: "Day 22", title: "Turn Videos into Viral Clips", category: "Social AI" },
    { day: "Day 23", title: "Must-Have AI Tools for Business Leaders", category: "Business" },
    { day: "Day 24", title: "Build Apps and Websites Quickly", category: "Development" },
    { day: "Day 25", title: "Discover Google's Free AI Tools", category: "Tools" },
    { day: "Day 26", title: "Create Interactive Dashboards with Ease", category: "Analytics" },
    { day: "Day 27", title: "Learn Everything About AI Agents", category: "Agents" },
    { day: "Day 28", title: "Think Like an AI Strategist", category: "Strategy" },
    { day: "Day 29", title: "Analyze Data Like a Pro with AI", category: "Analytics" }
  ];

  const targetAudiences = [
    {
      title: "Students & Job Seekers",
      desc: "Supercharge your resume with in-demand AI workflows and stand out from thousands of generic applicants."
    },
    {
      title: "Working Professionals",
      desc: "Save 15+ hours weekly by automating data research, reporting, deck creation, and correspondence."
    },
    {
      title: "Business Owners & Founders",
      desc: "Deploy automated customer service, marketing copy generation, and lead capture systems at zero headcount cost."
    },
    {
      title: "Content Creators & Designers",
      desc: "Produce 10x more high-converting social assets, synthetic videos, and voiceovers without expensive studio setups."
    }
  ];

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
      {/* Hero Section */}
      <section className="section" style={{
        backgroundColor: "var(--color-surface-secondary)",
        borderBottom: "1px solid var(--color-border)",
        position: "relative",
        overflow: "hidden"
      }}>
        <div className="bg-glow-radial" />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
            <div style={{ display: "inline-flex", gap: "10px", alignItems: "center", marginBottom: "16px" }}>
              <span className="brand-ribbon-tag">FLAGSHIP BOOTCAMP</span>
              <span className="badge badge-brand">
                <Sparkles size={12} />
                <span>Mullanpur Dakha Campus</span>
              </span>
            </div>

            <h1 style={{
              fontSize: "clamp(2.4rem, 4.2vw, 3.6rem)",
              fontWeight: "700",
              lineHeight: "1.15",
              marginBottom: "16px",
              letterSpacing: "-0.02em"
            }}>
              30 Days AI Workshop
            </h1>

            <p style={{
              fontSize: "1.05rem",
              color: "var(--color-brand-text)",
              fontWeight: "700",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "16px"
            }}>
              LEARN • BUILD • AUTOMATE • GROW
            </p>

            <p style={{
              fontSize: "1.05rem",
              color: "var(--color-text-secondary)",
              lineHeight: "1.8",
              marginBottom: "36px"
            }}>
              Accelerate your digital productivity with Mullanpur's most comprehensive practical AI bootcamp.
              Master prompt engineering, custom AI agents, synthetic video avatars, no-code web tools, and business automation.
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap", marginBottom: "40px" }}>
              <button
                onClick={() => onOpenDemo("11", "30 Days AI Workshop")}
                className="btn btn-primary btn-lg"
                style={{ minHeight: "48px" }}
              >
                <span>Reserve Your Seat / Free Demo</span>
                <ArrowRight size={18} />
              </button>

              <a
                href={siteConfig.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg"
                style={{ minHeight: "48px" }}
              >
                Ask Questions on WhatsApp
              </a>
            </div>

            {/* Quick Metrics Bar */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "14px",
              padding: "20px",
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)"
            }}>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--color-brand-text)" }}>
                  <AnimatedCounter value={29} />
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)" }}>Hands-on Modules</div>
              </div>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--color-text-primary)" }}>0 Coding</div>
                <div style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)" }}>Beginner Friendly</div>
              </div>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--color-brand-text)" }}>
                  <AnimatedCounter value={100} suffix="%" />
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)" }}>Individual Lab Seats</div>
              </div>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--color-text-primary)" }}>ISO 9001</div>
                <div style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)" }}>Verified Certificate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mentor Spotlight */}
      <section className="section-tight" style={{ backgroundColor: "var(--color-surface-secondary)" }}>
        <div className="container">
          <div className="hunar-card" style={{
            maxWidth: "760px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: "24px",
            flexWrap: "wrap",
            padding: "28px"
          }}>
            <div style={{
              width: "74px",
              height: "74px",
              borderRadius: "50%",
              backgroundColor: "var(--color-brand-subtle-bg)",
              border: "2px solid var(--color-brand-border)",
              color: "var(--color-brand-text)",
              fontWeight: "700",
              fontSize: "1.6rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              PS
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.8rem", color: "var(--color-brand-text)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Lead Workshop Instructor
              </div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "4px" }}>
                Paramjit Singh
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: "1.6" }}>
                Teacher at Hunar The Skill House, leading Artificial Intelligence (AI), Web Development, and Digital Marketing programs.
                Guiding students through daily hands-on prompt frameworks, custom GPTs, and production AI tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Full 29-Day Curriculum */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 48px" }}>
            <span className="badge badge-brand" style={{ marginBottom: "12px" }}>
              STEP-BY-STEP ROADMAP
            </span>
            <h2 style={{ fontSize: "clamp(2rem, 3.2vw, 2.7rem)", marginBottom: "14px" }}>
              Complete 29-Day Practical Curriculum
            </h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "1.05rem" }}>
              One distinct, actionable tool or workflow every day. By Day 29, you will possess a complete AI operating system for your career.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px"
          }}>
            {dailyModules.map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  transition: "all var(--transition-fast)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-brand-border)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-border)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    color: "var(--color-brand-text)",
                    background: "var(--color-brand-subtle-bg)",
                    border: "1px solid var(--color-brand-border)",
                    padding: "2px 8px",
                    borderRadius: "4px"
                  }}>
                    {item.day}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)" }}>
                    {item.category}
                  </span>
                </div>
                <h4 style={{ fontSize: "0.98rem", fontWeight: "600", color: "var(--color-text-primary)", lineHeight: "1.4" }}>
                  {item.title}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is this for? */}
      <section className="section" style={{ backgroundColor: "var(--color-surface-secondary)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 48px" }}>
            <span className="badge badge-brand" style={{ marginBottom: "12px" }}>
              TARGET AUDIENCE
            </span>
            <h2 style={{ fontSize: "clamp(2rem, 3.2vw, 2.7rem)", fontWeight: "700", marginBottom: "14px" }}>
              Who Should Attend The AI Workshop?
            </h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "1.05rem" }}>
              No technical or coding background required. Open to anyone motivated to learn practical modern workflows.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px"
          }}>
            {targetAudiences.map((aud, i) => (
              <div key={i} className="hunar-card" style={{ padding: "28px 24px" }}>
                <CheckCircle2 size={24} color="var(--color-brand-text)" style={{ marginBottom: "14px" }} />
                <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "8px" }}>
                  {aud.title}
                </h3>
                <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: "1.6" }}>
                  {aud.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Action Banner */}
      <section className="section">
        <div className="container">
          <div style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-brand-border)",
            borderRadius: "var(--radius-xl)",
            padding: "clamp(40px, 6vw, 60px)",
            textAlign: "center"
          }}>
            <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "16px" }}>
              Reserve Your Seat in the Next AI Batch
            </h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "1.05rem", maxWidth: "600px", margin: "0 auto 30px" }}>
              Batches are strictly limited to ensure individual workstation access and 1-on-1 mentor guidance.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
              <button
                onClick={() => onOpenDemo("11", "30 Days AI Workshop")}
                className="btn btn-primary btn-lg"
                style={{ minHeight: "48px" }}
              >
                <span>Book Free Demo Class</span>
                <ArrowRight size={18} />
              </button>

              <a
                href={siteConfig.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg"
                style={{ minHeight: "48px" }}
              >
                Direct WhatsApp Inquiry
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
