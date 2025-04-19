"use client";

import React, { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  glowClassName?: string;
  rotationIntensity?: number;
  glowIntensity?: number;
  border?: boolean;
  borderRadius?: number;
  href?: string;
  onClick?: () => void;
}

export default function Card3D({
  children,
  className = "",
  containerClassName = "",
  glowClassName = "",
  rotationIntensity = 10,
  glowIntensity = 0.4,
  border = false,
  borderRadius = 16,
  href,
  onClick,
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for tracking mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for natural movement
  const springConfig = { damping: 20, stiffness: 300 };
  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [rotationIntensity, -rotationIntensity]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-rotationIntensity, rotationIntensity]),
    springConfig
  );

  // Gradient for glow effect based on mouse position
  const glowX = useTransform(mouseX, [-1, 1], [0, 100]);
  const glowY = useTransform(mouseY, [-1, 1], [0, 100]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Normalize mouse position between -0.5 and 0.5
    const normalizedX = (e.clientX - rect.left) / width - 0.5;
    const normalizedY = (e.clientY - rect.top) / height - 0.5;

    mouseX.set(normalizedX);
    mouseY.set(normalizedY);
  }

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  const Card = motion.div;

  return (
    <div
      className={cn("group perspective-[1000px]", containerClassName)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      ref={cardRef}
    >
      <Card
        style={{
          rotateX: rotateX,
          rotateY: rotateY,
          transformStyle: "preserve-3d",
          borderRadius: `${borderRadius}px`,
        }}
        className={cn(
          "relative h-full w-full transition-transform duration-200 ease-out",
          border && "border border-primary/10",
          isHovered && "z-50",
          className
        )}
      >
        {children}

        {/* Gradient glow effect */}
        <motion.div
          className={cn(
            "pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100",
            glowClassName
          )}
          style={{
            background: isHovered
              ? `radial-gradient(${
                  glowIntensity * 300
                }px circle at ${glowX}% ${glowY}%, 
                  rgba(120, 80, 255, ${glowIntensity}), 
                  transparent ${glowIntensity * 100}%)`
              : "none",
            borderRadius: `${borderRadius}px`,
          }}
        />
      </Card>
    </div>
  );
}
