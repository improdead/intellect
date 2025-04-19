"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function PhysicsSVG() {
  const [applePosition, setApplePosition] = useState(50)
  const [isAnimating, setIsAnimating] = useState(false)
  const [time, setTime] = useState(0)

  const handleRestart = () => {
    setApplePosition(50)
    setTime(0)
    setIsAnimating(true)
  }

  useEffect(() => {
    let animationFrame: number
    let startTime: number

    if (isAnimating) {
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const elapsedTime = (timestamp - startTime) / 1000 // convert to seconds
        setTime(Number.parseFloat(elapsedTime.toFixed(1)))

        // gravity equation: y = 0.5 * g * t^2
        // scale for SVG coordinates
        const g = 9.8
        const newPosition = 50 + 0.5 * g * elapsedTime * elapsedTime * 5

        if (newPosition >= 280) {
          setApplePosition(280)
          setIsAnimating(false)
        } else {
          setApplePosition(newPosition)
          animationFrame = requestAnimationFrame(animate)
        }
      }

      animationFrame = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [isAnimating])

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full max-h-[400px]" style={{ backgroundColor: "var(--background)" }}>
      {/* Sky */}
      <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="hsl(var(--primary) / 0.1)" />
        <stop offset="100%" stopColor="hsl(var(--background))" />
      </linearGradient>
      <rect x="0" y="0" width="400" height="320" fill="url(#skyGradient)" />

      {/* Ground */}
      <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="hsl(var(--muted))" />
        <stop offset="100%" stopColor="hsl(var(--muted-foreground) / 0.3)" />
      </linearGradient>
      <rect x="0" y="320" width="400" height="80" fill="url(#groundGradient)" />

      {/* Tree trunk */}
      <rect x="200" y="200" width="30" height="120" fill="#8B4513" rx="5" />

      {/* Tree foliage */}
      <ellipse cx="215" cy="160" rx="60" ry="80" fill="hsl(143, 70%, 30%)" />

      {/* Apple */}
      <motion.g
        animate={{ y: applePosition }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
        style={{ originY: 0 }}
      >
        <circle cx="260" cy="50" r="15" fill="#E53935" />
        <path d="M260 35 L260 25 L265 20" stroke="#336633" strokeWidth="2" fill="none" />
      </motion.g>

      {/* Newton */}
      <g>
        <ellipse cx="100" cy="320" rx="30" ry="5" fill="rgba(0,0,0,0.2)" />
        <rect x="90" y="270" width="20" height="50" fill="#6D4C41" rx="5" />
        <circle cx="100" cy="250" r="20" fill="#FFCC80" />
        <ellipse cx="100" cy="245" rx="15" ry="10" fill="#FFCC80" />
        <path d="M90 250 Q100 260 110 250" stroke="#6D4C41" strokeWidth="1" fill="none" />
      </g>

      {/* Gravity equation */}
      <g className="text-foreground">
        <rect
          x="10"
          y="70"
          width="180"
          height="80"
          rx="10"
          fill="hsl(var(--background))"
          stroke="hsl(var(--primary) / 0.3)"
          strokeWidth="2"
        />
        <text x="25" y="100" fontSize="14" fill="currentColor" fontFamily="monospace">
          Gravity equation:
        </text>
        <text x="25" y="125" fontSize="16" fill="hsl(var(--primary))" fontFamily="monospace" fontWeight="bold">
          d = 0.5 × g × t²
        </text>
        <text x="25" y="145" fontSize="12" fill="currentColor" fontFamily="monospace">
          Time: {time}s
        </text>
      </g>

      {/* Restart button */}
      <g
        onClick={handleRestart}
        style={{ cursor: "pointer" }}
        className="transition-opacity hover:opacity-80 active:opacity-70"
      >
        <rect
          x="280"
          y="10"
          width="110"
          height="35"
          rx="5"
          fill="hsl(var(--primary))"
          stroke="hsl(var(--primary) / 0.5)"
          strokeWidth="1"
        />
        <text
          x="335"
          y="32"
          fontSize="14"
          fill="hsl(var(--primary-foreground))"
          fontFamily="system-ui"
          textAnchor="middle"
          fontWeight="bold"
        >
          Drop Apple
        </text>
      </g>
    </svg>
  )
}
