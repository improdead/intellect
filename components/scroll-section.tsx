"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScrollRevealSectionProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  animation?: "fade" | "slide" | "scale" | "rotate" | "rise" | "drop" | "none";
  duration?: number;
  delay?: number;
  distance?: number;
  once?: boolean;
  direction?: "up" | "down" | "left" | "right";
  staggerChildren?: boolean;
  staggerDelay?: number;
  viewport?: { once?: boolean; margin?: string };
  style?: React.CSSProperties;
}

export default function ScrollRevealSection({
  children,
  className = "",
  threshold = 0.1,
  animation = "fade",
  duration = 0.5,
  delay = 0,
  distance = 50,
  once = true,
  direction = "up",
  staggerChildren = false,
  staggerDelay = 0.1,
  viewport = { once: true, margin: "-100px" },
  style = {},
}: ScrollRevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Get animation properties based on the animation type
  const getAnimationProps = () => {
    const defaultProps = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration, delay, ease: "easeOut" },
    };

    switch (animation) {
      case "fade":
        return defaultProps;
      case "slide":
        const x =
          direction === "left"
            ? -distance
            : direction === "right"
            ? distance
            : 0;
        const y =
          direction === "up" ? distance : direction === "down" ? -distance : 0;
        return {
          initial: { opacity: 0, x, y },
          animate: { opacity: 1, x: 0, y: 0 },
          transition: { duration, delay, ease: "easeOut" },
        };
      case "scale":
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration, delay, ease: "easeOut" },
        };
      case "rotate":
        return {
          initial: { opacity: 0, rotate: direction === "left" ? -10 : 10 },
          animate: { opacity: 1, rotate: 0 },
          transition: { duration, delay, ease: "easeOut" },
        };
      case "rise":
        return {
          initial: { opacity: 0, y: distance },
          animate: { opacity: 1, y: 0 },
          transition: { duration, delay, ease: "easeOut" },
        };
      case "drop":
        return {
          initial: { opacity: 0, y: -distance },
          animate: { opacity: 1, y: 0 },
          transition: { duration, delay, ease: "easeOut" },
        };
      case "none":
        return {
          initial: {},
          animate: {},
          transition: { duration, delay },
        };
      default:
        return defaultProps;
    }
  };

  // Apply staggering to children if requested
  const renderChildren = () => {
    if (!staggerChildren) {
      return children;
    }

    return React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return child;

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration,
            delay: delay + index * staggerDelay,
            ease: "easeOut",
          }}
        >
          {child}
        </motion.div>
      );
    });
  };

  const animationProps = getAnimationProps();

  return (
    <motion.div
      ref={ref}
      className={cn("overflow-hidden", className)}
      initial={animationProps.initial}
      whileInView={animationProps.animate}
      viewport={viewport}
      transition={animationProps.transition}
      style={style}
    >
      {staggerChildren ? renderChildren() : children}
    </motion.div>
  );
}

// Parallax section that moves as you scroll
export function ParallaxSection({
  children,
  speed = 10,
  className = "",
  direction = "up",
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Calculate x/y offset based on direction and speed
  const x =
    direction === "left" || direction === "right"
      ? useTransform(
          scrollYProgress,
          [0, 1],
          direction === "right" ? [0, speed * 10] : [0, speed * -10]
        )
      : 0;

  const y =
    direction === "up" || direction === "down"
      ? useTransform(
          scrollYProgress,
          [0, 1],
          direction === "down" ? [0, speed * 10] : [0, speed * -10]
        )
      : 0;

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ x, y }} className="relative">
        {children}
      </motion.div>
    </div>
  );
}
