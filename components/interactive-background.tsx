"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

interface Star {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  opacity: number
}

export default function InteractiveBackground() {
  const starsRef = useRef<Star[]>([])

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Generate random stars
    const starCount = 25
    const newStars: Star[] = []

    for (let i = 0; i < starCount; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        duration: Math.random() * 8 + 5,
        delay: Math.random() * 10,
        opacity: Math.random() * 0.5 + 0.3,
      })
    }

    starsRef.current = newStars

    // No mouse tracking needed
    return () => {}
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-background/90"></div>

      {/* Gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,_var(--tw-gradient-stops))] from-transparent via-foreground/5 to-transparent bg-[size:50px_50px] opacity-20"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_var(--tw-gradient-stops))] from-transparent via-foreground/5 to-transparent bg-[size:50px_50px] opacity-20"></div>

      {/* Stars */}
      {starsRef.current.map((star) => {
        return (
          <motion.div
            key={star.id}
            className="absolute bg-white rounded-full shadow-glow"
            style={{
              top: `${star.y}%`,
              left: `${star.x}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
            }}
            animate={{
              scale: [1, 1.2, 1],
              x: [0, Math.sin(star.id) * 20, 0],
              y: [0, Math.cos(star.id) * 20, 0],
            }}
            transition={{
              duration: star.duration,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        )
      })}

      {/* Shooting stars */}
      {[...Array(5)].map((_, index) => (
        <motion.div
          key={`shooting-${index}`}
          className="absolute bg-white rounded-full opacity-70 shadow-glow"
          style={{
            top: `${Math.random() * 50}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 2 + 1}px`,
            height: `${Math.random() * 2 + 1}px`,
          }}
          initial={{
            x: 0,
            y: 0,
            opacity: 0,
          }}
          animate={{
            x: `calc(100vw - ${Math.random() * 100}vw)`,
            y: `calc(100vh - ${Math.random() * 100}vh)`,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 5 + 3,
            delay: Math.random() * 20 + index * 5,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: Math.random() * 20 + 10,
            ease: "easeInOut",
          }}
        />
      ))}


    </div>
  )
}
