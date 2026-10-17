import React, { useState, useEffect } from "react";

export default function CinematicIntro() {
  const [show, setShow] = useState(false); // Start hidden — homepage shows immediately
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Respect user's motion preference
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // Disable cinematic intro on mobile — logo and content must appear instantly
    if (window.innerWidth < 768) {
      sessionStorage.setItem("hasSeenHunarIntro_v4", "true");
      return;
    }

    // Check if we've already shown the intro this session
    const hasSeenIntro = sessionStorage.getItem("hasSeenHunarIntro_v4");
    if (hasSeenIntro) {
      return;
    }

    // Delay intro so homepage + logo are visible first (800ms head start)
    const tStart = setTimeout(() => {
      setShow(true);
      document.body.style.overflow = "hidden";

      const t1 = setTimeout(() => setPhase(1), 400);
      const t2 = setTimeout(() => setPhase(2), 1200);
      const t3 = setTimeout(() => setPhase(3), 2400);
      const t4 = setTimeout(() => setPhase(4), 3200);
      const t5 = setTimeout(() => {
        setShow(false);
        document.body.style.overflow = "";
        sessionStorage.setItem("hasSeenHunarIntro_v4", "true");
      }, 3800);

      const handleSkip = () => {
        setShow(false);
        document.body.style.overflow = "";
        sessionStorage.setItem("hasSeenHunarIntro_v4", "true");
        clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
        clearTimeout(t4); clearTimeout(t5);
      };

      window.addEventListener("click", handleSkip);
      window.addEventListener("keydown", handleSkip);
    }, 800);

    return () => {
      clearTimeout(tStart);
      document.body.style.overflow = "";
    };
  }, []);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "#050505", // Deep cinematic black
        zIndex: 99999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity: phase >= 4 ? 0 : 1,
        transition: "opacity 0.8s cubic-bezier(0.7, 0, 0.3, 1)",
        pointerEvents: "none",
        perspective: "1000px"
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        
        {/* Text Reveal Container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: phase >= 3 ? "scale(5) translateZ(200px)" : "scale(1) translateZ(0)",
            filter: phase >= 3 ? "blur(20px)" : "blur(0px)",
            opacity: phase >= 3 ? 0 : 1,
            transition: "transform 1.2s cubic-bezier(0.7, 0, 0.3, 1), filter 1s ease, opacity 1s ease 0.2s",
            zIndex: 1
          }}
        >
          <h1
            style={{
              fontSize: "clamp(3rem, 10vw, 8rem)",
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: "0.2em",
              margin: 0,
              lineHeight: 1,
              fontFamily: "var(--font-heading)",
              textTransform: "uppercase",
              clipPath: phase >= 2 ? "inset(0 0 0 0)" : "inset(0 50% 0 50%)",
              transition: "clip-path 1s cubic-bezier(0.7, 0, 0.3, 1)",
            }}
          >
            Hunar
          </h1>
          
          <div
            style={{
              fontSize: "clamp(0.8rem, 2vw, 1.5rem)",
              fontWeight: 600,
              color: "#EFDB19",
              letterSpacing: "0.4em",
              marginTop: "10px",
              textTransform: "uppercase",
              opacity: phase >= 2 ? 1 : 0,
              transform: phase >= 2 ? "translateY(0)" : "translateY(-20px)",
              transition: "opacity 0.8s ease 0.5s, transform 0.8s cubic-bezier(0.7, 0, 0.3, 1) 0.5s"
            }}
          >
            The Skill House
          </div>
        </div>
      </div>
    </div>
  );
}
