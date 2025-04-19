"use client"

import { useState, useRef } from "react"
import { motion, useMotionValue, useTransform } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Brain, Lightbulb, Zap, BarChart, Clock, Users } from "lucide-react"

const features = [
  {
    icon: <Brain className="h-8 w-8" />,
    title: "AI-Powered Learning",
    description: "Our advanced AI understands your questions and creates personalized learning experiences.",
  },
  {
    icon: <Lightbulb className="h-8 w-8" />,
    title: "Interactive Simulations",
    description: "Visualize complex concepts through dynamic, interactive simulations generated in real-time.",
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "Instant Feedback",
    description: "Get immediate feedback on your understanding and progress as you learn.",
  },
  {
    icon: <BarChart className="h-8 w-8" />,
    title: "Track Progress",
    description: "Monitor your learning journey with detailed analytics and insights.",
  },
  {
    icon: <Clock className="h-8 w-8" />,
    title: "Learn at Your Pace",
    description: "Study whenever and wherever you want, at a pace that works for you.",
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Community Learning",
    description: "Connect with other learners to share insights and collaborate on complex topics.",
  },
]

export default function FeatureCards() {
  const [activeIndex, setActiveIndex] = useState(0)
  const constraintsRef = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-100, 100], [30, -30])
  const rotateY = useTransform(x, [-100, 100], [-30, 30])

  return (
    <motion.div className="relative perspective-1000" ref={constraintsRef}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{
              scale: 1.05,
              zIndex: 10,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
            }}
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
            onClick={() => setActiveIndex(index)}
            className={`cursor-pointer ${activeIndex === index ? "z-10" : "z-0"}`}
            style={{
              x,
              y,
              rotateX,
              rotateY,
              perspective: 1000,
            }}
            onDragStart={() => setActiveIndex(index)}
          >
            <Card
              className={`p-8 h-full transition-all duration-500 border-primary/10 ${
                activeIndex === index
                  ? "bg-gradient-to-br from-purple-500/10 to-blue-500/10 shadow-lg"
                  : "bg-background/50 backdrop-blur-sm"
              }`}
            >
              <div
                className={`mb-6 transition-colors duration-300 ${
                  activeIndex === index ? "text-primary" : "text-primary/70"
                }`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-foreground/70">{feature.description}</p>

              <motion.div
                className="w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 mt-6 rounded-full"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{
                  scaleX: activeIndex === index ? 1 : 0,
                  transition: { duration: 0.5, ease: "easeOut" },
                }}
              />
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
