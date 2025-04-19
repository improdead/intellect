'use client';

import React, { useState, useEffect } from 'react';

interface SimpleVideoGeneratorProps {
  topic: string;
}

export default function SimpleVideoGenerator({ topic }: SimpleVideoGeneratorProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Initializing');
  const [isComplete, setIsComplete] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  
  // Simulate video generation process
  useEffect(() => {
    let mounted = true;
    let progressInterval: NodeJS.Timeout;
    
    const simulateProgress = () => {
      let currentProgress = 0;
      
      progressInterval = setInterval(() => {
        if (!mounted) return;
        
        currentProgress += 10;
        
        // Update stage based on progress
        let currentStage = 'Generating script';
        if (currentProgress > 20 && currentProgress <= 40) {
          currentStage = 'Generating voice narration';
        } else if (currentProgress > 40 && currentProgress <= 60) {
          currentStage = 'Creating animations';
        } else if (currentProgress > 60 && currentProgress <= 80) {
          currentStage = 'Rendering frames';
        } else if (currentProgress > 80) {
          currentStage = 'Finalizing video';
        }
        
        setProgress(currentProgress);
        setStage(currentStage);
        
        // Complete the process
        if (currentProgress >= 100) {
          clearInterval(progressInterval);
          setIsComplete(true);
          setVideoUrl('https://fs-opennote-us-east-1.s3.us-east-1.amazonaws.com/2025-04-18T15:09:11.338354---1551e7de-1c67-11f0-9c6f-0afffc63bc59---output.mp4');
        }
      }, 1000); // Update every second
    };
    
    // Start the simulation
    simulateProgress();
    
    // Cleanup
    return () => {
      mounted = false;
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [topic]);
  
  return (
    <div className="w-full">
      {!isComplete ? (
        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <div className="flex items-center mb-2">
            <div className="mr-3">
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm">{stage}</h3>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            <div className="ml-3 text-sm font-medium">{progress}%</div>
          </div>
          <p className="text-xs text-gray-500">
            Generating a video about {topic}. This may take a few moments...
          </p>
        </div>
      ) : (
        <div className="mt-4">
          <h3 className="font-medium text-lg mb-2">Video Generated!</h3>
          <video 
            controls 
            className="w-full rounded-lg shadow-lg" 
            src={videoUrl}
          >
            Your browser does not support the video tag.
          </video>
          <p className="text-sm text-gray-500 mt-2">
            This video about {topic} was generated using AI.
          </p>
        </div>
      )}
    </div>
  );
}
