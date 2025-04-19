"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpotlightProps {
  children: React.ReactNode;
  className?: string;
  size?: number;
  color?: string;
  autoMove?: boolean;
}

export default function Spotlight({
  children,
  className = "",
  size = 400,
  color = "rgba(120, 80, 255, 0.15)",
  autoMove = false,
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  // Handle mouse move inside container
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPosition({ x, y });
    setOpacity(1);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setOpacity(0);
  };

  // Automatic movement if enabled
  useEffect(() => {
    if (!autoMove || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    let timeoutId: NodeJS.Timeout;

    const moveSpotlight = () => {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;

      setPosition({ x, y });
      setOpacity(0.5);

      timeoutId = setTimeout(() => {
        moveSpotlight();
      }, 2000);
    };

    moveSpotlight();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [autoMove]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* The spotlight */}
      <motion.div
        className="pointer-events-none absolute -inset-px z-0 select-none"
        animate={{
          opacity,
          background: `radial-gradient(${size}px circle at ${position.x}px ${position.y}px, ${color}, transparent)`,
        }}
        transition={{ type: "spring", bounce: 0, duration: 0.6 }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
