'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface VideoGenerationLoaderProps {
  progress: number;
  timeRemaining: string;
}

export default function VideoGenerationLoader({ progress, timeRemaining }: VideoGenerationLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 font-rubik">
      <div className="relative w-40 h-40 mb-6">
        {/* Circular progress indicator */}
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e6e6e6"
            strokeWidth="5"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#333333"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={283} // 2 * PI * r
            strokeDashoffset={283 * (1 - progress / 100)}
            initial={{ strokeDashoffset: 283 }}
            animate={{ strokeDashoffset: 283 * (1 - progress / 100) }}
            transition={{ duration: 0.5 }}
          />
        </svg>
        
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-medium">{progress}%</span>
        </div>
      </div>
      
      {/* Time remaining */}
      <div className="text-gray-600 dark:text-gray-400">
        {timeRemaining} remaining (estimated)
      </div>
    </div>
  );
}
