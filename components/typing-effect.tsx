"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TypingEffectProps {
  words: string[];
  className?: string;
  cursorClassName?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetweenWords?: number;
}

export default function TypingEffect({
  words,
  className = "",
  cursorClassName = "",
  typingSpeed = 100,
  deletingSpeed = 50,
  delayBetweenWords = 1500,
}: TypingEffectProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(
      () => {
        // If paused, wait before starting to delete
        if (isPaused) {
          setIsPaused(false);
          setIsDeleting(true);
          return;
        }

        // Current word being processed
        const currentWord = words[currentWordIndex];

        // If deleting, remove last character
        if (isDeleting) {
          setCurrentText((prev) => prev.slice(0, -1));

          // If all text is deleted, move to next word
          if (currentText.length === 0) {
            setIsDeleting(false);
            setCurrentWordIndex((prev) => (prev + 1) % words.length);
          }
        }
        // If typing, add next character
        else {
          setCurrentText(currentWord.slice(0, currentText.length + 1));

          // If word is complete, pause before deleting
          if (currentText.length === currentWord.length) {
            setIsPaused(true);
          }
        }
      },
      isPaused ? delayBetweenWords : isDeleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(timeout);
  }, [
    currentText,
    isDeleting,
    isPaused,
    currentWordIndex,
    words,
    typingSpeed,
    deletingSpeed,
    delayBetweenWords,
  ]);

  return (
    <span className={cn("inline-block relative", className)}>
      {currentText}
      <motion.span
        className={cn(
          "inline-block h-full w-[2px] bg-primary ml-1",
          cursorClassName
        )}
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
      />
    </span>
  );
}
