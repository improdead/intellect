import { getSupabaseClient } from "./supabase-client";
import { auth0IdToUuid } from "./auth0-utils";
import { Database } from "@/types/supabase";
import { Json } from "@/types/supabase";

// Quiz with additional UI properties
export interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  icon?: any; // For client-side icon component
  subject?: string; // Subject name
  question_count?: number; // Number of questions
  timeEstimate?: string; // Estimated time to complete
  difficulty?: string; // Quiz difficulty
}

// Quiz question with additional UI properties
export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: any;
  correct_answer: string;
  created_at: string;
  updated_at: string;
  optionsArray?: string[]; // Parsed options array for easier use
}

// Quiz attempt with additional UI properties
export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  completed_at: string;
  created_at: string;
  updated_at: string;
  quiz_title?: string; // Quiz title
  subject?: string; // Subject name
  icon?: any; // For client-side icon component
}

// Client-side quiz data service
export const quizService = {
  // Get dummy quizzes for development
  getDummyQuizzes(): Quiz[] {
    return [
      {
        id: "1",
        lesson_id: "1",
        title: "Newton's Laws of Motion",
        description:
          "Test your understanding of Newton's three laws of motion and their applications.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subject: "Physics",
        question_count: 10,
        timeEstimate: "15 min",
        difficulty: "Intermediate",
      },
      {
        id: "2",
        lesson_id: "2",
        title: "Calculus Fundamentals",
        description:
          "Challenge yourself with derivatives, integrals, and applications of calculus.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subject: "Math",
        question_count: 12,
        timeEstimate: "20 min",
        difficulty: "Advanced",
      },
      {
        id: "3",
        lesson_id: "3",
        title: "Periodic Table Elements",
        description:
          "Identify elements, their properties, and their positions in the periodic table.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subject: "Chemistry",
        question_count: 15,
        timeEstimate: "25 min",
        difficulty: "Intermediate",
      },
      {
        id: "4",
        lesson_id: "4",
        title: "Cell Structure and Function",
        description:
          "Explore the basic components of cells and their functions in living organisms.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subject: "Biology",
        question_count: 8,
        timeEstimate: "12 min",
        difficulty: "Beginner",
      },
    ];
  },

  // Get dummy quiz attempts for development
  getDummyQuizAttempts(): QuizAttempt[] {
    return [
      {
        id: "101",
        user_id: "user1",
        quiz_id: "1",
        score: 85,
        completed_at: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        created_at: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updated_at: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        quiz_title: "Quantum Mechanics Basics",
        subject: "Physics",
      },
      {
        id: "102",
        user_id: "user1",
        quiz_id: "2",
        score: 92,
        completed_at: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000
        ).toISOString(),
        created_at: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updated_at: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000
        ).toISOString(),
        quiz_title: "Algebra Fundamentals",
        subject: "Math",
      },
      {
        id: "103",
        user_id: "user1",
        quiz_id: "3",
        score: 78,
        completed_at: new Date(
          Date.now() - 15 * 24 * 60 * 60 * 1000
        ).toISOString(),
        created_at: new Date(
          Date.now() - 15 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updated_at: new Date(
          Date.now() - 15 * 24 * 60 * 60 * 1000
        ).toISOString(),
        quiz_title: "Chemical Reactions",
        subject: "Chemistry",
      },
    ];
  },

  // Get all available quizzes
  async getAvailableQuizzes(): Promise<Quiz[]> {
    try {
      const supabase = getSupabaseClient();

      // Check if the quizzes table exists
      const { error: tableCheckError } = await supabase
        .from("quizzes")
        .select("id")
        .limit(1);

      // If table doesn't exist or we can't access it, return dummy data
      if (tableCheckError) {
        console.log("Using dummy quiz data because:", tableCheckError.message);
        return this.getDummyQuizzes();
      }

      const { data, error } = await supabase
        .from("quizzes")
        .select(
          `
          *,
          lessons!inner(
            title,
            courses!inner(
              title,
              subject_id,
              subjects!inner(
                title
              )
            )
          ),
          quiz_questions(count)
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching quizzes:", error);
        return this.getDummyQuizzes();
      }

      // Transform data to include subject and question count
      return (data || []).map((quiz) => {
        const questionCount = quiz.quiz_questions?.[0]?.count || 0;
        // Estimate time based on question count (2 minutes per question)
        const estimatedMinutes = questionCount * 2;

        return {
          ...quiz,
          subject: quiz.lessons?.courses?.subjects?.title || "Unknown",
          question_count: questionCount,
          timeEstimate: `${estimatedMinutes} min`,
          // Default to intermediate difficulty if not specified
          difficulty: "Intermediate",
        };
      });
    } catch (error) {
      console.error("Error in getAvailableQuizzes:", error);
      return [];
    }
  },

  // Get completed quizzes for a user
  async getCompletedQuizzes(userId: string): Promise<QuizAttempt[]> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();

      // Check if the user_quiz_attempts table exists
      const { error: tableCheckError } = await supabase
        .from("user_quiz_attempts")
        .select("id")
        .limit(1);

      // If table doesn't exist or we can't access it, return dummy data
      if (tableCheckError) {
        console.log(
          "Using dummy quiz attempts because:",
          tableCheckError.message
        );
        return this.getDummyQuizAttempts();
      }

      const { data, error } = await supabase
        .from("user_quiz_attempts")
        .select(
          `
          *,
          quizzes!inner(
            title,
            lessons!inner(
              courses!inner(
                subjects!inner(
                  title
                )
              )
            )
          )
        `
        )
        .eq("user_id", supabaseUuid)
        .order("completed_at", { ascending: false });

      if (error) {
        console.error("Error fetching completed quizzes:", error);
        return this.getDummyQuizAttempts();
      }

      // Transform data to include quiz title and subject
      return (data || []).map((attempt) => ({
        ...attempt,
        quiz_title: attempt.quizzes?.title || "Unknown Quiz",
        subject:
          attempt.quizzes?.lessons?.courses?.subjects?.title || "Unknown",
      }));
    } catch (error) {
      console.error("Error in getCompletedQuizzes:", error);
      return this.getDummyQuizAttempts();
    }
  },

  // Get dummy quiz questions for development
  getDummyQuizQuestions(quizId: string): QuizQuestion[] {
    return [
      {
        id: "q1",
        quiz_id: quizId,
        question: "What is Newton's First Law of Motion?",
        options: [
          "An object in motion stays in motion unless acted upon by an external force.",
          "Force equals mass times acceleration.",
          "For every action, there is an equal and opposite reaction.",
          "Objects attract each other with a force proportional to their masses.",
        ],
        correct_answer:
          "An object in motion stays in motion unless acted upon by an external force.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        optionsArray: [
          "An object in motion stays in motion unless acted upon by an external force.",
          "Force equals mass times acceleration.",
          "For every action, there is an equal and opposite reaction.",
          "Objects attract each other with a force proportional to their masses.",
        ],
      },
      {
        id: "q2",
        quiz_id: quizId,
        question: "What is Newton's Second Law of Motion?",
        options: [
          "An object in motion stays in motion unless acted upon by an external force.",
          "Force equals mass times acceleration.",
          "For every action, there is an equal and opposite reaction.",
          "Objects attract each other with a force proportional to their masses.",
        ],
        correct_answer: "Force equals mass times acceleration.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        optionsArray: [
          "An object in motion stays in motion unless acted upon by an external force.",
          "Force equals mass times acceleration.",
          "For every action, there is an equal and opposite reaction.",
          "Objects attract each other with a force proportional to their masses.",
        ],
      },
      {
        id: "q3",
        quiz_id: quizId,
        question: "What is Newton's Third Law of Motion?",
        options: [
          "An object in motion stays in motion unless acted upon by an external force.",
          "Force equals mass times acceleration.",
          "For every action, there is an equal and opposite reaction.",
          "Objects attract each other with a force proportional to their masses.",
        ],
        correct_answer:
          "For every action, there is an equal and opposite reaction.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        optionsArray: [
          "An object in motion stays in motion unless acted upon by an external force.",
          "Force equals mass times acceleration.",
          "For every action, there is an equal and opposite reaction.",
          "Objects attract each other with a force proportional to their masses.",
        ],
      },
    ];
  },

  // Get a specific quiz with its questions
  async getQuizWithQuestions(
    quizId: string
  ): Promise<{ quiz: Quiz; questions: QuizQuestion[] }> {
    try {
      const supabase = getSupabaseClient();

      // Check if the quizzes table exists
      const { error: tableCheckError } = await supabase
        .from("quizzes")
        .select("id")
        .limit(1);

      // If table doesn't exist or we can't access it, return dummy data
      if (tableCheckError) {
        console.log("Using dummy quiz data because:", tableCheckError.message);
        const dummyQuizzes = this.getDummyQuizzes();
        const dummyQuiz =
          dummyQuizzes.find((q) => q.id === quizId) || dummyQuizzes[0];
        return {
          quiz: dummyQuiz,
          questions: this.getDummyQuizQuestions(quizId),
        };
      }

      // Get the quiz
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .select(
          `
          *,
          lessons!inner(
            title,
            courses!inner(
              title,
              subject_id,
              subjects!inner(
                title
              )
            )
          )
        `
        )
        .eq("id", quizId)
        .single();

      if (quizError) {
        console.error("Error fetching quiz:", quizError);
        const dummyQuizzes = this.getDummyQuizzes();
        const dummyQuiz =
          dummyQuizzes.find((q) => q.id === quizId) || dummyQuizzes[0];
        return {
          quiz: dummyQuiz,
          questions: this.getDummyQuizQuestions(quizId),
        };
      }

      // Get the questions
      const { data: questions, error: questionsError } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("id");

      if (questionsError) {
        console.error("Error fetching quiz questions:", questionsError);
        return { quiz, questions: this.getDummyQuizQuestions(quizId) };
      }

      // Parse options JSON to array for each question
      const parsedQuestions = (questions || []).map((question) => ({
        ...question,
        optionsArray: (question.options as string[]) || [],
      }));

      return {
        quiz: {
          ...quiz,
          subject: quiz.lessons?.courses?.subjects?.title || "Unknown",
          question_count: parsedQuestions.length,
          timeEstimate: `${parsedQuestions.length * 2} min`,
          difficulty: "Intermediate", // Default
        },
        questions: parsedQuestions,
      };
    } catch (error) {
      console.error("Error in getQuizWithQuestions:", error);
      const dummyQuizzes = this.getDummyQuizzes();
      const dummyQuiz =
        dummyQuizzes.find((q) => q.id === quizId) || dummyQuizzes[0];
      return {
        quiz: dummyQuiz,
        questions: this.getDummyQuizQuestions(quizId),
      };
    }
  },

  // Submit a quiz attempt
  async submitQuizAttempt(
    userId: string,
    quizId: string,
    score: number,
    answers: { questionId: string; isCorrect: boolean }[]
  ): Promise<boolean> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();

      // Check if the user_quiz_attempts table exists
      const { error: tableCheckError } = await supabase
        .from("user_quiz_attempts")
        .select("id")
        .limit(1);

      // If table doesn't exist or we can't access it, return success anyway
      // This is just for development, in production we'd want to handle this differently
      if (tableCheckError) {
        console.log(
          "Simulating quiz submission because:",
          tableCheckError.message
        );
        return true;
      }

      // Record the quiz attempt
      const { error } = await supabase.from("user_quiz_attempts").insert({
        user_id: supabaseUuid,
        quiz_id: quizId,
        score,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error submitting quiz attempt:", error);
        return true; // Return true anyway for development
      }

      // Check if the user_history table exists
      const { error: historyTableCheckError } = await supabase
        .from("user_history")
        .select("id")
        .limit(1);

      // If history table doesn't exist, skip this part
      if (historyTableCheckError) {
        console.log(
          "Skipping history entry because:",
          historyTableCheckError.message
        );
        return true;
      }

      // Also add to user history
      await supabase.from("user_history").insert({
        user_id: supabaseUuid,
        activity_type: "quiz",
        activity_id: quizId,
        title: "Completed quiz", // Will be updated with actual title
        category: "Quiz",
        completed: true,
        score,
        created_at: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error("Error in submitQuizAttempt:", error);
      return true; // Return true anyway for development
    }
  },

  // Create a new quiz
  async createQuiz(
    lessonId: string,
    data: {
      title: string;
      description: string;
      questions: {
        question: string;
        options: string[];
        correctAnswer: string;
      }[];
    }
  ): Promise<{ quiz: Quiz | null; success: boolean }> {
    try {
      const supabase = getSupabaseClient();

      // Check if the quizzes table exists
      const { error: tableCheckError } = await supabase
        .from("quizzes")
        .select("id")
        .limit(1);

      // If table doesn't exist or we can't access it, return dummy data
      if (tableCheckError) {
        console.log(
          "Simulating quiz creation because:",
          tableCheckError.message
        );
        const dummyQuiz = {
          id: Math.random().toString(36).substring(2, 15),
          lesson_id: lessonId,
          title: data.title,
          description: data.description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          subject: "Custom Quiz",
          question_count: data.questions.length,
          timeEstimate: `${data.questions.length * 2} min`,
          difficulty: "Intermediate",
        };
        return { quiz: dummyQuiz, success: true };
      }

      // Create the quiz
      const { data: newQuiz, error: quizError } = await supabase
        .from("quizzes")
        .insert({
          lesson_id: lessonId,
          title: data.title,
          description: data.description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (quizError) {
        console.error("Error creating quiz:", quizError);
        // Return a dummy quiz for development
        const dummyQuiz = {
          id: Math.random().toString(36).substring(2, 15),
          lesson_id: lessonId,
          title: data.title,
          description: data.description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          subject: "Custom Quiz",
          question_count: data.questions.length,
          timeEstimate: `${data.questions.length * 2} min`,
          difficulty: "Intermediate",
        };
        return { quiz: dummyQuiz, success: true };
      }

      // Create the questions
      for (const q of data.questions) {
        const { error: questionError } = await supabase
          .from("quiz_questions")
          .insert({
            quiz_id: newQuiz.id,
            question: q.question,
            options: q.options as Json,
            correct_answer: q.correctAnswer,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (questionError) {
          console.error("Error creating quiz question:", questionError);
          // Continue with other questions even if one fails
        }
      }

      return { quiz: newQuiz, success: true };
    } catch (error) {
      console.error("Error in createQuiz:", error);
      // Return a dummy quiz for development
      const dummyQuiz = {
        id: Math.random().toString(36).substring(2, 15),
        lesson_id: lessonId,
        title: data.title,
        description: data.description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subject: "Custom Quiz",
        question_count: data.questions.length,
        timeEstimate: `${data.questions.length * 2} min`,
        difficulty: "Intermediate",
      };
      return { quiz: dummyQuiz, success: true };
    }
  },
};
