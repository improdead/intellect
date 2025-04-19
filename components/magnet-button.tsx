"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagnetButtonProps {
  children: React.ReactNode;
  className?: string;
  magneticIntensity?: number;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "filled" | "outlined" | "text";
  size?: "sm" | "md" | "lg";
  borderRadius?: "none" | "sm" | "md" | "lg" | "full";
  fullWidth?: boolean;
  glowOnHover?: boolean;
  glowColor?: string;
}

export default function MagnetButton({
  children,
  className = "",
  magneticIntensity = 0.5,
  disabled = false,
  onClick,
  variant = "filled",
  size = "md",
  borderRadius = "md",
  fullWidth = false,
  glowOnHover = false,
  glowColor = "rgba(120, 80, 255, 0.5)",
}: MagnetButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Size classes
  const sizeClasses = {
    sm: "py-1.5 px-3 text-sm",
    md: "py-2 px-4 text-base",
    lg: "py-3 px-6 text-lg",
  };

  // Border radius classes
  const radiusClasses = {
    none: "rounded-none",
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  // Variant classes
  const variantClasses = {
    filled: "bg-primary text-primary-foreground hover:bg-primary/90",
    outlined:
      "bg-transparent border border-primary text-primary hover:bg-primary/5",
    text: "bg-transparent text-primary hover:bg-primary/5",
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current || disabled) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate the distance from the center
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    // Apply the magnetic effect with the specified intensity
    setPosition({
      x: distanceX * magneticIntensity,
      y: distanceY * magneticIntensity,
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <motion.button
      ref={buttonRef}
      className={cn(
        "relative font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50",
        sizeClasses[size],
        radiusClasses[borderRadius],
        variantClasses[variant],
        fullWidth ? "w-full" : "w-auto",
        className
      )}
      animate={{
        x: position.x,
        y: position.y,
      }}
      transition={{
        type: "spring",
        damping: 15,
        stiffness: 150,
        mass: 0.2,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.98 }}
    >
      {children}

      {/* Glow effect on hover */}
      {glowOnHover && (
        <motion.div
          className="absolute inset-0 rounded-inherit pointer-events-none"
          style={{
            borderRadius: "inherit",
          }}
          animate={{
            boxShadow: isHovered
              ? `0 0 15px 3px ${glowColor}`
              : "0 0 0px 0px transparent",
          }}
          transition={{ duration: 0.4 }}
        />
      )}
    </motion.button>
  );
}
