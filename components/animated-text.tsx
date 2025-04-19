"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface AnimatedTextProps {
  words: string[]
  className?: string
}

export default function AnimatedText({ words, className }: AnimatedTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [words.length])

  return (
    <span className={`relative inline-block ${className}`}>
      <div className="relative h-[1.2em] overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={currentIndex}
            className="absolute inset-0 flex items-center justify-start"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              duration: 0.4,
              ease: "easeInOut",
              opacity: { duration: 0.3 },
            }}
          >
            {words[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </div>
    </span>
  )
}
