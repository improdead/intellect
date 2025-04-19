"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlareCardProps {
  children: React.ReactNode;
  className?: string;
  glareColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  glareSize?: number;
  animateGlare?: boolean;
  animationDuration?: number;
}

export default function GlareCard({
  children,
  className = "",
  glareColor = "rgba(255, 255, 255, 0.3)",
  backgroundColor = "rgba(255, 255, 255, 0.03)",
  borderColor = "rgba(120, 80, 255, 0.15)",
  glareSize = 400,
  animateGlare = false,
  animationDuration = 8,
}: GlareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePosition({ x, y });
  };

  // Animate the glare if enabled
  useEffect(() => {
    if (!animateGlare || !cardRef.current) return;

    let timeoutId: NodeJS.Timeout;

    const animatePosition = () => {
      const rect = cardRef.current!.getBoundingClientRect();
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;

      setMousePosition({ x, y });

      timeoutId = setTimeout(animatePosition, animationDuration * 1000);
    };

    animatePosition();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [animateGlare, animationDuration]);

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "rounded-xl overflow-hidden relative backdrop-blur-[2px] border",
        className
      )}
      style={{
        backgroundColor,
        borderColor,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.3 }}
    >
      {/* Glare effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle ${glareSize}px at ${mousePosition.x}px ${mousePosition.y}px, ${glareColor}, transparent)`,
          opacity: isHovered || animateGlare ? 0.6 : 0,
          transition: "opacity 0.5s ease",
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Border highlight */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-xl border border-primary/20"
        animate={{
          opacity: isHovered ? 0.6 : 0,
        }}
        transition={{ duration: 0.4 }}
      />
    </motion.div>
  );
}
