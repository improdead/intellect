"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Card {
  id: number;
  name: string;
  designation: string;
  content: React.ReactNode;
}

export const CardStack = ({
  items,
  offset = 10,
  scaleFactor = 0.06,
  autoRotate = true,
  rotationInterval = 5000,
}: {
  items: Card[];
  offset?: number;
  scaleFactor?: number;
  autoRotate?: boolean;
  rotationInterval?: number;
}) => {
  const CARD_OFFSET = offset;
  const SCALE_FACTOR = scaleFactor;
  const [cards, setCards] = useState<Card[]>(items);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoRotate) {
      startRotation();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [autoRotate, items]);

  const startRotation = () => {
    const id = setTimeout(() => {
      setCards((prevCards) => {
        const newArray = [...prevCards];
        newArray.unshift(newArray.pop()!);
        return newArray;
      });
      startRotation();
    }, rotationInterval);

    setTimeoutId(id);
  };

  const handleCardClick = (index: number) => {
    if (index === 0) return; // Already at the top

    setCards((prevCards) => {
      const newArray = [...prevCards];
      // Move the clicked card to the top
      const [selectedCard] = newArray.splice(index, 1);
      newArray.unshift(selectedCard);
      return newArray;
    });

    // Reset the rotation timer if autoRotate is enabled
    if (autoRotate && timeoutId) {
      clearTimeout(timeoutId);
      startRotation();
    }
  };

  return (
    <div className="relative h-[400px] w-full max-w-md mx-auto">
      {cards.map((card, index) => {
        return (
          <motion.div
            key={card.id}
            className="absolute dark:bg-black bg-background/80 border border-primary/10 backdrop-blur-sm h-auto w-full rounded-3xl p-6 shadow-xl flex flex-col justify-between cursor-pointer"
            style={{
              transformOrigin: "top center",
            }}
            animate={{
              top: index * -CARD_OFFSET,
              scale: 1 - index * SCALE_FACTOR,
              zIndex: cards.length - index,
              rotate:
                index === 0
                  ? 0
                  : Math.random() * 2 * (index % 2 === 0 ? -1 : 1),
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            onClick={() => handleCardClick(index)}
            whileHover={{
              scale: index === 0 ? 1.02 : 1 - index * SCALE_FACTOR + 0.02,
            }}
          >
            <div className="font-normal text-foreground/90 dark:text-neutral-200">
              {card.content}
            </div>
            <div className="mt-4 pt-4 border-t border-primary/10">
              <p className="text-primary font-medium dark:text-white">
                {card.name}
              </p>
              <p className="text-foreground/60 font-normal text-sm dark:text-neutral-200">
                {card.designation}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
