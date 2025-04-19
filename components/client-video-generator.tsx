'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface VideoGeneratorProps {
  topic: string;
  onComplete: (videoUrl: string) => void;
  onProgress: (progress: number, stage: string) => void;
}

export default function ClientVideoGenerator({ topic, onComplete, onProgress }: VideoGeneratorProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Initializing');
  
  // Simulate video generation process
  useEffect(() => {
    let mounted = true;
    
    const simulateProgress = () => {
      // Stages of video generation
      const stages = [
        { progress: 10, stage: 'Generating script' },
        { progress: 30, stage: 'Generating voice narration' },
        { progress: 50, stage: 'Creating animations' },
        { progress: 70, stage: 'Rendering frames' },
        { progress: 90, stage: 'Finalizing video' },
        { progress: 100, stage: 'Video generation complete' }
      ];
      
      // Simulate each stage with a delay
      stages.forEach((stageInfo, index) => {
        setTimeout(() => {
          if (mounted) {
            setProgress(stageInfo.progress);
            setStage(stageInfo.stage);
            onProgress(stageInfo.progress, stageInfo.stage);
            
            // When complete, provide the video URL
            if (stageInfo.progress === 100) {
              onComplete('https://fs-opennote-us-east-1.s3.us-east-1.amazonaws.com/2025-04-18T15:09:11.338354---1551e7de-1c67-11f0-9c6f-0afffc63bc59---output.mp4');
            }
          }
        }, index * 2000); // Each stage takes 2 seconds
      });
    };
    
    // Start the simulation
    simulateProgress();
    
    // Cleanup
    return () => {
      mounted = false;
    };
  }, [topic, onComplete, onProgress]);
  
  return (
    <div className="w-full">
      <div className="bg-secondary/30 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mr-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="m17 12 5-3-5-3v6Z"></path>
              <path d="M7.3 12H2v6"></path>
              <path d="M2 6v6l5.3-6"></path>
              <path d="M15 6v12h-3"></path>
            </svg>
          </motion.div>
          <div className="flex-1">
            <h3 className="font-medium text-sm">{stage}</h3>
            <div className="w-full bg-secondary/50 rounded-full h-2 mt-1">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          <div className="ml-3 text-sm font-medium">{progress}%</div>
        </div>
        <p className="text-xs text-muted-foreground">
          Generating a video about {topic}. This may take a few moments...
        </p>
      </div>
    </div>
  );
}
