"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface Star {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
}

export default function ShootingStars() {
  const starsRef = useRef<Star[]>([])

  useEffect(() => {
    // Generate random stars
    const starCount = 15
    const newStars: Star[] = []

    for (let i = 0; i < starCount; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 50,
        size: Math.random() * 1.5 + 0.5,
        duration: Math.random() * 5 + 5,
        delay: Math.random() * 10,
      })
    }

    starsRef.current = newStars
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {starsRef.current.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full opacity-70 shadow-glow"
          style={{
            top: `${star.y}%`,
            left: `${star.x}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          initial={{
            x: 0,
            y: 0,
            opacity: 0,
          }}
          animate={{
            x: `calc(100vw - ${star.x}vw)`,
            y: `calc(100vh - ${star.y}vh)`,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: Math.random() * 20 + 10,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}
