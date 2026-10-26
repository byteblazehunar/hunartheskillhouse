import React, { useEffect, useState } from "react";

export default function CinematicIntro() {
  const [show, setShow] = useState(true);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const timers = [
      window.setTimeout(() => setPhase(1), 350),
      window.setTimeout(() => setPhase(2), 900),
      window.setTimeout(() => setPhase(3), 1900),
      window.setTimeout(() => setPhase(4), 2600),
      window.setTimeout(() => {
        setShow(false);
        document.body.style.overflow = "";
      }, 3200),
    ];

    return () => {
      timers.forEach(window.clearTimeout);
      document.body.style.overflow = "";
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className="hunar-startup-screen"
      role="status"
      aria-live="polite"
      aria-label="Loading Hunar The Skill House"
      style={{
        backgroundColor: "#050505",
        opacity: phase >= 4 ? 0 : 1,
        transition: "opacity 0.7s ease",
        pointerEvents: "none",
      }}
    >
      <div
        className="hunar-startup-card"
        style={{
          transform: phase >= 3 ? "scale(1.35)" : "scale(1)",
          opacity: phase >= 3 ? 0 : 1,
          transition: "transform 1s cubic-bezier(0.7, 0, 0.3, 1), opacity 0.8s ease",
        }}
      >
        <div className="hunar-startup-mark">
          <img
            src="/hunar-white-logo.png"
            alt="Hunar The Skill House logo"
            className="hunar-startup-logo"
            style={{
              opacity: phase >= 1 ? 1 : 0,
              transform: phase >= 1 ? "scale(1)" : "scale(0.72)",
              transition: "opacity 0.7s ease, transform 0.9s cubic-bezier(0.7, 0, 0.3, 1)",
            }}
          />
        </div>
        <span className="hunar-startup-label" style={{ opacity: phase >= 2 ? 1 : 0 }}>
          Loading your learning journey
        </span>
      </div>
    </div>
  );
}
