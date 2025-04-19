"use client"

import { motion } from "framer-motion"
import { useState } from "react"

interface MathProblem {
  id: number
  problem: string
  options: string[]
  correct: number
}

export default function MathSVG() {
  const problems: MathProblem[] = [
    {
      id: 1,
      problem: "3x² + 5x - 2 = 0",
      options: ["x = {-2, 1/3}", "x = {-2, -1/3}", "x = {2, -1/3}", "x = {2, 1/3}"],
      correct: 0,
    },
    {
      id: 2,
      problem: "∫ 2x dx",
      options: ["x² + C", "x³/3 + C", "x²/2 + C", "x² - C"],
      correct: 2,
    },
    {
      id: 3,
      problem: "sin²θ + cos²θ",
      options: ["0", "1", "2", "sin2θ"],
      correct: 1,
    },
  ]

  const [currentProblem, setCurrentProblem] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex)
    setIsCorrect(optionIndex === problems[currentProblem].correct)
  }

  const handleNextProblem = () => {
    setCurrentProblem((prev) => (prev + 1) % problems.length)
    setSelectedOption(null)
    setIsCorrect(null)
  }

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full max-h-[400px]" style={{ backgroundColor: "var(--background)" }}>
      {/* Background grid */}
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--muted) / 0.3)" strokeWidth="0.5" />
      </pattern>
      <rect width="400" height="400" fill="url(#grid)" />

      {/* Title */}
      <rect x="50" y="20" width="300" height="50" rx="10" fill="hsl(var(--primary) / 0.1)" />
      <text
        x="200"
        y="50"
        textAnchor="middle"
        fontSize="18"
        fill="hsl(var(--primary))"
        fontWeight="bold"
        fontFamily="system-ui"
      >
        Interactive Math Problems
      </text>

      {/* Problem card */}
      <rect
        x="50"
        y="90"
        width="300"
        height="60"
        rx="10"
        fill="hsl(var(--card))"
        stroke="hsl(var(--border))"
        strokeWidth="1"
      />
      <text x="200" y="130" textAnchor="middle" fontSize="16" fill="hsl(var(--foreground))" fontFamily="system-ui">
        {problems[currentProblem].problem}
      </text>

      {/* Options */}
      {problems[currentProblem].options.map((option, i) => {
        const y = 170 + i * 50
        const isSelected = selectedOption === i
        const fillColor =
          isSelected && isCorrect !== null
            ? isCorrect
              ? "hsl(143, 70%, 50%, 0.3)"
              : "hsl(0, 70%, 50%, 0.3)"
            : "hsl(var(--muted) / 0.3)"

        return (
          <g key={i} onClick={() => handleOptionSelect(i)} style={{ cursor: "pointer" }}>
            <rect
              x="80"
              y={y}
              width="240"
              height="35"
              rx="5"
              fill={fillColor}
              stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--border))"}
              strokeWidth="1"
            />
            <text
              x="200"
              y={y + 22.5}
              textAnchor="middle"
              fontSize="14"
              fill="hsl(var(--foreground))"
              fontFamily="system-ui"
            >
              {option}
            </text>
          </g>
        )
      })}

      {/* Feedback */}
      {isCorrect !== null && (
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <rect x="125" y="340" width="150" height="30" rx="5" fill="hsl(var(--background))" />
          <text
            x="200"
            y="360"
            textAnchor="middle"
            fontSize="14"
            fill={isCorrect ? "hsl(143, 70%, 50%)" : "hsl(0, 70%, 50%)"}
            fontFamily="system-ui"
            fontWeight="bold"
          >
            {isCorrect ? "Correct!" : "Try again!"}
          </text>
        </motion.g>
      )}

      {/* Next button */}
      <g onClick={handleNextProblem} style={{ cursor: "pointer" }}>
        <rect
          x="275"
          y="340"
          width="75"
          height="30"
          rx="5"
          fill="hsl(var(--primary))"
          className="transition-opacity hover:opacity-80 active:opacity-70"
        />
        <text
          x="312.5"
          y="360"
          textAnchor="middle"
          fontSize="12"
          fill="hsl(var(--primary-foreground))"
          fontFamily="system-ui"
          fontWeight="bold"
        >
          Next
        </text>
      </g>
    </svg>
  )
}
