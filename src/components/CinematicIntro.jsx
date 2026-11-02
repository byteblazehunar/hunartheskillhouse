import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

export default function CinematicIntro() {
  const { theme } = useTheme();
  const [show, setShow] = useState(true);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Respect user's motion preference
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShow(false);
      return;
    }

    // Check if we've already shown the intro this session
    const hasSeenIntro = sessionStorage.getItem("hasSeenHunarIntro_v4");
    if (hasSeenIntro) {
      setShow(false);
      return;
    }

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

      window.addEventListener("click", handleSkip, { once: true });
      window.addEventListener("keydown", handleSkip, { once: true });

      return () => {
        clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
        clearTimeout(t4); clearTimeout(t5);
        window.removeEventListener("click", handleSkip);
        window.removeEventListener("keydown", handleSkip);
      };
    }, 0);

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
          <img
            src={theme === "light" ? "/logo-light.png" : "/logo-dark.png"}
            alt="Hunar The Skill House"
            width="240"
            height="80"
            fetchPriority="high"
            decoding="async"
            style={{ position: "absolute", width: "min(52vw, 240px)", height: "auto", opacity: phase >= 2 ? 0 : 1, transform: phase >= 2 ? "scale(1.08)" : "scale(1)", transition: "opacity 0.5s ease, transform 0.8s ease", objectFit: "contain" }}
          />
        
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
