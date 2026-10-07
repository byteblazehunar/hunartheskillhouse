import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import usePublicCatalog from "../hooks/usePublicCatalog";
import { siteConfig } from "../data/siteConfig";
import CourseCard from "../components/CourseCard";

export default function Courses({ onOpenDemo }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { courses: allCourses } = usePublicCatalog();
  const courseCategories = useMemo(
    () => ["All", ...new Set(allCourses.map((course) => course.category).filter(Boolean))],
    [allCourses]
  );

  const filteredCourses = allCourses.filter((course) => {
    const matchesCategory =
      selectedCategory === "All" || course.category === selectedCategory;
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.tools && course.tools.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Page Header */}
      <section className="section-tight" style={{
        borderBottom: "1px solid var(--color-border)"
      }}>
        <div className="container">
          <div style={{
            fontSize: "0.82rem",
            color: "var(--color-text-muted)",
            marginBottom: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <Link to="/" style={{ color: "var(--color-text-secondary)" }}>Home</Link>
            <span>/</span>
            <span style={{ color: "var(--color-brand-text)" }}>All Programs</span>
          </div>

          <div style={{
            fontSize: "0.72rem",
            fontWeight: "700",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-brand-text)",
            marginBottom: "10px"
          }}>
            12 Job-Ready Career Tracks
          </div>

          <h1 style={{ marginBottom: "12px" }}>
            Explore Our Programs
          </h1>
          <p style={{
            fontSize: "1.05rem",
            color: "var(--color-text-secondary)",
            maxWidth: "640px",
            lineHeight: "1.7"
          }}>
            Every program at Hunar is built to make you job-ready.
            Learn with dedicated workstations, live ad budgets, and 1-on-1 mentor guidance.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section style={{
        padding: "20px 0",
        backgroundColor: "var(--color-surface-secondary)",
        borderBottom: "1px solid var(--color-border)",
        transition: "background-color var(--transition-theme)"
      }}>
        <div className="container">
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px"
          }}>
            {/* Search */}
            <div style={{
              position: "relative",
              flex: "1 1 280px",
              maxWidth: "400px"
            }}>
              <Search
                size={16}
                color="var(--color-text-muted)"
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)"
                }}
              />
              <input
                type="text"
                placeholder="Search programs, tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "38px" }}
              />
            </div>

            {/* Category Pills */}
            <div style={{
              display: "flex",
              gap: "6px",
              flexWrap: "wrap"
            }}>
              {courseCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "var(--radius-pill)",
                    border: "1px solid",
                    borderColor: selectedCategory === cat ? "var(--color-brand)" : "var(--color-border)",
                    backgroundColor: selectedCategory === cat ? "var(--color-brand-subtle-bg)" : "transparent",
                    color: selectedCategory === cat ? "var(--color-brand-text)" : "var(--color-text-secondary)",
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all var(--transition-fast)"
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="section">
        <div className="container">
          {filteredCourses.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "48px 20px",
              backgroundColor: "var(--color-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)"
            }}>
              <h3 style={{ marginBottom: "10px" }}>No programs match your search</h3>
              <p style={{ marginBottom: "20px" }}>
                Try different keywords or clear the category filter.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="btn btn-outline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
              gap: "24px"
            }}>
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onOpenDemo={onOpenDemo}
                />
              ))}
            </div>
          )}

          {/* Counselor CTA */}
          <div style={{
            marginTop: "56px",
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px"
          }}>
            <div>
              <div style={{
                fontSize: "0.72rem",
                fontWeight: "700",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-brand-text)",
                marginBottom: "8px"
              }}>
                Need Personalized Advice?
              </div>
              <h3 style={{ marginBottom: "6px" }}>
                Not sure which program fits your goals?
              </h3>
              <p style={{ maxWidth: "520px" }}>
                Talk to a counselor at Hunar. We'll evaluate your background and recommend the right track.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={() => onOpenDemo()}
                className="btn btn-primary"
              >
                Free Counseling
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
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
