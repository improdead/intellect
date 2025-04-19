"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LightbulbIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReminderPopupProps {
  message: string;
  duration?: number; // Duration in milliseconds before auto-closing
  onClose?: () => void;
}

export function ReminderPopup({ 
  message, 
  duration = 10000, // Default 10 seconds
  onClose 
}: ReminderPopupProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-50 max-w-md"
        >
          <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-lg shadow-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/20 rounded-full p-2 flex-shrink-0">
                <LightbulbIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm">Reminder</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full -mt-1 -mr-1"
                    onClick={handleClose}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{message}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
