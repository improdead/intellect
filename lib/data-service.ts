import { getSupabaseClient } from "./supabase-client";
import { createSupabaseAdmin } from "./supabase-auth";
import { auth0IdToUuid } from "./auth0-utils";
import { fallbackSubjects } from "./fallback-data";

// Subject with icon mapping
export interface SubjectWithIcon {
  id: string;
  // Support different column naming conventions
  title?: string;
  name?: string; // Alternative name for title
  description?: string;
  difficulty?: string;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
  // UI specific properties
  icon?: any; // For client-side icon component
  color?: string; // For gradient colors
  progress?: number; // User's progress percentage
  currentTopic?: string; // Current topic the user is on
}

// Course with additional info
export interface CourseWithProgress {
  id: string;
  subject_id: string;
  title: string;
  description: string;
  difficulty: string;
  created_at: string;
  updated_at: string;
  progress?: number; // User's progress percentage
  lesson_count?: number; // Total number of lessons
  completed_lessons?: number; // Number of completed lessons
}

// Quiz with additional info
export interface QuizWithInfo {
  id: string;
  lesson_id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  question_count: number;
  estimated_time: string;
}

// Types for creating new items
export interface CreateSubjectData {
  name: string;
  description: string;
  icon?: string;
  color?: string;
}

export interface CreateCourseData {
  subject_id: string;
  title: string;
  description: string;
  difficulty?: string;
  image_url?: string;
}

export interface CreateLessonData {
  course_id: string;
  title: string;
  content: string;
  order_index: number;
}

export interface CreateQuizData {
  subject_id: string;
  title: string;
  description: string;
  difficulty?: string;
}

export interface CreateQuizQuestionData {
  quiz_id: string;
  question: string;
  explanation?: string;
  order_index: number;
  answers: CreateQuizAnswerData[];
}

export interface CreateQuizAnswerData {
  answer: string;
  is_correct: boolean;
}

export interface CreateChatHistoryData {
  user_id: string;
  title: string;
  subject_id?: string;
}

export interface CreateChatMessageData {
  chat_id: string;
  role: string;
  content: string;
}

