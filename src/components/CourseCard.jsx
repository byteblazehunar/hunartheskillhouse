import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, User } from "lucide-react";

export default function CourseCard({ course, onOpenDemo }) {
  return (
    <div
      className="hunar-card"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "0",
        overflow: "hidden"
      }}
    >
      <div style={{
        padding: "26px",
        display: "flex",
        flexDirection: "column",
        flexGrow: 1
      }}>
        {/* Category label */}
        <div style={{
          fontSize: "0.68rem",
          fontWeight: "700",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--color-brand-text)",
          marginBottom: "10px"
        }}>
          {course.category}
        </div>
        {/* Meta row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontSize: "0.78rem",
          color: "var(--color-text-muted)",
          marginBottom: "10px"
        }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <Clock size={13} />
            {course.duration}
          </span>
          {course.badge && (
            <span style={{
              color: "var(--color-brand-text)",
              fontWeight: "600"
            }}>
              {course.badge}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: "1.15rem",
          fontWeight: "700",
          marginBottom: "8px",
          lineHeight: "1.35"
        }}>
          <Link
            to={`/course/${course.slug}`}
            style={{
              color: "var(--color-text-primary)",
              transition: "color var(--transition-fast)"
            }}
            onMouseEnter={(e) => (e.target.style.color = "var(--color-brand-text)")}
            onMouseLeave={(e) => (e.target.style.color = "var(--color-text-primary)")}
          >
            {course.title}
          </Link>
        </h3>

        {/* Description */}
        <p style={{
          fontSize: "0.88rem",
          color: "var(--color-text-secondary)",
          lineHeight: "1.6",
          marginBottom: "16px",
          flexGrow: 1
        }}>
          {course.shortDesc}
        </p>

        {/* Mentor */}
        {course.mentor && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.78rem",
            color: "var(--color-text-muted)",
            borderTop: "1px solid var(--color-border)",
            paddingTop: "12px",
            marginBottom: "16px"
          }}>
            <User size={13} />
            <span>{course.mentor.name}</span>
          </div>
        )}

        {/* Actions */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          marginTop: "auto"
        }}>
          <Link
            to={`/course/${course.slug}`}
            className="btn btn-outline btn-sm"
            style={{
              fontSize: "0.84rem",
              padding: "8px 12px",
              minHeight: "44px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            Details
          </Link>

          <button
            onClick={() => onOpenDemo(course.id, course.title)}
            className="btn btn-primary btn-sm"
            style={{
              fontSize: "0.84rem",
              padding: "8px 12px",
              minHeight: "44px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
          >
            <span>Free Demo</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
