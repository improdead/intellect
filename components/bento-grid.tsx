"use client";

import React, { useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface BentoGridItemProps {
  title: string;
  description: string;
  className?: string;
  icon?: React.ReactNode;
  image?: string;
  link?: string;
  width?: "small" | "medium" | "large" | "full";
  height?: "small" | "medium" | "large";
  color?: string;
}

const BentoGrid = ({ items }: { items: BentoGridItemProps[] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.05 }}
          viewport={{ once: true }}
        >
          <BentoGridItem {...item} />
        </motion.div>
      ))}
    </div>
  );
};

const BentoGridItem = ({
  title,
  description,
  className,
  icon,
  image,
  link,
  width = "medium",
  height = "medium",
  color = "from-purple-500/20 to-blue-500/20",
}: BentoGridItemProps) => {
  // Map width and height to column and row spans
  const widthMap = {
    small: "md:col-span-1",
    medium: "md:col-span-1",
    large: "md:col-span-2",
    full: "md:col-span-3",
  };

  const heightMap = {
    small: "h-[180px]",
    medium: "h-[240px]",
    large: "h-[400px]",
  };

  // Mouse position tracking for hover effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the mouse movement
  const smoothX = useSpring(mouseX, { damping: 20, stiffness: 300 });
  const smoothY = useSpring(mouseY, { damping: 20, stiffness: 300 });

  // Transform mouse position to rotation values
  const rotateX = useTransform(smoothY, [-100, 100], [2, -2]);
  const rotateY = useTransform(smoothX, [-100, 100], [-2, 2]);

  // Create a gradient that follows the mouse
  const backgroundOpacity = useMotionValue(0);
  const backgroundOpacitySpring = useSpring(backgroundOpacity, {
    damping: 25,
    stiffness: 300,
  });

  // Create a gradient that follows the mouse
  const gradientX = useTransform(smoothX, [-100, 100], [0, 100]);
  const gradientY = useTransform(smoothY, [-100, 100], [0, 100]);
  const gradient = useMotionTemplate`radial-gradient(circle at ${gradientX}% ${gradientY}%, hsl(var(--primary) / 0.15), transparent 80%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
    backgroundOpacity.set(0.15);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    backgroundOpacity.set(0);
  };

  return (
    <motion.div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br backdrop-blur-sm",
        `bg-gradient-to-br ${color}`,
        widthMap[width],
        heightMap[height],
        className
      )}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.2 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Mouse-following gradient overlay */}
      <motion.div
        className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: gradient, opacity: backgroundOpacitySpring }}
      />

      {/* Content */}
      <motion.div
        className="relative z-20 h-full w-full p-6 flex flex-col justify-between"
        style={{ transform: "translateZ(20px)" }} // 3D effect
      >
        <div>
          {icon && (
            <motion.div
              className="mb-4 inline-block"
              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              {icon}
            </motion.div>
          )}
          <h3 className="font-bold text-xl mb-2 font-robit-medium">{title}</h3>
          <p className="text-sm text-foreground/70 line-clamp-3">
            {description}
          </p>
        </div>

        {link && (
          <motion.div
            className="mt-4"
            initial={{ opacity: 0.8 }}
            whileHover={{ opacity: 1 }}
          >
            <Link
              href={link}
              className="inline-flex items-center text-sm font-medium text-primary group/link"
            >
              <span className="font-robit-regular">Learn more</span>
              <motion.span
                className="inline-block ml-1"
                initial={{ x: 0 }}
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <ArrowRight className="h-4 w-4" />
              </motion.span>
            </Link>
          </motion.div>
        )}
      </motion.div>

      {/* Image */}
      {image && (
        <motion.div
          className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 1.5 }}
        >
          <Image src={image} alt={title} fill className="object-cover" />
        </motion.div>
      )}

      {/* Hover effects */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        {/* Top left corner glow */}
        <motion.div
          className="absolute -top-20 -left-20 w-40 h-40 bg-primary/30 rounded-full blur-3xl"
          animate={{
            y: [0, 10, 0],
            x: [0, 10, 0],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Bottom right corner glow */}
        <motion.div
          className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl"
          animate={{
            y: [0, -10, 0],
            x: [0, -10, 0],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>
    </motion.div>
  );
};

export { BentoGrid, BentoGridItem };
export type { BentoGridItemProps };
