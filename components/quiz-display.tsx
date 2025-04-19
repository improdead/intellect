"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface QuizQuestion {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  explanation?: string;
}

interface QuizDisplayProps {
  questions: QuizQuestion[];
  onReset: () => void;
}

export function QuizDisplay({ questions, onReset }: QuizDisplayProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleAnswerSelect = (option: string) => {
    if (showExplanation) return;
    
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: option
    });
  };

  const handleCheckAnswer = () => {
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowExplanation(false);
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    
    for (let i = 0; i < questions.length; i++) {
      if (selectedAnswers[i] === questions[i].correctAnswer) {
        correctCount++;
      }
    }
    
    return {
      score: correctCount,
      total: questions.length,
      percentage: Math.round((correctCount / questions.length) * 100)
    };
  };

  const isAnswerSelected = selectedAnswers[currentQuestionIndex] !== undefined;
  const isAnswerCorrect = selectedAnswers[currentQuestionIndex] === currentQuestion.correctAnswer;

  if (quizCompleted) {
    const { score, total, percentage } = calculateScore();
    
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Quiz Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">{percentage}%</div>
            <p className="text-muted-foreground">
              You got {score} out of {total} questions correct
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Score</span>
              <span>{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
          
          <div className="space-y-4 pt-4">
            <h3 className="font-medium">Question Summary</h3>
            <div className="space-y-2">
              {questions.map((question, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-md border flex justify-between items-center ${
                    selectedAnswers[index] === question.correctAnswer 
                      ? "border-green-200 bg-green-50" 
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="text-sm truncate flex-1 mr-2">
                    <span className="font-medium">Q{index + 1}:</span> {question.question}
                  </div>
                  <div className="flex items-center">
                    {selectedAnswers[index] === question.correctAnswer ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="flex items-center">
                        <span className="text-xs mr-2">
                          <span className="font-medium">Correct:</span> {question.correctAnswer}
                        </span>
                        <XCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={onReset} className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate New Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="px-3 py-1">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </Badge>
          <div className="text-sm text-muted-foreground">
            Progress: {Math.round(progress)}%
          </div>
        </div>
        <Progress value={progress} className="h-1.5 mt-2" />
      </CardHeader>
      <CardContent className="pt-4 space-y-6">
        <div>
          <h3 className="text-xl font-medium mb-6">{currentQuestion.question}</h3>
          
          <div className="space-y-3">
            {Object.entries(currentQuestion.options).map(([option, text]) => (
              <div
                key={option}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedAnswers[currentQuestionIndex] === option
                    ? showExplanation
                      ? option === currentQuestion.correctAnswer
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                      : "border-primary bg-primary/5"
                    : "hover:border-primary/50 hover:bg-primary/5"
                }`}
                onClick={() => handleAnswerSelect(option)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium mr-2">{option}:</span>
                    <span>{text}</span>
                  </div>
                  {showExplanation && selectedAnswers[currentQuestionIndex] === option && (
                    <div>
                      {option === currentQuestion.correctAnswer ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-md ${
              isAnswerCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="flex items-start gap-2">
              {isAnswerCorrect ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
              )}
              <div>
                <p className="font-medium">
                  {isAnswerCorrect ? "Correct!" : `Incorrect. The correct answer is ${currentQuestion.correctAnswer}.`}
                </p>
                {currentQuestion.explanation && (
                  <p className="text-sm mt-1">{currentQuestion.explanation}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        
        <div>
          {!showExplanation ? (
            <Button
              onClick={handleCheckAnswer}
              disabled={!isAnswerSelected}
            >
              Check Answer
            </Button>
          ) : (
            <Button onClick={handleNextQuestion}>
              {currentQuestionIndex < totalQuestions - 1 ? (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                "Finish Quiz"
              )}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
