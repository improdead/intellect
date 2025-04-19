"use client"

interface SVGPlaceholderProps {
  subject: string
}

export default function SVGPlaceholder({ subject }: SVGPlaceholderProps) {
  return (
    <svg viewBox="0 0 400 400" className="w-full h-full max-h-[400px]" style={{ backgroundColor: "var(--background)" }}>
      {/* Background */}
      <rect x="0" y="0" width="400" height="400" fill="hsl(var(--background))" />

      {/* Placeholder content */}
      <rect
        x="50"
        y="50"
        width="300"
        height="300"
        rx="10"
        fill="hsl(var(--muted))"
        stroke="hsl(var(--border))"
        strokeWidth="2"
        strokeDasharray="10 5"
      />

      <text
        x="200"
        y="180"
        textAnchor="middle"
        fontSize="24"
        fontWeight="bold"
        fill="hsl(var(--foreground))"
        fontFamily="system-ui"
      >
        {subject} Visualization
      </text>

      <text x="200" y="220" textAnchor="middle" fontSize="16" fill="hsl(var(--foreground))" fontFamily="system-ui">
        AI will generate content here
      </text>
    </svg>
  )
}
