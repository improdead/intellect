"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface InfiniteMovingCardsProps {
  items: React.ReactNode[];
  direction?: "left" | "right";
  speed?: number;
  pauseOnHover?: boolean;
  className?: string;
  containerClassName?: string;
}

export default function InfiniteMovingCards({
  items,
  direction = "left",
  speed = 20,
  pauseOnHover = true,
  className = "",
  containerClassName = "",
}: InfiniteMovingCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const calculateWidths = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
        setContentWidth(containerRef.current.scrollWidth / 2); // Divide by 2 because we duplicate the content
      }
    };

    calculateWidths();
    window.addEventListener("resize", calculateWidths);

    return () => {
      window.removeEventListener("resize", calculateWidths);
    };
  }, [items]);

  // Calculate animation duration based on content width and speed
  const duration = contentWidth / speed;

  // Duplicate items to create the infinite effect
  const allItems = [...items, ...items];

  return (
    <div
      ref={containerRef}
      className={cn("overflow-hidden relative", containerClassName)}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      {/* Moving container */}
      <motion.div
        className="flex"
        animate={{
          x: direction === "left" ? -contentWidth : contentWidth,
        }}
        transition={{
          duration,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
          // Only pause when content is hovered and pauseOnHover is true
          pause: isPaused,
        }}
        style={{
          width: `${contentWidth * 2}px`,
        }}
      >
        {/* First set of items */}
        <div
          className={cn(
            "flex",
            direction === "right" && "flex-row-reverse",
            className
          )}
        >
          {items.map((item, idx) => (
            <div key={idx} className="flex-shrink-0">
              {item}
            </div>
          ))}
        </div>

        {/* Duplicate set for seamless looping */}
        <div
          className={cn(
            "flex",
            direction === "right" && "flex-row-reverse",
            className
          )}
        >
          {items.map((item, idx) => (
            <div key={`dup-${idx}`} className="flex-shrink-0">
              {item}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Gradient overlay to fade edges */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
    </div>
  );
}
