"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
  offset?: ["start end", "end start"] | ["start start", "end end"];
}

export default function ParallaxScroll({
  children,
  speed = 0.5,
  direction = "up",
  className = "",
  offset = ["start end", "end start"],
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset,
  });

  // Apply different transform based on direction
  const x =
    direction === "left" || direction === "right"
      ? useTransform(
          scrollYProgress,
          [0, 1],
          direction === "right" ? [0, 100 * speed] : [0, -100 * speed]
        )
      : 0;

  const y =
    direction === "up" || direction === "down"
      ? useTransform(
          scrollYProgress,
          [0, 1],
          direction === "down" ? [0, 100 * speed] : [0, -100 * speed]
        )
      : 0;

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1 + speed * 0.2]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 1, 0.8]);

  return (
    <motion.div
      ref={ref}
      style={{ x, y, scale, opacity }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// For floating animated elements
export function FloatingElement({
  children,
  xFactor = 10,
  yFactor = 10,
  duration = 5,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  xFactor?: number;
  yFactor?: number;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [`${-yFactor}px`, `${yFactor}px`, `${-yFactor}px`],
        x: [`${-xFactor}px`, `${xFactor}px`, `${-xFactor}px`],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay: delay,
      }}
    >
      {children}
    </motion.div>
  );
}
