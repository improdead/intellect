"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, animate } from "framer-motion";

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isText, setIsText] = useState(false);
  const [isInput, setIsInput] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const [hasTrail, setHasTrail] = useState(false);

  // Mouse position with spring physics for smooth movement
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Apply spring physics for smooth cursor movement
  const springConfig = { damping: 28, stiffness: 350, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  // Trail positions
  const trailElements = 5;
  const trailPositions = useRef<{ x: number; y: number }[]>(
    Array(trailElements).fill({ x: -100, y: -100 })
  );
  const trailTimestamps = useRef<number[]>(Array(trailElements).fill(0));

  useEffect(() => {
    // Hide the default cursor
    document.documentElement.style.cursor = "none";
    document.body.style.cursor = "none";

    // Add a class to the html element to ensure cursor is hidden everywhere
    document.documentElement.classList.add("custom-cursor-enabled");

    // Add CSS to hide cursor on all elements
    const style = document.createElement("style");
    style.textContent = `
      .custom-cursor-enabled,
      .custom-cursor-enabled * {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    const handleMouseMove = (e: MouseEvent) => {
      // Update cursor position
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      // Update trail positions
      const now = Date.now();
      if (hasTrail && now - (trailTimestamps.current[0] || 0) > 30) {
        trailPositions.current.pop(); // Remove the last position
        trailPositions.current.unshift({ x: e.clientX, y: e.clientY }); // Add current position to the front
        trailTimestamps.current.pop(); // Remove the last timestamp
        trailTimestamps.current.unshift(now); // Add current timestamp to the front
      }

      if (!isVisible) {
        setIsVisible(true);
      }

      // Check if hovering over different types of elements
      const target = e.target as HTMLElement;

      // Check for clickable elements
      const isClickable =
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.closest("[role=button]") ||
        window.getComputedStyle(target).cursor === "pointer";

      // Check for text elements
      const isTextElement =
        target.tagName === "P" ||
        target.tagName === "H1" ||
        target.tagName === "H2" ||
        target.tagName === "H3" ||
        target.tagName === "H4" ||
        target.tagName === "H5" ||
        target.tagName === "H6" ||
        target.tagName === "SPAN" ||
        (target.tagName === "DIV" &&
          window.getComputedStyle(target).overflow === "auto");

      // Check for input elements
      const isInputElement =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT";

      // Check for link elements
      const isLinkElement = target.tagName === "A" || target.closest("a");

      // Check for scrollable elements
      const isScrollableElement =
        window.getComputedStyle(target).overflow === "auto" ||
        window.getComputedStyle(target).overflow === "scroll" ||
        window.getComputedStyle(target).overflowY === "auto" ||
        window.getComputedStyle(target).overflowY === "scroll";

      // Update states
      setIsPointer(isClickable);
      setIsText(isTextElement);
      setIsInput(isInputElement);
      setIsLink(isLinkElement);
      setIsScrollable(isScrollableElement);

      // Enable trail for fast movements
      const speed = Math.sqrt(
        Math.pow(e.movementX, 2) + Math.pow(e.movementY, 2)
      );
      setHasTrail(speed > 10);
    };

    const handleMouseDown = () => {
      setIsClicking(true);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      cursorX.set(-100);
      cursorY.set(-100);
    };

    // Add event listeners
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Clean up
    return () => {
      document.documentElement.style.cursor = "";
      document.body.style.cursor = "";
      document.documentElement.classList.remove("custom-cursor-enabled");
      document.head.removeChild(style);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [cursorX, cursorY, isVisible, hasTrail]);

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          opacity: isVisible ? 1 : 0,
        }}
      >
        <motion.div
          className={`rounded-full ${
            isPointer || isLink ? "mix-blend-difference bg-white" : "bg-primary"
          }`}
          animate={{
            width: isPointer
              ? 40
              : isInput
              ? 2
              : isText
              ? 8
              : isClicking
              ? 12
              : 16,
            height: isPointer
              ? 40
              : isInput
              ? 24
              : isText
              ? 8
              : isClicking
              ? 12
              : 16,
            x: isPointer
              ? -20
              : isInput
              ? -1
              : isText
              ? -4
              : isClicking
              ? -6
              : -8,
            y: isPointer
              ? -20
              : isInput
              ? -12
              : isText
              ? -4
              : isClicking
              ? -6
              : -8,
            opacity: isVisible ? 1 : 0,
            scale: isClicking ? 0.8 : 1,
            borderRadius: isInput ? "1px" : "9999px",
          }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 300,
            mass: 0.5,
          }}
        />
      </motion.div>

      {/* Outer ring for hover state */}
      <motion.div
        className="fixed top-0 left-0 z-[9998] pointer-events-none"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          opacity: isVisible ? 1 : 0,
        }}
      >
        <motion.div
          className={`rounded-full border ${
            isPointer || isLink
              ? "border-white/30 mix-blend-difference"
              : isScrollable
              ? "border-primary/50"
              : "border-primary/30"
          } bg-transparent`}
          animate={{
            width: isPointer
              ? 60
              : isInput
              ? 4
              : isText
              ? 40
              : isScrollable
              ? 50
              : 36,
            height: isPointer
              ? 60
              : isInput
              ? 28
              : isText
              ? 40
              : isScrollable
              ? 50
              : 36,
            x: isPointer
              ? -30
              : isInput
              ? -2
              : isText
              ? -20
              : isScrollable
              ? -25
              : -18,
            y: isPointer
              ? -30
              : isInput
              ? -14
              : isText
              ? -20
              : isScrollable
              ? -25
              : -18,
            opacity: isPointer
              ? 0.6
              : isInput
              ? 0.8
              : isText
              ? 0.2
              : isScrollable
              ? 0.5
              : 0.3,
            scale: isClicking ? 0.9 : 1,
            borderRadius: isInput ? "2px" : "9999px",
            borderWidth: isScrollable ? 2 : 1,
          }}
          transition={{
            type: "spring",
            damping: 15,
            stiffness: 200,
            mass: 0.8,
          }}
        />
      </motion.div>

      {/* Cursor trail for fast movements */}
      {hasTrail &&
        trailPositions.current.map((pos, index) => (
          <motion.div
            key={`trail-${index}`}
            className="fixed top-0 left-0 z-[9997] pointer-events-none rounded-full bg-primary/20"
            style={{
              x: pos.x - 4,
              y: pos.y - 4,
              width: 8,
              height: 8,
              opacity: 0.5 - index * 0.1,
            }}
          />
        ))}

      {/* Scroll indicator */}
      {isScrollable && (
        <motion.div
          className="fixed top-0 left-0 z-[9997] pointer-events-none flex items-center justify-center"
          style={{
            width: 50,
            height: 50,
            x: cursorXSpring.get() - 25,
            y: cursorYSpring.get() - 25,
          }}
        >
          <motion.div
            className="h-4 w-1 bg-primary/50 rounded-full"
            animate={{ y: [0, 3, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </>
  );
}
