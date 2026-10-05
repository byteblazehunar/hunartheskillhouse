import React from "react";
import { motion, useReducedMotion } from "framer-motion";

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
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  const actualDuration = shouldReduceMotion ? 0.3 : isMobile ? 0.5 : duration;
  const actualY = shouldReduceMotion ? 0 : isMobile ? Math.min(yOffset, 20) : yOffset;

  const MotionComponent = motion[as] || motion.div;

  const containerVariants = {
    hidden: {
      opacity: 0,
      y: actualY
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: actualDuration,
        delay,
        ease: [0.22, 1, 0.36, 1], // Smooth cubic bezier
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
  const actualY = shouldReduceMotion ? 0 : yOffset;

  const itemVariants = {
    hidden: { opacity: 0, y: actualY },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.3 : 0.6,
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
