import React, { useEffect, useState } from "react";

export default function CinematicIntro() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const timeout = window.setTimeout(() => {
      setShow(false);
      document.body.style.overflow = "";
    }, 1400);

    return () => {
      window.clearTimeout(timeout);
      document.body.style.overflow = "";
    };
  }, []);

  if (!show) return null;

  return (
    <div className="hunar-startup-screen" role="status" aria-live="polite" aria-label="Loading Hunar The Skill House">
      <div className="hunar-startup-card">
        <img src="/logo-light.png" alt="Hunar The Skill House" className="hunar-startup-logo" />
        <div className="hunar-startup-spinner" aria-hidden="true" />
        <span>Loading your learning journey</span>
      </div>
    </div>
  );
}
