import { getSupabaseClient } from "./supabase-client";
import { auth0IdToUuid } from "./auth0-utils";
import { historyService } from "./history-service";

// Quiz question interface
export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  explanation?: string;
  order_index: number;
  answers: QuizAnswer[];
}

// Quiz answer interface
export interface QuizAnswer {
  id: string;
  question_id: string;
  answer: string;
  is_correct: boolean;
}

// Quiz result interface
export interface QuizResult {
  correct: number;
  total: number;
  score: number;
  answers: {
    questionId: string;
    isCorrect: boolean;
    userAnswer: string;
    correctAnswer: string;
    explanation?: string;
  }[];
}

// Quiz question service
export const quizQuestionService = {
  // Get questions for a quiz
  async getQuizQuestions(quizId: string): Promise<QuizQuestion[]> {
    try {
      const supabase = getSupabaseClient();
      
      // Get questions
      const { data: questions, error: questionsError } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("order_index");
      
      if (questionsError) {
        console.error("Error fetching quiz questions:", questionsError);
        return [];
      }
      
      if (!questions || questions.length === 0) {
        return [];
      }
      
      // Get answers for all questions
      const questionIds = questions.map(q => q.id);
      const { data: answers, error: answersError } = await supabase
        .from("quiz_answers")
        .select("*")
        .in("question_id", questionIds);
      
      if (answersError) {
        console.error("Error fetching quiz answers:", answersError);
        return [];
      }
      
      // Combine questions with their answers
      const questionsWithAnswers = questions.map(question => {
        const questionAnswers = (answers || []).filter(a => a.question_id === question.id);
        return {
          ...question,
          answers: questionAnswers
        };
      });
      
      return questionsWithAnswers;
    } catch (error) {
      console.error("Error in getQuizQuestions:", error);
      return [];
    }
  },
  
  // Submit quiz results
  async submitQuizResults(
    userId: string,
    quizId: string,
    quizTitle: string,
    subjectId: string,
    results: QuizResult
  ): Promise<boolean> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();
      
      // Save quiz attempt
      const { data: attempt, error: attemptError } = await supabase
        .from("quiz_attempts")
        .insert({
          user_id: supabaseUuid,
          quiz_id: quizId,
          score: results.score,
          answers: results.answers,
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (attemptError) {
        console.error("Error saving quiz attempt:", attemptError);
        
        // Try to create the quiz_attempts table if it doesn't exist
        try {
          await supabase.rpc('create_quiz_attempts_table');
          
          // Try again after creating the table
          const { error: retryError } = await supabase
            .from("quiz_attempts")
            .insert({
              user_id: supabaseUuid,
              quiz_id: quizId,
              score: results.score,
              answers: results.answers,
              completed_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (retryError) {
            console.error("Error saving quiz attempt after table creation:", retryError);
          }
        } catch (rpcError) {
          console.error("Error creating quiz_attempts table:", rpcError);
        }
      }
      
      // Add to user history
      await historyService.addHistoryEntry(userId, {
        activity_type: "quiz",
        activity_id: quizId,
        title: `Completed quiz: ${quizTitle}`,
        description: `Score: ${results.score}%`,
        category: "Quiz",
        completed: true,
        score: results.score
      });
      
      // Add to history table
      try {
        await supabase
          .from("history")
          .insert({
            user_id: supabaseUuid,
            activity_type: "quiz",
            activity_id: quizId,
            subject_id: subjectId,
            title: `Completed quiz: ${quizTitle}`,
            score: results.score,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      } catch (historyError) {
        console.error("Error adding to history table:", historyError);
      }
      
      return true;
    } catch (error) {
      console.error("Error in submitQuizResults:", error);
      return false;
    }
  },
  
  // Get quiz attempts for a user
  async getQuizAttempts(userId: string): Promise<any[]> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();
      
      // Try to get quiz attempts
      try {
        const { data, error } = await supabase
          .from("quiz_attempts")
          .select(`
            *,
            quizzes(
              title,
              subject_id
            )
          `)
          .eq("user_id", supabaseUuid)
          .order("completed_at", { ascending: false });
        
        if (error) {
          console.error("Error fetching quiz attempts:", error);
          return [];
        }
        
        return data || [];
      } catch (error) {
        console.error("Exception fetching quiz attempts:", error);
        return [];
      }
    } catch (error) {
      console.error("Error in getQuizAttempts:", error);
      return [];
    }
  }
};
