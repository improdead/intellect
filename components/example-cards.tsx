'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Pi, BarChart2, Leaf } from 'lucide-react';

interface ExampleCardsProps {
  onExampleSelect: (example: string) => void;
}

export default function ExampleCards({ onExampleSelect }: ExampleCardsProps) {
  const examples = [
    {
      id: 'math',
      icon: <Pi className="h-6 w-6 text-blue-500" />,
      subject: 'MATHEMATICS',
      question: 'How do you diagonalize a matrix?',
      color: 'from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20',
    },
    {
      id: 'finance',
      icon: <BarChart2 className="h-6 w-6 text-amber-500" />,
      subject: 'MATHEMATICS AND FINANCE',
      question: 'What are some applications of the Black-Scholes formula?',
      color: 'from-amber-50/50 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/20',
    },
    {
      id: 'biology',
      icon: <Leaf className="h-6 w-6 text-green-500" />,
      subject: 'BIOLOGY',
      question: 'Explain the processes of mitosis and meiosis',
      color: 'from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-rubik">
      {examples.map((example) => (
        <Card 
          key={example.id}
          className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 bg-gradient-to-br ${example.color} border-0`}
          onClick={() => onExampleSelect(example.question)}
        >
          <div className="mb-2">{example.icon}</div>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            {example.subject}
          </div>
          <div className="text-sm font-medium">
            {example.question}
          </div>
        </Card>
      ))}
    </div>
  );
}
