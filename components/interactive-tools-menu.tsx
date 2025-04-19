'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Whiteboard,
  Calculator,
  BookOpen,
  FlaskConical,
  Video,
  Layers,
  Sparkles
} from 'lucide-react';

interface InteractiveToolsMenuProps {
  onToolSelect: (tool: string) => void;
}

export default function InteractiveToolsMenu({ onToolSelect }: InteractiveToolsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const tools = [
    { id: 'whiteboard', name: 'Whiteboard', icon: <Whiteboard className="h-5 w-5" /> },
    { id: 'graphing', name: 'Graphing Calculator', icon: <Calculator className="h-5 w-5" /> },
    { id: 'problem-bank', name: 'Problem Bank', icon: <BookOpen className="h-5 w-5" /> },
    { id: 'flashcards', name: 'Flashcards', icon: <Layers className="h-5 w-5" /> },
  ];

  const handleToolClick = (toolId: string) => {
    onToolSelect(toolId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
      >
        <Sparkles className="h-4 w-4" />
        <span className="font-rubik">Interactive Tools</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50 font-rubik"
          >
            <div className="p-2">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleToolClick(tool.id)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="text-primary">{tool.icon}</div>
                  <span>{tool.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
