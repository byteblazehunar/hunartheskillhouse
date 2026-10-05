import React from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "../data/siteConfig";

export default function AccreditationStrip() {
  return (
    <div
      style={{
        backgroundColor: "var(--color-surface-secondary)",
        borderBottom: "1px solid var(--color-border)",
        fontSize: "0.75rem",
        padding: "6px 0",
        color: "var(--color-text-muted)",
        position: "relative",
        zIndex: 101,
        transition: "background-color var(--transition-theme)"
      }}
    >
      <div
        className="container-wide"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          paddingLeft: "var(--container-pad)",
          paddingRight: "var(--container-pad)"
        }}
      >
        {/* Left: Accreditations */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "0.74rem",
            letterSpacing: "0.02em"
          }}
          className="strip-accreditations"
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <span style={{ color: "var(--color-brand-text)", fontSize: "0.6rem" }}>●</span>
            ISO 9001:2015 Certified
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px"
            }}
            className="strip-hide-mobile"
          >
            <span style={{ color: "var(--color-brand-text)", fontSize: "0.6rem" }}>●</span>
            DPIIT #startupindia
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px"
            }}
            className="strip-hide-mobile"
          >
            <span style={{ color: "var(--color-brand-text)", fontSize: "0.6rem" }}>●</span>
            MSME Registered
          </span>
        </div>

        {/* Right: By Byteblaze & Login */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px"
          }}
        >
          <span
            className="strip-hide-mobile"
            style={{
              fontSize: "0.74rem",
              color: "var(--color-text-muted)"
            }}
          >
            By Byteblaze Technologies
          </span>
          <Link
            to="/login"
            style={{
              color: "var(--color-text-secondary)",
              fontWeight: "600",
              fontSize: "0.74rem",
              letterSpacing: "0.02em",
              transition: "color var(--transition-fast)"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-brand-text)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
          >
            Student / Staff Login →
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .strip-hide-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}

