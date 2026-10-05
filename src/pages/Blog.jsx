import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight, User } from "lucide-react";
import { blogData } from "../data/blogData";

export default function Blog() {
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
            <span style={{ color: "var(--color-brand-text)", fontWeight: "600" }}>Insights & Articles</span>
          </div>

          <div className="eyebrow">
            Hunar Knowledge Hub
          </div>

          <h1 style={{ fontSize: "clamp(2.2rem, 3.8vw, 3.2rem)", fontWeight: "700", marginBottom: "16px" }}>
            Articles & Insights
          </h1>

          <p style={{
            fontSize: "1.05rem",
            color: "var(--color-text-secondary)",
            maxWidth: "700px",
            lineHeight: "1.7"
          }}>
            Practical analysis, career guidance, and technical breakdowns from our faculty
            at Hunar The Skill House, Mullanpur Dakha.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="section">
        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "32px"
          }}>
            {blogData.map((post) => (
              <article
                key={post.slug}
                className="hunar-card"
                style={{
                  padding: "0",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden"
                }}
              >
                <div style={{ width: "100%", height: "220px", overflow: "hidden", position: "relative" }}>
                  <img
                    src={post.image}
                    alt={post.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.4s ease"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  />
                  <span
                    className="badge badge-brand"
                    style={{
                      position: "absolute",
                      top: "14px",
                      left: "14px",
                      fontSize: "0.72rem"
                    }}
                  >
                    {post.category}
                  </span>
                </div>

                <div style={{ padding: "26px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    fontSize: "0.8rem",
                    color: "var(--color-text-muted)",
                    marginBottom: "12px"
                  }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={13} />
                      {post.date}
                    </span>
                    <span>•</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={13} />
                      {post.readTime}
                    </span>
                  </div>

                  <h2 style={{
                    fontSize: "1.25rem",
                    fontWeight: "700",
                    marginBottom: "12px",
                    lineHeight: "1.35"
                  }}>
                    <Link
                      to={`/blog/${post.slug}`}
                      style={{ color: "var(--color-text-primary)", transition: "color var(--transition-fast)" }}
                      onMouseEnter={(e) => (e.target.style.color = "var(--color-brand-text)")}
                      onMouseLeave={(e) => (e.target.style.color = "var(--color-text-primary)")}
                    >
                      {post.title}
                    </Link>
                  </h2>

                  <p style={{
                    fontSize: "0.9rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: "1.6",
                    marginBottom: "20px",
                    flexGrow: 1
                  }}>
                    {post.excerpt}
                  </p>

                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid var(--color-border)",
                    paddingTop: "16px"
                  }}>
                    <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                      By <strong style={{ color: "var(--color-text-primary)" }}>{post.author}</strong>
                    </div>

                    <Link
                      to={`/blog/${post.slug}`}
                      style={{
                        color: "var(--color-brand-text)",
                        fontWeight: "600",
                        fontSize: "0.85rem",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      <span>Read Article</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

