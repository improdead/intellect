"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Atom,
  Calculator,
  FlaskRoundIcon as Flask,
  Leaf,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Star,
  BarChart2,
  ArrowRight,
  Filter,
  Plus,
  Loader2,
} from "lucide-react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { toast } from "sonner";
import {
  clientDataService,
  QuizWithInfo,
  SubjectWithIcon,
} from "@/lib/data-service";
import { getSubjectIcon } from "@/components/subject-icon";
import { CreateModal } from "@/components/ui/create-modal";
import { QuizForm } from "@/components/forms/quiz-form";
import { QuizSkeleton } from "@/components/ui/skeleton-loader";

// Interface for quiz data with icon
interface QuizWithIcon extends QuizWithInfo {
  icon?: React.ReactNode;
  subject?: string;
}

// Sample quiz questions for the quiz taking experience
const sampleQuizQuestions = [
  {
    id: 1,
    title: "Newton's Laws of Motion",
    subject: "Physics",
    icon: <Atom className="h-5 w-5" />,
    questions: 10,
    timeEstimate: "15 min",
    difficulty: "Intermediate",
    description:
      "Test your understanding of Newton's three laws of motion and their applications.",
  },
  {
    id: 2,
    title: "Calculus Fundamentals",
    subject: "Math",
    icon: <Calculator className="h-5 w-5" />,
    questions: 12,
    timeEstimate: "20 min",
    difficulty: "Advanced",
    description:
      "Challenge yourself with derivatives, integrals, and applications of calculus.",
  },
  {
    id: 3,
    title: "Periodic Table Elements",
    subject: "Chemistry",
    icon: <Flask className="h-5 w-5" />,
    questions: 15,
    timeEstimate: "25 min",
    difficulty: "Intermediate",
    description:
      "Identify elements, their properties, and their positions in the periodic table.",
  },
  {
    id: 4,
    title: "Cell Structure and Function",
    subject: "Biology",
    icon: <Leaf className="h-5 w-5" />,
    questions: 8,
    timeEstimate: "12 min",
    difficulty: "Beginner",
    description:
      "Explore the basic components of cells and their functions in living organisms.",
  },
];

const completedQuizzes = [
  {
    id: 101,
    title: "Quantum Mechanics Basics",
    subject: "Physics",
    icon: <Atom className="h-5 w-5" />,
    score: 85,
    date: "May 15, 2023",
    questions: 10,
  },
  {
    id: 102,
    title: "Algebra Fundamentals",
    subject: "Math",
    icon: <Calculator className="h-5 w-5" />,
    score: 92,
    date: "May 10, 2023",
    questions: 12,
  },
  {
    id: 103,
    title: "Chemical Reactions",
    subject: "Chemistry",
    icon: <Flask className="h-5 w-5" />,
    score: 78,
    date: "May 5, 2023",
    questions: 15,
  },
];

// Sample quiz questions for the quiz page
const quizPageQuestions = [
  {
    id: 1,
    question: "What is Newton's First Law of Motion?",
    options: [
      "An object in motion stays in motion unless acted upon by an external force.",
      "Force equals mass times acceleration.",
      "For every action, there is an equal and opposite reaction.",
      "Objects attract each other with a force proportional to their masses.",
    ],
    correctAnswer: 0,
  },
  {
    id: 2,
    question: "What is Newton's Second Law of Motion?",
    options: [
      "An object in motion stays in motion unless acted upon by an external force.",
      "Force equals mass times acceleration.",
      "For every action, there is an equal and opposite reaction.",
      "Objects attract each other with a force proportional to their masses.",
    ],
    correctAnswer: 1,
  },
  {
    id: 3,
    question: "What is Newton's Third Law of Motion?",
    options: [
      "An object in motion stays in motion unless acted upon by an external force.",
      "Force equals mass times acceleration.",
      "For every action, there is an equal and opposite reaction.",
      "Objects attract each other with a force proportional to their masses.",
    ],
    correctAnswer: 2,
  },
];

