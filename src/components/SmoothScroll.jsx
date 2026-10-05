import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";

/**
 * SmoothScroll component powered by Lenis.
 * Provides editorial, fluid momentum inertia scrolling across the entire web application,
 * automatically pauses on modal open, cleans up on unmount,
 * instantly aligns to top on route change, and respects prefers-reduced-motion.
 */
export default function SmoothScroll({ isPaused = false }) {
  const { pathname } = useLocation();

  useEffect(() => {
    // Respect user's accessibility preferences
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration for natural inertia
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.95, // Refined responsiveness without runaway acceleration
      touchMultiplier: 1.5,
      infinite: false,
      autoResize: true
    });

    window.lenis = lenis;

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Intercept in-page hash links for smooth cinematic scroll
    const handleAnchorClick = (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (anchor) {
        const href = anchor.getAttribute("href");
        if (href && href.length > 1 && !href.startsWith("#!")) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            lenis.scrollTo(target, { offset: -80, duration: 1.2 });
          }
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", handleAnchorClick);
      lenis.destroy();
      window.lenis = null;
    };
  }, []);

  // Pause Lenis when modal/drawers are open to prevent background bleed-through
  useEffect(() => {
    if (!window.lenis) return;
    if (isPaused) {
      window.lenis.stop();
    } else {
      window.lenis.start();
    }
  }, [isPaused]);

  // Instantly reset scroll to top on page navigation
  useEffect(() => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
