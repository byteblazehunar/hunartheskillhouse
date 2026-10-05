import React from "react";

export default function SectionHeading({
  kicker,
  title,
  subtitle,
  centered = true,
  align
}) {
  const textAlign = align || (centered ? "center" : "left");

  return (
    <div style={{
      textAlign,
      maxWidth: textAlign === "center" ? "680px" : "100%",
      marginLeft: textAlign === "center" ? "auto" : "0",
      marginRight: textAlign === "center" ? "auto" : "0",
      marginBottom: "48px"
    }}>
      {kicker && (
        <div style={{
          fontSize: "0.72rem",
          fontWeight: "700",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--color-brand-text)",
          marginBottom: "10px"
        }}>
          {kicker}
        </div>
      )}
      <h2 style={{
        marginBottom: subtitle ? "12px" : "0",
        letterSpacing: "-0.02em"
      }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{
          fontSize: "1rem",
          color: "var(--color-text-secondary)",
          lineHeight: "1.7",
          maxWidth: "60ch",
          margin: textAlign === "center" ? "0 auto" : undefined
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