export default function QuizPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("available");
  const [activeQuiz, setActiveQuiz] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<{
    correct: number;
    total: number;
    answers: { questionId: number; isCorrect: boolean }[];
  } | null>(null);
  const [quizzes, setQuizzes] = useState<QuizWithIcon[]>([]);
  const [subjects, setSubjects] = useState<SubjectWithIcon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch quizzes and subjects
  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        setIsLoading(true);

        // Fetch all quizzes
        const quizzesData = await clientDataService.getAllQuizzes();

        // Fetch all subjects to get subject names
        const subjectsData = await clientDataService.getSubjects();
        setSubjects(subjectsData);

        // Create a map of subject IDs to names
        const subjectMap = new Map();
        subjectsData.forEach((subject) => {
          subjectMap.set(
            subject.id,
            subject.name || subject.title || "Unknown Subject"
          );
        });

        // Add icon and subject name to each quiz
        const quizzesWithIcons = quizzesData.map((quiz) => {
          const subjectName = subjectMap.get(quiz.subject_id) || "Unknown";
          return {
            ...quiz,
            icon: getSubjectIcon(subjectName),
            subject: subjectName,
          };
        });

        setQuizzes(quizzesWithIcons);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        toast.error("Failed to load quizzes. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const handleCreateQuizSuccess = (newQuiz: QuizWithInfo) => {
    toast.success(`Quiz "${newQuiz.title}" created successfully!`);
    setIsCreateModalOpen(false);
    // Refresh the quizzes list
    if (user) {
      setIsLoading(true);
      clientDataService
        .getAllQuizzes()
        .then((quizzesData) => {
          // Add icon and subject name to each quiz
          const quizzesWithIcons = quizzesData.map((quiz) => {
            const subject = subjects.find((s) => s.id === quiz.subject_id);
            const subjectName = subject
              ? subject.name || subject.title || "Unknown"
              : "Unknown";
            return {
              ...quiz,
              icon: getSubjectIcon(subjectName),
              subject: subjectName,
            };
          });
          setQuizzes(quizzesWithIcons);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error refreshing quizzes:", error);
          setIsLoading(false);
        });
    }
  };

  const startQuiz = (quizId: number) => {
    setActiveQuiz(quizId);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setQuizResults(null);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(answerIndex);
    }
  };

  const submitAnswer = () => {
    if (selectedAnswer !== null) {
      setIsAnswerSubmitted(true);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < quizPageQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      // End of quiz
      setQuizResults({
        correct: 2, // Simulated result
        total: quizPageQuestions.length,
        answers: quizPageQuestions.map((q, i) => ({
          questionId: q.id,
          isCorrect: i % 2 === 0, // Simulated correct/incorrect pattern
        })),
      });
    }
  };

  const exitQuiz = () => {
    setActiveQuiz(null);
    setQuizResults(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Quizzes</h1>
          <p className="text-muted-foreground">
            Test your knowledge with interactive quizzes
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>New Quiz</span>
          </Button>
          <Button
            variant="outline"
            className="border-primary/20 hover:bg-primary/5"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeQuiz === null ? (
          <motion.div
            key="quiz-list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Tabs
              defaultValue="available"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                <TabsTrigger value="available">Available Quizzes</TabsTrigger>
                <TabsTrigger value="completed">Completed Quizzes</TabsTrigger>
              </TabsList>

              <TabsContent value="available" className="space-y-4">
                {isLoading ? (
                  // Loading skeleton
                  <>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <motion.div
                        key={`skeleton-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className="overflow-hidden border-0 shadow-md bg-card/50 backdrop-blur-sm">
                          <CardContent className="p-6">
                            <QuizSkeleton />
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </>
                ) : quizzes.length > 0 ? (
                  // Quizzes list
                  quizzes.map((quiz) => (
                    <motion.div
                      key={quiz.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              {quiz.icon && React.isValidElement(quiz.icon) ? (
                                quiz.icon
                              ) : (
                                <Atom className="h-5 w-5" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-lg">
                                    {quiz.title}
                                  </h3>
                                  <p className="text-muted-foreground text-sm">
                                    {quiz.description}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="rounded-full"
                                  onClick={() => startQuiz(Number(quiz.id))}
                                >
                                  <ChevronRight className="h-5 w-5" />
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-3">
                                <Badge
                                  variant="outline"
                                  className="bg-primary/5 hover:bg-primary/10"
                                >
                                  {quiz.subject}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="bg-secondary/10 hover:bg-secondary/20"
                                >
                                  {quiz.difficulty || "Beginner"}
                                </Badge>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                  {quiz.estimated_time || "10 min"}
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                  {quiz.question_count} questions
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  // No quizzes found
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full text-center py-8"
                  >
                    <p className="text-muted-foreground">
                      No quizzes found. Create your first quiz to get started.
                    </p>
                    <div className="mt-4">
                      <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Create First Quiz</span>
                      </Button>
                    </div>
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                <Card className="overflow-hidden border-0 shadow-md bg-card/50 backdrop-blur-sm">
                  <CardHeader className="p-6 pb-2">
                    <CardTitle className="text-lg">Your Quiz History</CardTitle>
                    <CardDescription>
                      View your past quiz attempts and scores
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-2">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        You haven't completed any quizzes yet.
                      </p>
                      <div className="mt-4">
                        <Button
                          onClick={() => setActiveTab("available")}
                          className="flex items-center gap-2"
                        >
                          <ArrowRight className="h-4 w-4" />
                          <span>Browse Available Quizzes</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        ) : (
          <motion.div
            key="active-quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {quizResults === null ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold">
                      {availableQuizzes.find((q) => q.id === activeQuiz)?.title}
                    </h1>
                    <p className="text-foreground/70">
                      Question {currentQuestion + 1} of{" "}
                      {quizPageQuestions.length}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exitQuiz}
                    className="border-primary/20 hover:bg-primary/5"
                  >
                    Exit Quiz
                  </Button>
                </div>

                <Progress
                  value={
                    ((currentQuestion + 1) / quizPageQuestions.length) * 100
                  }
                  className="h-2"
                />

                <Card className="border-primary/10">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-medium mb-6">
                      {quizPageQuestions[currentQuestion].question}
                    </h2>
                    <div className="space-y-3">
                      {quizPageQuestions[currentQuestion].options.map(
                        (option, index) => {
                          const isCorrect =
                            index ===
                            quizPageQuestions[currentQuestion].correctAnswer;
                          const isSelected = selectedAnswer === index;

                          return (
                            <div
                              key={index}
                              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                isSelected
                                  ? isAnswerSubmitted
                                    ? isCorrect
                                      ? "border-green-500 bg-green-500/10"
                                      : "border-red-500 bg-red-500/10"
                                    : "border-primary bg-primary/10"
                                  : "border-primary/10 hover:border-primary/30 hover:bg-primary/5"
                              }`}
                              onClick={() => handleAnswerSelect(index)}
                            >
                              <div className="flex items-center justify-between">
                                <span>{option}</span>
                                {isAnswerSubmitted &&
                                  (isCorrect ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  ) : (
                                    isSelected && (
                                      <XCircle className="h-5 w-5 text-red-500" />
                                    )
                                  ))}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex items-center gap-1 text-foreground/60">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Time remaining: 2:45</span>
                    </div>
                    {isAnswerSubmitted ? (
                      <Button onClick={nextQuestion}>
                        {currentQuestion < quizPageQuestions.length - 1
                          ? "Next Question"
                          : "Finish Quiz"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={submitAnswer}
                        disabled={selectedAnswer === null}
                      >
                        Submit Answer
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </div>
            ) : (
              <div className="space-y-6">
                <Card className="border-primary/10">
                  <CardHeader>
                    <CardTitle className="text-center">Quiz Results</CardTitle>
                    <CardDescription className="text-center">
                      {availableQuizzes.find((q) => q.id === activeQuiz)?.title}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center mb-8">
                      <div className="relative w-32 h-32 mb-4">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="hsl(var(--primary) / 0.2)"
                              strokeWidth="10"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="hsl(var(--primary))"
                              strokeWidth="10"
                              strokeDasharray={`${2 * Math.PI * 45}`}
                              strokeDashoffset={`${
                                2 *
                                Math.PI *
                                45 *
                                (1 - quizResults.correct / quizResults.total)
                              }`}
                              strokeLinecap="round"
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-3xl font-bold">
                                {Math.round(
                                  (quizResults.correct / quizResults.total) *
                                    100
                                )}
                                %
                              </div>
                              <div className="text-sm text-foreground/70">
                                Score
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-center mb-2">
                        <h3 className="text-xl font-medium">
                          {quizResults.correct} out of {quizResults.total}{" "}
                          correct
                        </h3>
                        <p className="text-foreground/70">
                          {quizResults.correct >= quizResults.total / 2
                            ? "Great job!"
                            : "Keep practicing!"}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        {quizResults.correct === quizResults.total ? (
                          <Badge className="bg-green-500">Perfect Score</Badge>
                        ) : quizResults.correct >= quizResults.total * 0.8 ? (
                          <Badge className="bg-blue-500">Excellent</Badge>
                        ) : quizResults.correct >= quizResults.total * 0.6 ? (
                          <Badge className="bg-amber-500">Good</Badge>
                        ) : (
                          <Badge className="bg-red-500">
                            Needs Improvement
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <h3 className="font-medium">Question Summary</h3>
                      {quizResults.answers.map((answer, index) => (
                        <div key={index} className="flex items-center gap-3">
                          {answer.isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                          )}
                          <div className="text-sm">
                            Question {index + 1}:{" "}
                            {quizPageQuestions[index].question}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={exitQuiz}
                      className="border-primary/20 hover:bg-primary/5"
                    >
                      Back to Quizzes
                    </Button>
                    <Button>Review Answers</Button>
                  </CardFooter>
                </Card>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Quiz Modal */}
      <CreateModal
        title="Create New Quiz"
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <QuizForm
          subjects={subjects}
          onSuccess={handleCreateQuizSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </CreateModal>
    </div>
  );
}
