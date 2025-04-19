"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextSpotlightProps {
  children: React.ReactNode;
  className?: string;
  highlightColor?: string;
}

export default function TextSpotlight({
  children,
  className = "",
  highlightColor = "rgba(120, 80, 255, 0.5)",
}: TextSpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    // Calculate relative mouse position within container
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPosition({ x, y });
  };

  return (
    <motion.div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Mask layer for text - visible text */}
      <div className="relative z-10 text-transparent bg-clip-text">
        {children}
      </div>

      {/* Background spotlight effect */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: isHovered
            ? `radial-gradient(circle 20rem at ${position.x}px ${position.y}px, ${highlightColor}, transparent)`
            : "none",
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Base text layer */}
      <div className="absolute inset-0 z-0">{children}</div>
    </motion.div>
  );
}

// Component for moving gradient text
export function MovingGradientText({
  text,
  className = "",
  baseColor = "text-gray-900",
  gradientColors = "from-purple-500 via-blue-500 to-violet-500",
  duration = 5,
  animate = true,
}: {
  text: string;
  className?: string;
  baseColor?: string;
  gradientColors?: string;
  duration?: number;
  animate?: boolean;
}) {
  return (
    <div className={cn("relative", className)}>
      {/* Static text with base color */}
      <span className={cn("relative", baseColor)}>{text}</span>

      {/* Overlay moving gradient text */}
      <motion.span
        className={cn(
          "absolute top-0 left-0 bg-gradient-to-r bg-clip-text text-transparent",
          gradientColors
        )}
        animate={
          animate
            ? {
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }
            : undefined
        }
        transition={{
          duration,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        }}
        style={{
          backgroundSize: "200% 100%",
        }}
      >
        {text}
      </motion.span>
    </div>
  );
}
