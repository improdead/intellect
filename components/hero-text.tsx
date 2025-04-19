"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeroTextProps {
  text: string;
  className?: string;
  fontSize?:
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl";
  gradientText?: boolean;
  animateFromTop?: boolean;
  alignCenter?: boolean;
  letterSpacing?: "tighter" | "tight" | "normal" | "wide" | "wider" | "widest";
  fontFamily?: string;
}

export default function HeroText({
  text,
  className = "",
  fontSize = "5xl",
  gradientText = true,
  animateFromTop = false,
  alignCenter = true,
  letterSpacing = "tight",
  fontFamily = "font-robit-bold",
}: HeroTextProps) {
  const words = text.split(" ");

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: animateFromTop ? -20 : 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      className={cn(
        "flex flex-wrap",
        alignCenter && "justify-center",
        className
      )}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span
          variants={child}
          key={index}
          className={cn(
            `text-${fontSize}`,
            `tracking-${letterSpacing}`,
            fontFamily,
            gradientText &&
              "bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600",
            "mx-1 my-1 inline-block"
          )}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}

export function AnimatedTextCharacter({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const letters = Array.from(text);

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      x: -20,
      y: 10,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      className={cn("flex overflow-hidden", className)}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {letters.map((letter, index) => (
        <motion.span variants={child} key={index}>
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  );
}
