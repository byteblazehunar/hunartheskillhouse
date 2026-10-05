import React from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Calendar, Clock, ArrowLeft, User, Share2, ArrowRight } from "lucide-react";
import { blogData } from "../data/blogData";

export default function BlogPost({ onOpenDemo }) {
  const { slug } = useParams();
  const post = blogData.find((p) => p.slug === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const otherPosts = blogData.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
      {/* Header */}
      <section className="section-tight" style={{
        backgroundColor: "var(--color-surface-secondary)",
        borderBottom: "1px solid var(--color-border)"
      }}>
        <div className="container" style={{ maxWidth: "840px" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "16px" }}>
            <Link to="/blog" style={{ color: "var(--color-text-secondary)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <ArrowLeft size={14} />
              <span>Back to all articles</span>
            </Link>
          </div>

          <span className="badge badge-brand" style={{ marginBottom: "14px" }}>
            {post.category}
          </span>

          <h1 style={{
            fontSize: "clamp(2rem, 3.5vw, 3rem)",
            fontWeight: "800",
            marginBottom: "18px",
            lineHeight: "1.2"
          }}>
            {post.title}
          </h1>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "0.88rem",
            color: "var(--color-text-secondary)",
            flexWrap: "wrap"
          }}>
            <span>Author: <strong style={{ color: "var(--color-text-primary)" }}>{post.author}</strong> ({post.authorRole})</span>
            <span>•</span>
            <span>{post.date}</span>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </section>

      {/* Main Article Body */}
      <section className="section">
        <div className="container" style={{ maxWidth: "840px" }}>
          {/* Featured Image */}
          <div style={{
            borderRadius: "var(--radius-xl)",
            overflow: "hidden",
            marginBottom: "40px",
            border: "1px solid var(--color-border)"
          }}>
            <img
              src={post.image}
              alt={post.title}
              style={{ width: "100%", height: "auto", display: "block", aspectRatio: "16/9", objectFit: "cover" }}
            />
          </div>

          {/* Paragraphs */}
          <div style={{
            color: "var(--color-text-primary)",
            fontSize: "1.1rem",
            lineHeight: "1.9",
            display: "flex",
            flexDirection: "column",
            gap: "24px"
          }}>
            {post.content.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          {/* Author Callout */}
          <div className="hunar-card" style={{
            marginTop: "48px",
            padding: "28px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            backgroundColor: "var(--color-surface)"
          }}>
            <div style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              backgroundColor: "var(--color-brand-subtle-bg)",
              border: "1px solid var(--color-brand-border)",
              color: "var(--color-brand-text)",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              flexShrink: 0
            }}>
              {post.author.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <h4 style={{ fontSize: "1.05rem", color: "var(--color-text-primary)", marginBottom: "4px" }}>
                Written by {post.author}
              </h4>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", margin: 0 }}>
                {post.authorRole} at Hunar The Skill House, Mullanpur Dakha.
              </p>
            </div>
          </div>

          {/* Next Steps CTA */}
          <div style={{
            marginTop: "48px",
            padding: "36px",
            borderRadius: "var(--radius-xl)",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            textAlign: "center"
          }}>
            <h3 style={{ fontSize: "1.45rem", color: "var(--color-text-primary)", marginBottom: "10px" }}>
              Ready to Learn These Skills Firsthand?
            </h3>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", maxWidth: "540px", margin: "0 auto 20px" }}>
              Experience our workstation lab in Mullanpur Dakha. Attend a free, zero-obligation demo session.
            </p>
            <button onClick={() => onOpenDemo()} className="btn btn-primary">
              <span>Book Free Demo Class</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

