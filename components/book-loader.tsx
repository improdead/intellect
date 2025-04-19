'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface BookLoaderProps {
  size?: string;
  color?: string;
  textColor?: string;
  text?: string;
}

export const BookLoader: React.FC<BookLoaderProps> = ({
  size = '60px',
  color = '#4645F6',
  textColor = '#4645F6',
  text = 'Loading...'
}) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        className="relative" 
        style={{ 
          width: size, 
          height: size 
        }}
      >
        {/* Book cover */}
        <motion.div
          className="absolute inset-0 rounded-r-md"
          style={{ backgroundColor: color }}
          animate={{ rotateY: [0, -180] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut'
          }}
        />
        
        {/* Book pages */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 bg-white rounded-r-sm"
            style={{ 
              left: `${i * 2}%`,
              right: `${(5 - i) * 2}%`,
              zIndex: -i
            }}
            animate={{ rotateY: [0, -180] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
              delay: i * 0.1
            }}
          />
        ))}
      </div>
      
      {text && (
        <motion.p 
          className="mt-3 text-sm font-medium"
          style={{ color: textColor }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};
