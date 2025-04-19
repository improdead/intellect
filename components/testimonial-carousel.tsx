"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    id: 1,
    content:
      "The interactive simulations helped me understand physics concepts that I've struggled with for years. It's like having a personal tutor available 24/7.",
    name: "Sarah Johnson",
    title: "Physics Student",
    avatar: "/testimonial-1.png",
  },
  {
    id: 2,
    content:
      "I was struggling with calculus until I found Intellect. The way the AI breaks down complex problems and visualizes them made all the difference.",
    name: "Michael Chen",
    title: "Engineering Major",
    avatar: "/testimonial-2.png",
  },
  {
    id: 3,
    content:
      "As a teacher, I've incorporated Intellect into my classroom. My students are more engaged and their test scores have improved significantly.",
    name: "Dr. Emily Rodriguez",
    title: "High School Science Teacher",
    avatar: "/testimonial-3.png",
  },
  {
    id: 4,
    content:
      "The platform's ability to generate custom simulations based on my specific questions has revolutionized how I study organic chemistry.",
    name: "David Patel",
    title: "Pre-Med Student",
    avatar: "/testimonial-4.png",
  },
]

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoplay])

  const handlePrevious = () => {
    setAutoplay(false)
    setDirection(-1)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
  }

  const handleNext = () => {
    setAutoplay(false)
    setDirection(1)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  }

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="relative overflow-hidden h-[300px] md:h-[250px]">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Card className="w-full max-w-4xl border-primary/10 bg-background/50 backdrop-blur-sm p-8 md:p-10">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-shrink-0">
                  <Avatar className="h-20 w-20 border-2 border-primary/20">
                    <AvatarImage src={testimonials[currentIndex].avatar} />
                    <AvatarFallback>{testimonials[currentIndex].name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 space-y-4 text-center md:text-left">
                  <Quote className="h-8 w-8 text-primary/40 mx-auto md:mx-0" />
                  <p className="text-lg italic text-foreground/90">{testimonials[currentIndex].content}</p>
                  <div>
                    <h4 className="font-semibold">{testimonials[currentIndex].name}</h4>
                    <p className="text-sm text-foreground/70">{testimonials[currentIndex].title}</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center mt-8 gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          className="rounded-full border-primary/20 hover:bg-primary/5"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous</span>
        </Button>

        <div className="flex gap-2 items-center">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setAutoplay(false)
                setDirection(index > currentIndex ? 1 : -1)
                setCurrentIndex(index)
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-primary w-4" : "bg-primary/30"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          className="rounded-full border-primary/20 hover:bg-primary/5"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next</span>
        </Button>
      </div>
    </div>
  )
}
