import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function TrustBadges() {
  const shouldReduceMotion = useReducedMotion();

  const pillars = [
    {
      title: "100% Practical Labs",
      desc: "Individual workstations. No rote theory."
    },
    {
      title: "AI-Integrated Learning",
      desc: "Modern AI tools embedded in every track."
    },
    {
      title: "Real Client Projects",
      desc: "Live ₹10K ad budgets & production repos."
    },
    {
      title: "1-on-1 Mentorship",
      desc: "Daily support from working professionals."
    },
    {
      title: "ISO 9001 Certified",
      desc: "DPIIT & MSME recognized credential."
    }
  ];

  // We repeat the 5 pillars across 3 sets per group to guarantee that
  // the scrolling track is wider than even ultra-wide 4K displays (3840px+).
  const repetitionArray = [0, 1, 2];

  return (
    <section
      className="features-strip-section"
      aria-label="Core Institute Pillars"
      style={{
        backgroundColor: "var(--color-surface-secondary)",
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
        padding: "20px 0",
        position: "relative",
        overflow: "hidden",
        width: "100%",
        transition: "background-color var(--transition-theme)"
      }}
    >
      {/* Animated accent line across top */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: shouldReduceMotion ? 0 : 1.0, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          backgroundColor: "var(--color-brand)",
          transformOrigin: "left",
          zIndex: 2
        }}
      />

      {/* Marquee Wrapper with tab focus to pause */}
      <div
        className="features-marquee-container"
        tabIndex={0}
        role="region"
        aria-label="Institute core features ticker. Hover or focus to pause movement."
      >
        <div
          className={`features-marquee-track ${shouldReduceMotion ? "reduced-motion" : ""}`}
        >
          {/* Primary Group (Screen reader accessible items + extra visual items) */}
          <div className="features-marquee-group">
            {repetitionArray.map((repIndex) =>
              pillars.map((item, itemIndex) => {
                const isFirstSet = repIndex === 0;
                return (
                  <div
                    key={`group1-${repIndex}-${itemIndex}`}
                    className={`features-marquee-item ${!isFirstSet ? "marquee-extra-rep" : ""}`}
                    aria-hidden={!isFirstSet ? "true" : undefined}
                  >
                    <div className="features-item-heading-row">
                      <span className="features-accent-line" aria-hidden="true" />
                      <h4 className="features-item-title">
                        {item.title}
                      </h4>
                    </div>
                    <p className="features-item-desc">
                      {item.desc}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Duplicate Group (Hidden from screen readers to ensure seamless looping without repetition in speech) */}
          <div
            className="features-marquee-group features-marquee-group--duplicate"
            aria-hidden="true"
          >
            {repetitionArray.map((repIndex) =>
              pillars.map((item, itemIndex) => (
                <div
                  key={`group2-${repIndex}-${itemIndex}`}
                  className="features-marquee-item"
                >
                  <div className="features-item-heading-row">
                    <span className="features-accent-line" aria-hidden="true" />
                    <h4 className="features-item-title">
                      {item.title}
                    </h4>
                  </div>
                  <p className="features-item-desc">
                    {item.desc}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        .features-marquee-container {
          overflow: hidden;
          width: 100%;
          position: relative;
          outline: none;
        }

        .features-marquee-container:focus-visible {
          box-shadow: inset 0 0 0 2px var(--color-brand);
        }

        .features-marquee-track {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: continuousFeaturesScroll 35s linear infinite;
        }

        /* Hover and focus pausing */
        .features-marquee-container:hover .features-marquee-track,
        .features-marquee-container:focus-within .features-marquee-track {
          animation-play-state: paused;
        }

        .features-marquee-group {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .features-marquee-item {
          display: inline-flex;
          flex-direction: column;
          justifyContent: center;
          flex-shrink: 0;
          padding-right: 56px;
        }

        .features-item-heading-row {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 3px;
        }

        .features-accent-line {
          display: inline-block;
          width: 14px;
          height: 2px;
          background-color: var(--color-brand);
          border-radius: 1px;
          flex-shrink: 0;
        }

        .features-item-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
          white-space: nowrap;
          letter-spacing: -0.01em;
          line-height: 1.3;
        }

        .features-item-desc {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          line-height: 1.4;
          margin: 0;
          padding-left: 22px;
          white-space: nowrap;
        }

        /* Seamless infinite CSS transform animation */
        @keyframes continuousFeaturesScroll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }

        /* Mobile optimization */
        @media (max-width: 768px) {
          .features-marquee-track {
            animation-duration: 28s;
          }
          .features-marquee-item {
            padding-right: 36px;
          }
          .features-item-title {
            font-size: 0.84rem;
          }
          .features-item-desc {
            font-size: 0.76rem;
            padding-left: 20px;
          }
          .features-accent-line {
            width: 12px;
          }
        }

        /* Accessibility: prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .features-marquee-track {
            animation: none !important;
            transform: none !important;
            width: 100% !important;
            justify-content: center !important;
            flex-wrap: wrap !important;
            gap: 20px !important;
            padding: 8px 16px !important;
          }
          .features-marquee-group--duplicate,
          .marquee-extra-rep {
            display: none !important;
          }
          .features-marquee-item {
            padding-right: 0 !important;
          }
          .features-item-title,
          .features-item-desc {
            white-space: normal !important;
          }
        }

        .features-marquee-track.reduced-motion {
          animation: none !important;
          transform: none !important;
        }
      `}</style>
    </section>
  );
}

