"use client"

import { motion } from "framer-motion"
import { useState } from "react"

export default function BiologySVG() {
  // Protein structure details
  const [viewMode, setViewMode] = useState<"primary" | "secondary" | "tertiary" | "quaternary">("primary")

  // Animation variants
  const primaryStructure = {
    visible: {
      pathLength: 1,
      transition: { duration: 1.5, ease: "easeInOut" },
    },
    hidden: {
      pathLength: 0,
    },
  }

  // Colors for different amino acids in the sequence
  const aminoAcidColors = [
    "hsl(0, 70%, 60%)",
    "hsl(40, 70%, 60%)",
    "hsl(80, 70%, 60%)",
    "hsl(120, 70%, 60%)",
    "hsl(160, 70%, 60%)",
    "hsl(200, 70%, 60%)",
    "hsl(240, 70%, 60%)",
    "hsl(280, 70%, 60%)",
    "hsl(320, 70%, 60%)",
  ]

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full max-h-[400px]" style={{ backgroundColor: "var(--background)" }}>
      {/* Background */}
      <rect x="0" y="0" width="400" height="400" fill="hsl(var(--background))" />

      {/* Title */}
      <text
        x="200"
        y="40"
        textAnchor="middle"
        fontSize="18"
        fill="hsl(var(--foreground))"
        fontWeight="bold"
        fontFamily="system-ui"
      >
        Protein Structure Levels
      </text>

      {/* Main viewing area */}
      <rect
        x="50"
        y="60"
        width="300"
        height="240"
        rx="10"
        fill="hsl(var(--card))"
        stroke="hsl(var(--border))"
        strokeWidth="1"
      />

      {/* Protein visualization based on selected view mode */}
      <g transform="translate(200, 180)">
        {/* Primary Structure (Amino Acid Sequence) */}
        {viewMode === "primary" && (
          <g>
            <text x="0" y="-90" textAnchor="middle" fontSize="16" fill="hsl(var(--primary))" fontFamily="system-ui">
              Primary Structure
            </text>
            <text x="0" y="-70" textAnchor="middle" fontSize="11" fill="hsl(var(--foreground))" fontFamily="system-ui">
              Amino Acid Sequence
            </text>

            {/* Amino acid chain */}
            <g>
              {[...Array(9)].map((_, i) => {
                const x = -120 + i * 30
                return (
                  <motion.g
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                  >
                    <circle
                      cx={x}
                      cy="0"
                      r="12"
                      fill={aminoAcidColors[i]}
                      stroke="hsl(var(--border))"
                      strokeWidth="1"
                    />
                    <text
                      x={x}
                      y="4"
                      textAnchor="middle"
                      fontSize="10"
                      fill="hsl(var(--background))"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {String.fromCharCode(65 + i)}
                    </text>
                  </motion.g>
                )
              })}
              {/* Connecting lines */}
              {[...Array(8)].map((_, i) => {
                const x1 = -120 + i * 30 + 12
                const x2 = -120 + (i + 1) * 30 - 12
                return (
                  <motion.line
                    key={i}
                    x1={x1}
                    y1="0"
                    x2={x2}
                    y2="0"
                    stroke="hsl(var(--foreground))"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: (i + 1) * 0.1, duration: 0.2 }}
                  />
                )
              })}
            </g>
          </g>
        )}

        {/* Secondary Structure (Alpha Helix & Beta Sheets) */}
        {viewMode === "secondary" && (
          <g>
            <text x="0" y="-90" textAnchor="middle" fontSize="16" fill="hsl(var(--primary))" fontFamily="system-ui">
              Secondary Structure
            </text>
            <text x="0" y="-70" textAnchor="middle" fontSize="11" fill="hsl(var(--foreground))" fontFamily="system-ui">
              Alpha Helix & Beta Sheets
            </text>

            {/* Alpha Helix */}
            <g transform="translate(-70, 0) scale(0.7)">
              <text
                x="0"
                y="-30"
                textAnchor="middle"
                fontSize="12"
                fill="hsl(var(--foreground))"
                fontFamily="system-ui"
              >
                Alpha Helix
              </text>
              <motion.path
                d="M-40,50 C-30,30 -10,30 0,50 C10,70 30,70 40,50 C50,30 70,30 80,50"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeLinecap="round"
                variants={primaryStructure}
                initial="hidden"
                animate="visible"
              />
            </g>

            {/* Beta Sheet */}
            <g transform="translate(70, 0) scale(0.7)">
              <text
                x="0"
                y="-30"
                textAnchor="middle"
                fontSize="12"
                fill="hsl(var(--foreground))"
                fontFamily="system-ui"
              >
                Beta Sheet
              </text>
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
                {[...Array(5)].map((_, i) => (
                  <rect
                    key={i}
                    x={-60 + i * 30}
                    y="-10"
                    width="25"
                    height="60"
                    fill="hsl(211, 70%, 60%, 0.7)"
                    stroke="hsl(var(--border))"
                    strokeWidth="1"
                  />
                ))}
              </motion.g>
            </g>
          </g>
        )}

        {/* Tertiary Structure (3D Folding) */}
        {viewMode === "tertiary" && (
          <g>
            <text x="0" y="-90" textAnchor="middle" fontSize="16" fill="hsl(var(--primary))" fontFamily="system-ui">
              Tertiary Structure
            </text>
            <text x="0" y="-70" textAnchor="middle" fontSize="11" fill="hsl(var(--foreground))" fontFamily="system-ui">
              3D Protein Folding
            </text>

            {/* 3D protein representation */}
            <motion.g
              initial={{ opacity: 0, scale: 0.5, rotate: -40 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1 }}
            >
              <ellipse
                cx="0"
                cy="0"
                rx="80"
                ry="60"
                fill="none"
                stroke="hsl(var(--foreground) / 0.3)"
                strokeWidth="1"
                strokeDasharray="4 2"
              />
              <motion.path
                d="M-50,-10 C-40,40 -10,30 0,-20 C10,-40 30,10 50,-10"
                fill="none"
                stroke="hsl(280, 70%, 60%)"
                strokeWidth="8"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              <motion.path
                d="M-40,20 C-20,-20 20,30 40,0"
                fill="none"
                stroke="hsl(180, 70%, 60%)"
                strokeWidth="8"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
              />
            </motion.g>
          </g>
        )}

        {/* Quaternary Structure (Multiple Protein Units) */}
        {viewMode === "quaternary" && (
          <g>
            <text x="0" y="-90" textAnchor="middle" fontSize="16" fill="hsl(var(--primary))" fontFamily="system-ui">
              Quaternary Structure
            </text>
            <text x="0" y="-70" textAnchor="middle" fontSize="11" fill="hsl(var(--foreground))" fontFamily="system-ui">
              Multiple Protein Subunits
            </text>

            {/* Multiple protein subunits */}
            <g>
              {[
                { cx: -40, cy: -30, rx: 35, ry: 25, color: "hsl(0, 70%, 60%, 0.7)" },
                { cx: 40, cy: -30, rx: 35, ry: 25, color: "hsl(120, 70%, 60%, 0.7)" },
                { cx: -40, cy: 30, rx: 35, ry: 25, color: "hsl(200, 70%, 60%, 0.7)" },
                { cx: 40, cy: 30, rx: 35, ry: 25, color: "hsl(280, 70%, 60%, 0.7)" },
              ].map((ellipse, i) => (
                <motion.ellipse
                  key={i}
                  cx={ellipse.cx}
                  cy={ellipse.cy}
                  rx={ellipse.rx}
                  ry={ellipse.ry}
                  fill={ellipse.color}
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.2 }}
                />
              ))}

              {/* Connecting lines between subunits */}
              {[
                { x1: -15, y1: -30, x2: 15, y2: -30 },
                { x1: -40, y1: -10, x2: -40, y2: 10 },
                { x1: 40, y1: -10, x2: 40, y2: 10 },
                { x1: -15, y1: 30, x2: 15, y2: 30 },
              ].map((line, i) => (
                <motion.line
                  key={i}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                  strokeDasharray="5 3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                />
              ))}
            </g>
          </g>
        )}
      </g>

      {/* Navigation buttons */}
      <g transform="translate(50, 340)">
        {["primary", "secondary", "tertiary", "quaternary"].map((mode, i) => {
          const x = i * 75
          const isActive = mode === viewMode
          return (
            <g
              key={mode}
              onClick={() => setViewMode(mode as any)}
              style={{ cursor: "pointer" }}
              transform={`translate(${x}, 0)`}
            >
              <rect
                x="0"
                y="0"
                width="70"
                height="30"
                rx="5"
                fill={isActive ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                className="transition-colors"
              />
              <text
                x="35"
                y="20"
                textAnchor="middle"
                fontSize={isActive ? "10" : "9"}
                fontWeight={isActive ? "bold" : "normal"}
                fill={isActive ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))"}
                fontFamily="system-ui"
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </text>
            </g>
          )
        })}
      </g>
    </svg>
  )
}
