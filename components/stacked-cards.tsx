"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

interface StackedCardsProps {
  cards: {
    id: number
    title: string
    description: string
    icon: React.ReactNode
    color: string
  }[]
}

export function StackedCards({ cards }: StackedCardsProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="relative h-[440px] w-full max-w-3xl mx-auto mt-10">
      {cards.map((card, index) => {
        // Calculate whether card is before or after active card
        const isActive = index === activeIndex
        const isAfterActive = index > activeIndex
        const isBeforeActive = index < activeIndex

        // Calculate different offsets based on position
        const offset = isActive ? 0 : isAfterActive ? 20 * (index - activeIndex) : -20 * (activeIndex - index)

        return (
          <motion.div
            key={card.id}
            className="absolute w-full"
            style={{
              zIndex: cards.length - Math.abs(activeIndex - index),
              filter: !isActive ? "brightness(0.9)" : "brightness(1)",
            }}
            animate={{
              top: `${offset}px`,
              scale: 1 - Math.abs(activeIndex - index) * 0.05,
              rotate: `${(activeIndex - index) * 2}deg`,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            onClick={() => setActiveIndex(index)}
            whileHover={{
              scale: isActive ? 1.02 : 1 - Math.abs(activeIndex - index) * 0.04,
              cursor: "pointer",
            }}
          >
            <Card
              className={`w-full p-6 transition-shadow hover:shadow-lg bg-gradient-to-br ${card.color} border-none overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -mr-8 -mt-8 z-0" />
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{card.title}</h3>
                    <p className="mt-2 text-white/90">{card.description}</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

export default StackedCards
