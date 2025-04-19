"use client"

import { motion } from "framer-motion"
import { useState } from "react"

interface Element {
  symbol: string
  name: string
  group: string
  category: string
  number: number
}

export default function ChemistrySVG() {
  // Sample of periodic table elements
  const elements: Element[] = [
    { symbol: "H", name: "Hydrogen", group: "1", category: "nonmetal", number: 1 },
    { symbol: "He", name: "Helium", group: "18", category: "noble", number: 2 },
    { symbol: "Li", name: "Lithium", group: "1", category: "alkali", number: 3 },
    { symbol: "Be", name: "Beryllium", group: "2", category: "alkaline", number: 4 },
    { symbol: "B", name: "Boron", group: "13", category: "metalloid", number: 5 },
    { symbol: "C", name: "Carbon", group: "14", category: "nonmetal", number: 6 },
    { symbol: "N", name: "Nitrogen", group: "15", category: "nonmetal", number: 7 },
    { symbol: "O", name: "Oxygen", group: "16", category: "nonmetal", number: 8 },
    { symbol: "F", name: "Fluorine", group: "17", category: "halogen", number: 9 },
    { symbol: "Ne", name: "Neon", group: "18", category: "noble", number: 10 },
    { symbol: "Na", name: "Sodium", group: "1", category: "alkali", number: 11 },
    { symbol: "Mg", name: "Magnesium", group: "2", category: "alkaline", number: 12 },
  ]

  const [selectedElement, setSelectedElement] = useState<Element | null>(null)

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "nonmetal":
        return "hsl(143, 70%, 50%, 0.7)"
      case "noble":
        return "hsl(211, 70%, 50%, 0.7)"
      case "alkali":
        return "hsl(0, 70%, 50%, 0.7)"
      case "alkaline":
        return "hsl(40, 70%, 50%, 0.7)"
      case "metalloid":
        return "hsl(280, 70%, 50%, 0.7)"
      case "halogen":
        return "hsl(180, 70%, 50%, 0.7)"
      default:
        return "hsl(var(--muted))"
    }
  }

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
        Interactive Periodic Table
      </text>

      {/* Elements grid */}
      <g transform="translate(50, 60)">
        {elements.map((element, i) => {
          const row = Math.floor(i / 4)
          const col = i % 4
          const x = col * 75
          const y = row * 75

          return (
            <g key={element.symbol} onClick={() => setSelectedElement(element)} style={{ cursor: "pointer" }}>
              <rect
                x={x}
                y={y}
                width="65"
                height="65"
                rx="5"
                fill={getCategoryColor(element.category)}
                stroke="hsl(var(--border))"
                strokeWidth="1"
                className="transition-opacity hover:opacity-80"
              />
              <text x={x + 10} y={y + 20} fontSize="10" fill="hsl(var(--background))" fontFamily="monospace">
                {element.number}
              </text>
              <text
                x={x + 32.5}
                y={y + 40}
                textAnchor="middle"
                fontSize="20"
                fill="hsl(var(--background))"
                fontWeight="bold"
                fontFamily="system-ui"
              >
                {element.symbol}
              </text>
              <text
                x={x + 32.5}
                y={y + 55}
                textAnchor="middle"
                fontSize="8"
                fill="hsl(var(--background))"
                fontFamily="system-ui"
              >
                {element.name}
              </text>
            </g>
          )
        })}
      </g>

      {/* Element details */}
      {selectedElement && (
        <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <rect
            x="50"
            y="300"
            width="300"
            height="80"
            rx="10"
            fill="hsl(var(--card))"
            stroke="hsl(var(--border))"
            strokeWidth="1"
          />
          <text x="60" y="325" fontSize="18" fill="hsl(var(--foreground))" fontWeight="bold" fontFamily="system-ui">
            {selectedElement.name} ({selectedElement.symbol})
          </text>
          <text x="60" y="345" fontSize="14" fill="hsl(var(--foreground))" fontFamily="system-ui">
            Atomic Number: {selectedElement.number}
          </text>
          <text x="60" y="365" fontSize="14" fill="hsl(var(--foreground))" fontFamily="system-ui">
            Group: {selectedElement.group} | Category: {selectedElement.category}
          </text>
        </motion.g>
      )}

      {/* Legend */}
      <g transform="translate(325, 80)">
        <text x="0" y="0" fontSize="10" fill="hsl(var(--foreground))" fontWeight="bold" fontFamily="system-ui">
          LEGEND
        </text>
        {[
          { category: "nonmetal", label: "Nonmetal" },
          { category: "noble", label: "Noble Gas" },
          { category: "alkali", label: "Alkali Metal" },
          { category: "alkaline", label: "Alkaline" },
          { category: "metalloid", label: "Metalloid" },
          { category: "halogen", label: "Halogen" },
        ].map((item, i) => (
          <g key={item.category} transform={`translate(0, ${15 + i * 15})`}>
            <rect x="0" y="0" width="10" height="10" fill={getCategoryColor(item.category)} />
            <text x="15" y="8" fontSize="8" fill="hsl(var(--foreground))" fontFamily="system-ui">
              {item.label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  )
}