// Client-side data fetching functions
export const clientDataService = {
  // Get all subjects
  async getSubjects(): Promise<SubjectWithIcon[]> {
    try {
      const supabase = getSupabaseClient();

      // Check if Supabase client is properly initialized
      if (!supabase) {
        console.error("Supabase client is not initialized");
        console.log("Using fallback subjects data");
        return fallbackSubjects;
      }

      // Log environment variables (without exposing sensitive data)
      console.log(
        "Supabase URL available:",
        !!process.env.NEXT_PUBLIC_SUPABASE_URL
      );
      console.log(
        "Supabase Anon Key available:",
        !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      // Attempt to fetch subjects
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("name"); // Try ordering by name instead of title

      if (error) {
        console.error("Error fetching subjects:", error);
        console.log("Using fallback subjects data due to error");
        return fallbackSubjects;
      }

      if (!data || data.length === 0) {
        console.log("No subjects found in database, using fallback data");
        return fallbackSubjects;
      }

      console.log("Subjects fetched successfully:", data.length);
      return data;
    } catch (err) {
      console.error("Exception in getSubjects:", err);
      console.log("Using fallback subjects data due to exception");
      return fallbackSubjects;
    }
  },

  // Get user's progress for all subjects - simplified version
  async getUserSubjectsProgress(
    auth0UserId: string
  ): Promise<SubjectWithIcon[]> {
    try {
      console.log("Getting subjects for user:", auth0UserId);
      const supabase = getSupabaseClient();

      // Just get all subjects for now without calculating progress
      const { data: subjects, error: subjectsError } = await supabase
        .from("subjects")
        .select("*");

      if (subjectsError) {
        console.error("Error fetching subjects:", subjectsError);
        return [];
      }

      if (!subjects || subjects.length === 0) {
        console.log("No subjects found");
        return [];
      }

      console.log("Found subjects:", subjects.length);
      console.log("First subject sample:", subjects[0]);

      // Add dummy progress data for now
      return subjects.map((subject) => {
        // Determine the display name (title or name)
        const displayName = subject.title || subject.name || "Unnamed Subject";

        // Ensure we have default values for all fields
        return {
          ...subject,
          // Ensure we have a title property for consistency
          title: displayName,
          // Ensure we have a description
          description: subject.description || "No description available",
          // Add dummy progress data
          progress: Math.floor(Math.random() * 100), // Random progress for demo
          currentTopic: "Introduction", // Default topic
          // Add default difficulty if missing
          difficulty: subject.difficulty || "Beginner",
          // Add timestamps if missing
          created_at: subject.created_at || new Date().toISOString(),
          updated_at: subject.updated_at || new Date().toISOString(),
        };
      });
    } catch (error) {
      console.error("Error in getUserSubjectsProgress:", error);
      return [];
    }
  },

  // Get courses for a subject
  async getCoursesBySubject(subjectId: string): Promise<CourseWithProgress[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("subject_id", subjectId)
      .order("title");

    if (error) {
      console.error("Error fetching courses:", error);
      return [];
    }

    return data || [];
  },

  // Get quizzes for a subject
  async getQuizzesBySubject(subjectId: string): Promise<QuizWithInfo[]> {
    const supabase = getSupabaseClient();

    // Get quizzes
    const { data: quizzes, error: quizzesError } = await supabase
      .from("quizzes")
      .select("*")
      .eq("subject_id", subjectId);

    if (quizzesError) {
      console.error("Error fetching quizzes:", quizzesError);
      return [];
    }

    if (!quizzes || quizzes.length === 0) {
      return [];
    }

    // For each quiz, get the question count
    const quizzesWithInfo: QuizWithInfo[] = [];

    for (const quiz of quizzes) {
      const { data: questions, error: questionsError } = await supabase
        .from("quiz_questions")
        .select("id")
        .eq("quiz_id", quiz.id);

      if (questionsError) {
        console.error("Error fetching quiz questions:", questionsError);
        continue;
      }

      const questionCount = questions?.length || 0;
      // Estimate time based on question count (2 minutes per question)
      const estimatedMinutes = questionCount * 2;

      quizzesWithInfo.push({
        ...quiz,
        question_count: questionCount,
        estimated_time: `${estimatedMinutes} minutes`,
      });
    }

    return quizzesWithInfo;
  },

  // Get all quizzes
  async getAllQuizzes(): Promise<QuizWithInfo[]> {
    const supabase = getSupabaseClient();

    // Get quizzes
    const { data: quizzes, error: quizzesError } = await supabase
      .from("quizzes")
      .select("*");

    if (quizzesError) {
      console.error("Error fetching quizzes:", quizzesError);
      return [];
    }

    if (!quizzes || quizzes.length === 0) {
      return [];
    }

    // For each quiz, get the question count
    const quizzesWithInfo: QuizWithInfo[] = [];

    for (const quiz of quizzes) {
      const { data: questions, error: questionsError } = await supabase
        .from("quiz_questions")
        .select("id")
        .eq("quiz_id", quiz.id);

      if (questionsError) {
        console.error("Error fetching quiz questions:", questionsError);
        continue;
      }

      const questionCount = questions?.length || 0;
      // Estimate time based on question count (2 minutes per question)
      const estimatedMinutes = questionCount * 2;

      quizzesWithInfo.push({
        ...quiz,
        question_count: questionCount,
        estimated_time: `${estimatedMinutes} minutes`,
      });
    }

    return quizzesWithInfo;
  },

  // Get chat history for a user
  async getChatHistory(userId: string): Promise<any[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("chat_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching chat history:", error);
      return [];
    }

    return data || [];
  },

  // Get chat messages for a chat
  async getChatMessages(chatId: string): Promise<any[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at");

    if (error) {
      console.error("Error fetching chat messages:", error);
      return [];
    }

    return data || [];
  },

  // Create a new subject
  async createSubject(
    subjectData: CreateSubjectData
  ): Promise<SubjectWithIcon | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("subjects")
      .insert({
        name: subjectData.name,
        description: subjectData.description,
        icon: subjectData.icon,
        color: subjectData.color,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating subject:", error);
      return null;
    }

    return data;
  },

  // Create a new course
  async createCourse(
    courseData: CreateCourseData
  ): Promise<CourseWithProgress | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("courses")
      .insert({
        subject_id: courseData.subject_id,
        title: courseData.title,
        description: courseData.description,
        difficulty: courseData.difficulty || "Beginner",
        image_url: courseData.image_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating course:", error);
      return null;
    }

    return data;
  },

  // Create a new lesson
  async createLesson(lessonData: CreateLessonData): Promise<any | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("lessons")
      .insert({
        course_id: lessonData.course_id,
        title: lessonData.title,
        content: lessonData.content,
        order_index: lessonData.order_index,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating lesson:", error);
      return null;
    }

    return data;
  },

  // Create a new quiz
  async createQuiz(quizData: CreateQuizData): Promise<any | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("quizzes")
      .insert({
        subject_id: quizData.subject_id,
        title: quizData.title,
        description: quizData.description,
        difficulty: quizData.difficulty || "Beginner",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating quiz:", error);
      return null;
    }

    return data;
  },

  // Create a new quiz question with answers
  async createQuizQuestion(
    questionInput: CreateQuizQuestionData
  ): Promise<any | null> {
    const supabase = getSupabaseClient();

    // Start a transaction by using a single batch operation
    // First, create the question
    const { data: questionData, error: questionError } = await supabase
      .from("quiz_questions")
      .insert({
        quiz_id: questionInput.quiz_id,
        question: questionInput.question,
        explanation: questionInput.explanation || "",
        order_index: questionInput.order_index,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (questionError) {
      console.error("Error creating quiz question:", questionError);
      return null;
    }

    // Then, create the answers for this question
    const answersToInsert = questionInput.answers.map((answer) => ({
      question_id: questionData.id,
      answer: answer.answer,
      is_correct: answer.is_correct,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data: answersData, error: answersError } = await supabase
      .from("quiz_answers")
      .insert(answersToInsert)
      .select();

    if (answersError) {
      console.error("Error creating quiz answers:", answersError);
      // Note: In a real transaction, we would roll back the question creation here
      return null;
    }

    return {
      ...questionData,
      answers: answersData,
    };
  },

  // Create a new chat history
  async createChatHistory(
    chatData: CreateChatHistoryData
  ): Promise<any | null> {
    try {
      const supabase = getSupabaseClient();

      // Check if Supabase client is properly initialized
      if (!supabase) {
        console.error("Supabase client is not initialized");
        return null;
      }

      // Log the chat data (without sensitive info)
      console.log("Creating chat history with data:", {
        title: chatData.title,
        has_subject_id: !!chatData.subject_id,
        has_user_id: !!chatData.user_id,
      });

      // Prepare the data to insert
      const insertData = {
        user_id: chatData.user_id,
        title: chatData.title,
        subject_id: chatData.subject_id || null, // Make sure it's null if undefined
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Attempt to insert the chat history
      const { data, error } = await supabase
        .from("chat_history")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("Error creating chat history:", error);

        // Don't use fallback in production as it causes UUID validation errors
        // Instead, try to create the chat history directly in the database
        console.error("Error details:", JSON.stringify(error));
        return null;
      }

      console.log("Chat history created successfully:", data?.id);
      return data;
    } catch (err) {
      console.error("Exception in createChatHistory:", err);
      return null;
    }
  },

  // Create a new chat message
  async createChatMessage(
    messageData: CreateChatMessageData
  ): Promise<any | null> {
    try {
      const supabase = getSupabaseClient();

      // Check if Supabase client is properly initialized
      if (!supabase) {
        console.error("Supabase client is not initialized");
        return null;
      }

      // Log the message data (without full content for privacy)
      console.log("Creating chat message with data:", {
        chat_id: messageData.chat_id,
        role: messageData.role,
        content_length: messageData.content?.length || 0,
      });

      // Check if chat_id is a fallback ID (for development mode)
      if (messageData.chat_id?.startsWith("fallback-")) {
        console.error(
          "Cannot use fallback chat_id with Supabase - UUID validation will fail"
        );
        return null;
      }

      // Attempt to insert the chat message
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          chat_id: messageData.chat_id,
          role: messageData.role,
          content: messageData.content,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating chat message:", error);

        // Don't use fallback in production as it causes UUID validation errors
        console.error("Error details:", JSON.stringify(error));

        return null;
      }

      console.log("Chat message created successfully:", data?.id);
      return data;
    } catch (err) {
      console.error("Exception in createChatMessage:", err);
      return null;
    }
  },
};

// Server-side data fetching functions
export const serverDataService = {
  // Get all subjects
  async getSubjects(): Promise<SubjectWithIcon[]> {
    try {
      const supabase = createSupabaseAdmin();

      // Check if Supabase client is properly initialized
      if (!supabase) {
        console.error("Supabase admin client is not initialized");
        console.log("Using fallback subjects data (server)");
        return fallbackSubjects;
      }

      // Attempt to fetch subjects
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("name"); // Try ordering by name instead of title

      if (error) {
        console.error("Error fetching subjects (server):", error);
        console.log("Using fallback subjects data due to error (server)");
        return fallbackSubjects;
      }

      if (!data || data.length === 0) {
        console.log(
          "No subjects found in database, using fallback data (server)"
        );
        return fallbackSubjects;
      }

      console.log("Subjects fetched successfully (server):", data.length);
      return data;
    } catch (err) {
      console.error("Exception in getSubjects (server):", err);
      console.log("Using fallback subjects data due to exception (server)");
      return fallbackSubjects;
    }
  },

  // Get user's progress
  async getUserProgress(auth0UserId: string) {
    const supabaseUuid = auth0IdToUuid(auth0UserId);
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", supabaseUuid);

    if (error) {
      console.error("Error fetching user progress:", error);
      return [];
    }

    return data || [];
  },
};
