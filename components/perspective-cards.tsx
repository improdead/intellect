"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PerspectiveCardProps {
  children: React.ReactNode;
  className?: string;
  backgroundImage?: string;
  rotationIntensity?: number;
}

export const PerspectiveCard = ({
  children,
  className = "",
  backgroundImage,
  rotationIntensity = 18,
}: PerspectiveCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;

    // Calculate mouse position relative to card center
    const mouseX = e.clientX - cardCenterX;
    const mouseY = e.clientY - cardCenterY;

    // Calculate rotation based on mouse position
    // Divide by larger value for less intense rotation
    const rotateY = (mouseX / (rect.width / 2)) * rotationIntensity;
    const rotateX = (-mouseY / (rect.height / 2)) * rotationIntensity;

    setRotateX(rotateX);
    setRotateY(rotateY);
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "flex items-center justify-center perspective-1000 cursor-pointer",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setRotateX(0);
        setRotateY(0);
      }}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        className={cn(
          "relative w-full h-full rounded-xl overflow-hidden backface-hidden",
          backgroundImage
            ? "bg-cover bg-center"
            : "bg-background/80 backdrop-blur-sm"
        )}
        style={{
          backgroundImage: backgroundImage
            ? `url(${backgroundImage})`
            : undefined,
          transformStyle: "preserve-3d",
        }}
        animate={{
          rotateX: rotateX,
          rotateY: rotateY,
          scale: isHovered ? 1.05 : 1,
          boxShadow: isHovered
            ? "0 10px 30px rgba(0, 0, 0, 0.2)"
            : "0 5px 15px rgba(0, 0, 0, 0.1)",
        }}
        transition={{
          type: "spring",
          damping: 10,
          stiffness: 100,
          mass: 0.5,
        }}
      >
        {children}

        {/* Reflection/highlight effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"
          animate={{
            opacity: isHovered ? 0.6 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
};

export default function PerspectiveCards({
  items,
  className = "",
  gap = 4,
}: {
  items: React.ReactNode[];
  className?: string;
  gap?: number;
}) {
  return (
    <div
      className={cn(
        `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-${gap}`,
        className
      )}
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="h-full"
        >
          {item}
        </motion.div>
      ))}
    </div>
  );
}
