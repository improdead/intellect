"use client"

import React, { useRef, useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

interface StackingCardsProps {
  children: React.ReactNode
  totalCards: number
  scrollOptons?: {
    container?: {
      current: HTMLElement | null
    }
  }
}

interface StackingCardItemProps {
  children: React.ReactNode
  index: number
  className?: string
}

export function StackingCardItem({ children, index, className }: StackingCardItemProps) {
  return (
    <div className={cn("w-full flex items-center justify-center sticky top-0", className)} data-card-index={index}>
      {children}
    </div>
  )
}

export default function StackingCards({ children, totalCards, scrollOptons }: StackingCardsProps) {
  const targetRef = useRef<HTMLDivElement>(null)
  const [cardHeight, setCardHeight] = useState(0)

  // Calculate the height of each card to determine the total scroll height
  useEffect(() => {
    if (targetRef.current) {
      const firstCard = targetRef.current.querySelector('[data-card-index="0"]') as HTMLElement
      if (firstCard) {
        setCardHeight(firstCard.offsetHeight)
      }
    }
  }, [])

  // Calculate the total height needed for the scrolling effect
  const totalHeight = cardHeight * totalCards

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
    ...scrollOptons,
  })

  return (
    <div ref={targetRef} className="relative w-full" style={{ height: `${totalHeight}px` }}>
      {React.Children.map(children, (child, i) => {
        if (React.isValidElement(child) && child.props["data-card-index"] !== undefined) {
          const cardIndex = child.props["data-card-index"]

          // Calculate progress for this specific card
          const cardProgress = useTransform(
            scrollYProgress,
            // Map from the start of this card to the start of the next card
            [cardIndex / totalCards, (cardIndex + 1) / totalCards],
            // Map to opacity and scale values
            [1, 0],
          )

          // Calculate scale based on progress
          const scale = useTransform(cardProgress, [0, 1], [1, 0.8])

          // Calculate opacity based on progress
          const opacity = useTransform(cardProgress, [0, 1], [1, 0])

          // Calculate y position based on progress
          const y = useTransform(cardProgress, [0, 1], [0, -50])

          return (
            <motion.div
              style={{
                scale,
                opacity,
                y,
              }}
              className="absolute top-0 left-0 w-full"
            >
              {child}
            </motion.div>
          )
        }

        // Return non-card children as is
        return child
      })}
    </div>
  )
}
