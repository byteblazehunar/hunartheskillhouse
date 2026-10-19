import React from "react";
import { motion, useReducedMotion } from "framer-motion";

// Detect mobile once at module level — avoids SSR issues and is stable
const isMobileDevice = typeof window !== "undefined" && window.innerWidth <= 768;

export function ScrollReveal({
  children,
  as = "div",
  delay = 0,
  duration = 0.8,
  yOffset = 36,
  staggerChildren = 0,
  className = "",
  style = {},
  id,
  amount = 0.2
}) {
  const shouldReduceMotion = useReducedMotion();

  // On mobile or reduced-motion: skip animation entirely, render visible immediately.
  // This avoids IntersectionObserver issues caused by overflow:hidden on body.
  if (shouldReduceMotion || isMobileDevice) {
    const Tag = as;
    return (
      <Tag id={id} className={className} style={style}>
        {children}
      </Tag>
    );
  }

  const MotionComponent = motion[as] || motion.div;

  const containerVariants = {
    hidden: { opacity: 0, y: yOffset },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
        ...(staggerChildren > 0 && {
          staggerChildren,
          delayChildren: delay
        })
      }
    }
  };

  return (
    <MotionComponent
      id={id}
      className={className}
      style={style}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
    >
      {children}
    </MotionComponent>
  );
}

export function ScrollItem({
  children,
  className = "",
  style = {},
  yOffset = 24
}) {
  const shouldReduceMotion = useReducedMotion();

  // Same: skip animation on mobile
  if (shouldReduceMotion || isMobileDevice) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  const itemVariants = {
    hidden: { opacity: 0, y: yOffset },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <motion.div className={className} style={style} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

export default ScrollReveal;
