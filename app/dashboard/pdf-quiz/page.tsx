"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { PdfUploader } from "@/components/pdf-uploader";
import { QuizDisplay } from "@/components/quiz-display";

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

export default function PdfQuizPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateQuiz = async (file: File) => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Log the file details
      console.log(`Generating quiz from file: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`);

      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("questionCount", "10"); // Default to 10 questions

      // Show toast for long operation
      toast.info("Processing PDF and generating quiz. This may take a minute...");

      // Upload the document and generate quiz
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate quiz");
      }

      const data = await response.json();
      setQuestions(data.quiz || []);
      toast.success(`Generated ${data.quiz.length} questions from your document!`);
    } catch (error) {
      console.error("Error generating quiz:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);

      // Show a more user-friendly error message
      if (errorMessage.includes('scanned') || errorMessage.includes('protected')) {
        toast.error("This PDF contains scanned images or is protected. Please try a PDF with actual text content that is not password-protected.");
      } else if (errorMessage.includes('corrupted')) {
        toast.error("The PDF file appears to be corrupted. Please try a different file.");
      } else {
        toast.error(errorMessage || "Failed to generate quiz");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const resetQuiz = () => {
    setQuestions([]);
    setError(null);
  };

  return (
    <div className="space-y-6 relative">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-br from-primary/5 via-primary/10 to-transparent rounded-3xl blur-3xl opacity-50 transform -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-primary/5 via-primary/10 to-transparent rounded-full blur-3xl opacity-30 transform translate-x-1/4 translate-y-1/4"></div>
      </div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text mb-2">PDF Quiz Generator</h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Upload a PDF document to generate quiz questions based on its content
        </p>
      </div>

      <div className="w-full flex flex-col items-center justify-center py-8">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-6">
            {!questions.length ? (
              <PdfUploader
                onUploadComplete={handleGenerateQuiz}
                isUploading={isGenerating}
              />
            ) : (
              <QuizDisplay
                questions={questions}
                onReset={resetQuiz}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
