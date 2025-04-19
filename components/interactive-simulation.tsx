"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RefreshCw, Maximize2, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface InteractiveSimulationProps {
  subject: string
}

export default function InteractiveSimulation({ subject }: InteractiveSimulationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [force, setForce] = useState(50)
  const [friction, setFriction] = useState(30)
  const [reset, setReset] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Physics simulation state
  const ballRef = useRef({
    x: 100,
    y: 150,
    vx: 0,
    vy: 0,
    radius: 20,
  })

  // Animation frame reference
  const animationRef = useRef<number | null>(null)

  // Handle simulation based on subject
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    // Reset ball position on subject change
    ballRef.current = {
      x: canvas.width / 4,
      y: canvas.height / 2,
      vx: 0,
      vy: 0,
      radius: 20,
    }

    // Different simulation based on subject
    let simulationFunction: FrameRequestCallback

    switch (subject) {
      case "physics":
        simulationFunction = (time) => renderPhysicsSimulation(ctx, canvas, time)
        break
      case "math":
        simulationFunction = (time) => renderMathSimulation(ctx, canvas, time)
        break
      case "chemistry":
        simulationFunction = (time) => renderChemistrySimulation(ctx, canvas, time)
        break
      case "biology":
        simulationFunction = (time) => renderBiologySimulation(ctx, canvas, time)
        break
      default:
        simulationFunction = (time) => renderPhysicsSimulation(ctx, canvas, time)
    }

    // Start animation
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(simulationFunction)
    }

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [subject, isPlaying, force, friction, reset, isFullscreen])

  // Physics simulation (Newton's laws)
  const renderPhysicsSimulation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number) => {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const ball = ballRef.current

    // Apply force (from slider)
    const appliedForce = (force - 50) * 0.05
    ball.vx += appliedForce

    // Apply friction
    const frictionFactor = 1 - friction / 1000
    ball.vx *= frictionFactor

    // Update position
    ball.x += ball.vx

    // Boundary check
    if (ball.x + ball.radius > canvas.width) {
      ball.x = canvas.width - ball.radius
      ball.vx *= -0.8 // Bounce with energy loss
    } else if (ball.x - ball.radius < 0) {
      ball.x = ball.radius
      ball.vx *= -0.8 // Bounce with energy loss
    }

    // Draw ground
    ctx.beginPath()
    ctx.moveTo(0, canvas.height - 50)
    ctx.lineTo(canvas.width, canvas.height - 50)
    ctx.strokeStyle = "#888"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw ball
    ctx.beginPath()
    ctx.arc(ball.x, canvas.height - 50 - ball.radius, ball.radius, 0, Math.PI * 2)
    ctx.fillStyle = "hsl(var(--primary))"
    ctx.fill()

    // Add glow effect
    ctx.shadowColor = "hsl(var(--primary) / 0.5)"
    ctx.shadowBlur = 15
    ctx.beginPath()
    ctx.arc(ball.x, canvas.height - 50 - ball.radius, ball.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0

    // Draw velocity vector
    ctx.beginPath()
    ctx.moveTo(ball.x, canvas.height - 50 - ball.radius)
    ctx.lineTo(ball.x + ball.vx * 5, canvas.height - 50 - ball.radius)
    ctx.strokeStyle = "rgba(255, 100, 100, 0.7)"
    ctx.lineWidth = 3
    ctx.stroke()

    // Draw force arrow
    ctx.beginPath()
    ctx.moveTo(ball.x, canvas.height - 50 - ball.radius - 30)
    ctx.lineTo(ball.x + appliedForce * 50, canvas.height - 50 - ball.radius - 30)
    ctx.strokeStyle = "rgba(100, 100, 255, 0.7)"
    ctx.lineWidth = 3
    ctx.stroke()

    // Add labels
    ctx.fillStyle = "hsl(var(--foreground))"
    ctx.font = "14px sans-serif"
    ctx.fillText("Force", 20, 30)
    ctx.fillText("Friction", 20, 80)
    ctx.fillText(`Velocity: ${Math.abs(ball.vx).toFixed(2)}`, canvas.width - 120, 30)

    // Continue animation
    if (isPlaying) {
      animationRef.current = requestAnimationFrame((t) => renderPhysicsSimulation(ctx, canvas, t))
    }
  }

  // Math simulation (sine wave)
  const renderMathSimulation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number) => {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const amplitude = force
    const frequency = friction / 20
    const timeOffset = time / 1000

    // Draw x and y axes
    ctx.beginPath()
    ctx.moveTo(0, canvas.height / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.moveTo(50, 0)
    ctx.lineTo(50, canvas.height)
    ctx.strokeStyle = "#888"
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw sine wave
    ctx.beginPath()
    for (let x = 0; x < canvas.width; x++) {
      const y = canvas.height / 2 - Math.sin((x / 50) * frequency + timeOffset) * amplitude
      if (x === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.strokeStyle = "hsl(var(--primary))"
    ctx.lineWidth = 3
    ctx.stroke()

    // Add glow effect
    ctx.shadowColor = "hsl(var(--primary) / 0.5)"
    ctx.shadowBlur = 10
    ctx.stroke()
    ctx.shadowBlur = 0

    // Add labels
    ctx.fillStyle = "hsl(var(--foreground))"
    ctx.font = "14px sans-serif"
    ctx.fillText("Amplitude", 20, 30)
    ctx.fillText("Frequency", 20, 80)
    ctx.fillText(`y = sin(${frequency.toFixed(2)}x)`, canvas.width - 150, 30)

    // Continue animation
    if (isPlaying) {
      animationRef.current = requestAnimationFrame((t) => renderMathSimulation(ctx, canvas, t))
    }
  }

  // Chemistry simulation (particles)
  const renderChemistrySimulation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number) => {
    // Clear canvas with slight fade for trails
    ctx.fillStyle = "rgba(var(--background-rgb), 0.2)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Use time for animation
    const t = time / 1000

    // Draw molecules
    const particleCount = Math.floor(force / 5)
    const speed = friction / 10

    for (let i = 0; i < particleCount; i++) {
      const x = canvas.width / 2 + Math.cos(t * speed + i * 0.5) * (100 + i * 3)
      const y = canvas.height / 2 + Math.sin(t * speed + i * 0.5) * (100 + i * 3)

      // Draw particle
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, Math.PI * 2)
      ctx.fillStyle = `hsl(${(i * 10) % 360}, 70%, 60%)`
      ctx.fill()

      // Add glow effect
      ctx.shadowColor = `hsl(${(i * 10) % 360}, 70%, 60%, 0.5)`
      ctx.shadowBlur = 15
      ctx.fill()
      ctx.shadowBlur = 0

      // Draw connections
      if (i > 0) {
        const prevX = canvas.width / 2 + Math.cos(t * speed + (i - 1) * 0.5) * (100 + (i - 1) * 3)
        const prevY = canvas.height / 2 + Math.sin(t * speed + (i - 1) * 0.5) * (100 + (i - 1) * 3)

        ctx.beginPath()
        ctx.moveTo(prevX, prevY)
        ctx.lineTo(x, y)
        ctx.strokeStyle = "rgba(var(--primary-rgb), 0.3)"
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }

    // Add labels
    ctx.fillStyle = "hsl(var(--foreground))"
    ctx.font = "14px sans-serif"
    ctx.fillText("Particles", 20, 30)
    ctx.fillText("Energy", 20, 80)

    // Continue animation
    if (isPlaying) {
      animationRef.current = requestAnimationFrame((t) => renderChemistrySimulation(ctx, canvas, t))
    }
  }

  // Biology simulation (cell division)
  const renderBiologySimulation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number) => {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const t = time / 1000
    const cellCount = Math.floor(force / 10)
    const growthRate = friction / 50

    // Draw cells
    for (let i = 0; i < cellCount; i++) {
      const angle = (i / cellCount) * Math.PI * 2
      const distance = 80 + Math.sin(t * growthRate) * 20
      const x = canvas.width / 2 + Math.cos(angle) * distance
      const y = canvas.height / 2 + Math.sin(angle) * distance

      // Cell membrane
      ctx.beginPath()
      ctx.arc(x, y, 20 + Math.sin(t * growthRate + i) * 5, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(var(--primary-rgb), 0.2)"
      ctx.fill()
      ctx.strokeStyle = "hsl(var(--primary))"
      ctx.lineWidth = 2
      ctx.stroke()

      // Cell nucleus
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(var(--primary-rgb), 0.6)"
      ctx.fill()

      // Add glow effect
      ctx.shadowColor = "hsl(var(--primary) / 0.5)"
      ctx.shadowBlur = 10
      ctx.fill()
      ctx.shadowBlur = 0
    }

    // Draw central cell
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, 30, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(var(--primary-rgb), 0.3)"
    ctx.fill()
    ctx.strokeStyle = "hsl(var(--primary))"
    ctx.lineWidth = 3
    ctx.stroke()

    // Add labels
    ctx.fillStyle = "hsl(var(--foreground))"
    ctx.font = "14px sans-serif"
    ctx.fillText("Cell Count", 20, 30)
    ctx.fillText("Growth Rate", 20, 80)

    // Continue animation
    if (isPlaying) {
      animationRef.current = requestAnimationFrame((t) => renderBiologySimulation(ctx, canvas, t))
    }
  }

  const handleReset = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current

      // Reset ball position
      ballRef.current = {
        x: canvas.width / 4,
        y: canvas.height / 2,
        vx: 0,
        vy: 0,
        radius: 20,
      }

      setReset(!reset)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className={`flex flex-col ${isFullscreen ? "fixed inset-0 z-50 bg-background p-4" : "h-[500px]"}`}>
      <div className="flex-1 p-4 relative">
        <canvas ref={canvasRef} className="w-full h-full rounded-lg bg-background/50 border border-primary/10" />

        {isFullscreen && (
          <Button
            size="icon"
            variant="outline"
            onClick={toggleFullscreen}
            className="absolute top-6 right-6 h-8 w-8 border-primary/20 bg-background/80 backdrop-blur-sm"
          >
            <Maximize2 className="h-4 w-4" />
            <span className="sr-only">Exit Fullscreen</span>
          </Button>
        )}
      </div>

      <div className="border-t border-primary/10 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-8 w-8 border-primary/20 hover:bg-primary/5 transition-all duration-300"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
            </Button>

            <Button
              size="icon"
              variant="outline"
              onClick={handleReset}
              className="h-8 w-8 border-primary/20 hover:bg-primary/5 transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Reset</span>
            </Button>

            {!isFullscreen && (
              <Button
                size="icon"
                variant="outline"
                onClick={toggleFullscreen}
                className="h-8 w-8 border-primary/20 hover:bg-primary/5 transition-all duration-300"
              >
                <Maximize2 className="h-4 w-4" />
                <span className="sr-only">Fullscreen</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">
              {subject === "physics"
                ? "Newton's Laws"
                : subject === "math"
                  ? "Wave Functions"
                  : subject === "chemistry"
                    ? "Molecular Motion"
                    : "Cell Division"}
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full">
                    <HelpCircle className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    {subject === "physics"
                      ? "Adjust force and friction to see how they affect the object's motion according to Newton's laws."
                      : subject === "math"
                        ? "Modify amplitude and frequency to explore wave functions and their properties."
                        : subject === "chemistry"
                          ? "Change particle count and energy to observe molecular interactions."
                          : "Adjust cell count and growth rate to visualize cell division processes."}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                {subject === "physics"
                  ? "Force"
                  : subject === "math"
                    ? "Amplitude"
                    : subject === "chemistry"
                      ? "Particles"
                      : "Cell Count"}
              </span>
              <span>{force}</span>
            </div>
            <Slider
              value={[force]}
              min={10}
              max={100}
              step={1}
              onValueChange={(value) => setForce(value[0])}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                {subject === "physics"
                  ? "Friction"
                  : subject === "math"
                    ? "Frequency"
                    : subject === "chemistry"
                      ? "Energy"
                      : "Growth Rate"}
              </span>
              <span>{friction}</span>
            </div>
            <Slider
              value={[friction]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => setFriction(value[0])}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
