import React, { useState, useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";

export default function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 1.5,
  decimals = 0,
  formatNumber = true,
  className = "",
  style = {}
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(shouldReduceMotion ? value : 0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    if (!isInView) return;

    let startTime = null;
    let animationFrameId = null;

    // Ease out expo for a natural, decelerating, premium feel
    const easeOutExpo = (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easedProgress = easeOutExpo(progress);
      const current = easedProgress * value;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isInView, value, duration, shouldReduceMotion]);

  const formattedNum = formatNumber
    ? Math.round(displayValue).toLocaleString("en-IN")
    : decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue);

  const fullLabel = `${prefix}${formatNumber ? value.toLocaleString("en-IN") : value}${suffix}`;

  return (
    <span
      ref={ref}
      className={className}
      style={{
        display: "inline-block",
        fontVariantNumeric: "tabular-nums",
        ...style
      }}
      aria-label={fullLabel}
    >
      <span aria-hidden="true">
        {prefix}
        {formattedNum}
        {suffix}
      </span>
    </span>
  );
}
