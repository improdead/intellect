"use client"

import type React from "react"

import { Play, Pause, Volume2, VolumeX, Brain, Sparkles } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"

interface Feature {
  icon: React.ReactNode
  label: string
}

const features: Feature[] = [
  { icon: <Brain className="h-4 w-4" />, label: "AI-Powered" },
  { icon: <Sparkles className="h-4 w-4" />, label: "Interactive" },
]

interface VideoPreviewProps {
  src?: string
  title?: string
  description?: string
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  src = "",
  title = "AI-Powered Learning Experience",
  description = "See how our platform transforms education with interactive simulations",
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)

  // Simulate video progress when playing
  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 0
          }
          return prev + 0.5
        })
      }, 100)
    } else if (progressInterval.current) {
      clearInterval(progressInterval.current)
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [isPlaying])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  return (
    <div className="relative rounded-xl overflow-hidden shadow-2xl border border-primary/10">
      {/* Placeholder for video */}
      <div className="w-full aspect-video bg-gradient-to-br from-purple-900/30 to-blue-900/30 relative overflow-hidden">
        {/* Animated elements to simulate video content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%7B4C9F9245-3107-475D-A180-E54DADCAA365%7D-xLCRJnEHJC51IYElbJDJWIjN3I8AO7.png"
            alt="AI Learning Platform"
            className="w-full h-full object-cover"
          />

          {/* Overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

          {/* Play button overlay */}
          {!isPlaying && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute"
            >
              <button
                onClick={togglePlay}
                className="bg-primary/90 hover:bg-primary text-white rounded-full p-6 shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <Play className="h-10 w-10" />
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-800">
        <div className="h-full bg-primary transition-all duration-100" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Controls and info */}
      <div className="bg-background/95 backdrop-blur-sm p-4 flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex space-x-2">
            <button onClick={togglePlay} className="rounded-full bg-primary/10 p-2 text-primary hover:bg-primary/20">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button onClick={toggleMute} className="rounded-full bg-primary/10 p-2 text-primary hover:bg-primary/20">
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <p className="text-sm text-foreground/80">{description}</p>
        <div className="mt-2 flex items-center gap-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-1 text-xs bg-primary/10 px-3 py-1 rounded-full">
              {feature.icon}
              <span>{feature.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default VideoPreview
