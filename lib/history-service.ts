import { getSupabaseClient } from "./supabase-client";
import { auth0IdToUuid } from "./auth0-utils";
import { Database } from "@/types/supabase";
import { sessionService } from "./session-service";

// User history entry with additional UI properties
export interface HistoryEntry {
  id: string;
  user_id: string;
  activity_type: string;
  activity_id?: string;
  title: string;
  description?: string;
  category?: string;
  completed?: boolean;
  score?: number;
  created_at: string;
  icon?: any; // For client-side icon component
}

// User achievement with additional UI properties
export interface Achievement {
  id: string;
  user_id: string;
  name: string;
  description: string;
  progress: number;
  completed: boolean;
  completed_at?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

// Progress data for charts and UI
export interface ProgressData {
  weeklyProgress: {
    day: string;
    minutes: number;
    topics: number;
  }[];
  subjectProgress: {
    subject: string;
    progress: number;
    color: string;
  }[];
  recentTopics: {
    id: string;
    name: string;
    subject: string;
    progress: number;
    icon?: any;
    lastStudied: string;
  }[];
  stats: {
    studyTime: string;
    topicsCovered: number;
    quizScore: string;
    streak: number;
  };
}

// Client-side history and progress data service
export const historyService = {
  // Get user's learning history
  async getUserHistory(userId: string): Promise<{
    recent: HistoryEntry[];
    quizzes: HistoryEntry[];
  }> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();

      // Get all history entries
      const { data, error } = await supabase
        .from("user_history")
        .select("*")
        .eq("user_id", supabaseUuid)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user history:", error);
        return { recent: [], quizzes: [] };
      }

      // Separate into recent activities and quizzes
      const recent = data || [];
      const quizzes = (data || []).filter(
        (entry) => entry.activity_type === "quiz"
      );

      return { recent, quizzes };
    } catch (error) {
      console.error("Error in getUserHistory:", error);
      return { recent: [], quizzes: [] };
    }
  },

  // Add a history entry
  async addHistoryEntry(
    userId: string,
    data: {
      activity_type: string;
      activity_id?: string;
      title: string;
      description?: string;
      category?: string;
      completed?: boolean;
      score?: number;
    }
  ): Promise<boolean> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();

      const { error } = await supabase.from("user_history").insert({
        user_id: supabaseUuid,
        activity_type: data.activity_type,
        activity_id: data.activity_id || null,
        title: data.title,
        description: data.description || "",
        category: data.category || "",
        completed: data.completed || false,
        score: data.score || null,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error adding history entry:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in addHistoryEntry:", error);
      return false;
    }
  },

  // Get user's achievements
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", supabaseUuid)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user achievements:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getUserAchievements:", error);
      return [];
    }
  },

  // Add or update an achievement
  async updateAchievement(
    userId: string,
    data: {
      id?: string; // If updating existing
      name: string;
      description: string;
      progress: number;
      completed?: boolean;
      icon?: string;
    }
  ): Promise<Achievement | null> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();

      // Check if completed based on progress
      const isCompleted = data.completed || data.progress >= 100;
      const completedAt = isCompleted ? new Date().toISOString() : null;

      if (data.id) {
        // Update existing achievement
        const { data: updatedAchievement, error } = await supabase
          .from("user_achievements")
          .update({
            name: data.name,
            description: data.description,
            progress: data.progress,
            completed: isCompleted,
            completed_at: completedAt,
            icon: data.icon,
            updated_at: new Date().toISOString(),
          })
          .eq("id", data.id)
          .eq("user_id", supabaseUuid)
          .select()
          .single();

        if (error) {
          console.error("Error updating achievement:", error);
          return null;
        }

        return updatedAchievement;
      } else {
        // Create new achievement
        const { data: newAchievement, error } = await supabase
          .from("user_achievements")
          .insert({
            user_id: supabaseUuid,
            name: data.name,
            description: data.description,
            progress: data.progress,
            completed: isCompleted,
            completed_at: completedAt,
            icon: data.icon || "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating achievement:", error);
          return null;
        }

        // If achievement was completed, add to history
        if (isCompleted) {
          await this.addHistoryEntry(userId, {
            activity_type: "achievement",
            title: `Earned achievement: ${data.name}`,
            description: data.description,
            category: "Achievements",
            completed: true,
          });
        }

        return newAchievement;
      }
    } catch (error) {
      console.error("Error in updateAchievement:", error);
      return null;
    }
  },

  // Get user's progress data for dashboard
  async getUserProgressData(userId: string): Promise<ProgressData> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();

      // Get user's history for the past week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: recentHistory, error: historyError } = await supabase
        .from("user_history")
        .select("*")
        .eq("user_id", supabaseUuid)
        .gte("created_at", oneWeekAgo.toISOString())
        .order("created_at", { ascending: false });

      if (historyError) {
        console.error("Error fetching recent history:", historyError);
      }

      // Get user's progress on lessons - with error handling for missing tables or relationships
      let lessonProgress = [];
      try {
        const { data, error } = await supabase
          .from("user_progress")
          .select(
            `
            *,
            lessons!inner(
              title,
              courses!inner(
                title,
                subjects!inner(
                  name
                )
              )
            )
          `
          )
          .eq("user_id", supabaseUuid)
          .order("last_accessed", { ascending: false });

        if (error) {
          console.error("Error fetching lesson progress:", error);
        } else {
          lessonProgress = data || [];
        }
      } catch (error) {
        console.error("Exception fetching lesson progress:", error);
      }

      // Get user's quiz attempts - with error handling
      let quizAttempts = [];
      try {
        const { data, error } = await supabase
          .from("user_quiz_attempts")
          .select("*")
          .eq("user_id", supabaseUuid)
          .order("completed_at", { ascending: false });

        if (error) {
          console.error("Error fetching quiz attempts:", error);
        } else {
          quizAttempts = data || [];
        }
      } catch (error) {
        console.error("Exception fetching quiz attempts:", error);
      }

      // Get chat history count - with error handling
      let chatHistory = [];
      try {
        const { data, error } = await supabase
          .from("chat_history")
          .select("id")
          .eq("user_id", supabaseUuid);

        if (error) {
          console.error("Error fetching chat history:", error);
        } else {
          chatHistory = data || [];
        }
      } catch (error) {
        console.error("Exception fetching chat history:", error);
      }

      // Calculate weekly progress
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weeklyProgress = days.map((day) => ({
        day,
        minutes: 0,
        topics: 0,
      }));

      // Fill in data from history
      (recentHistory || []).forEach((entry) => {
        const date = new Date(entry.created_at);
        const dayIndex = date.getDay();

        // Estimate minutes based on activity type
        let minutes = 0;
        if (entry.activity_type === "lesson") minutes = 15;
        else if (entry.activity_type === "quiz") minutes = 10;

        weeklyProgress[dayIndex].minutes += minutes;
        weeklyProgress[dayIndex].topics += 1;
      });

      // Calculate subject progress
      const subjectProgressMap = new Map<
        string,
        { count: number; completed: number; color: string }
      >();
      const colors = [
        "#7c3aed",
        "#3b82f6",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#ec4899",
      ];

      // Process lesson progress
      (lessonProgress || []).forEach((progress, index) => {
        const subject = progress.lessons?.courses?.subjects?.name;
        if (!subject) return;

        if (!subjectProgressMap.has(subject)) {
          subjectProgressMap.set(subject, {
            count: 0,
            completed: 0,
            color: colors[subjectProgressMap.size % colors.length],
          });
        }

        const subjectData = subjectProgressMap.get(subject)!;
        subjectData.count++;
        if (progress.completed) {
          subjectData.completed++;
        }
      });

      const subjectProgress = Array.from(subjectProgressMap.entries()).map(
        ([subject, data]) => ({
          subject,
          progress:
            data.count > 0
              ? Math.round((data.completed / data.count) * 100)
              : 0,
          color: data.color,
        })
      );

      // Calculate recent topics
      const recentTopics = (lessonProgress || [])
        .slice(0, 4)
        .map((progress) => {
          const subject =
            progress.lessons?.courses?.subjects?.name || "Unknown";
          const lessonTitle = progress.lessons?.title || "Unknown Lesson";

          // Calculate time since last accessed
          const lastAccessed = new Date(progress.last_accessed);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - lastAccessed.getTime());
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          let lastStudied = "";
          if (diffDays === 0) {
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            if (diffHours === 0) {
              lastStudied = "Just now";
            } else {
              lastStudied = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
            }
          } else if (diffDays === 1) {
            lastStudied = "Yesterday";
          } else if (diffDays < 7) {
            lastStudied = `${diffDays} days ago`;
          } else {
            lastStudied = `${Math.floor(diffDays / 7)} week${
              Math.floor(diffDays / 7) > 1 ? "s" : ""
            } ago`;
          }

          return {
            id: progress.lesson_id,
            name: lessonTitle,
            subject,
            progress: progress.completed
              ? 100
              : Math.floor(Math.random() * 80) + 10, // Random progress if not completed
            lastStudied,
          };
        });

      // Get study time from sessions
      const weeklyStudyMinutes = await sessionService.getWeeklyStudyTime(
        userId
      );
      const studyHours = Math.floor(weeklyStudyMinutes / 60);
      const studyMinutes = weeklyStudyMinutes % 60;

      // Calculate average quiz score
      let avgScore = 0;
      if (quizAttempts && quizAttempts.length > 0) {
        avgScore =
          quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) /
          quizAttempts.length;
      }

      // Calculate streak (simplified)
      const streak = calculateStreak(recentHistory || []);

      return {
        weeklyProgress,
        subjectProgress,
        recentTopics,
        stats: {
          studyTime: `${studyHours}.${Math.floor(studyMinutes / 6)} hours`,
          topicsCovered: chatHistory?.length || 0,
          quizScore: `${Math.round(avgScore)}%`,
          streak,
        },
      };
    } catch (error) {
      console.error("Error in getUserProgressData:", error);

      // Return default data structure with empty values
      return {
        weeklyProgress: [
          { day: "Mon", minutes: 0, topics: 0 },
          { day: "Tue", minutes: 0, topics: 0 },
          { day: "Wed", minutes: 0, topics: 0 },
          { day: "Thu", minutes: 0, topics: 0 },
          { day: "Fri", minutes: 0, topics: 0 },
          { day: "Sat", minutes: 0, topics: 0 },
          { day: "Sun", minutes: 0, topics: 0 },
        ],
        subjectProgress: [],
        recentTopics: [],
        stats: {
          studyTime: "0 hours",
          topicsCovered: 0,
          quizScore: "0%",
          streak: 0,
        },
      };
    }
  },
};

// Helper function to calculate streak
function calculateStreak(history: HistoryEntry[]): number {
  if (!history.length) return 0;

  // Sort by date (newest first)
  const sortedHistory = [...history].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Check if there's activity today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const latestActivity = new Date(sortedHistory[0].created_at);
  latestActivity.setHours(0, 0, 0, 0);

  // If no activity today, streak is 0
  if (latestActivity.getTime() < today.getTime()) {
    return 0;
  }

  // Count consecutive days with activity
  let streak = 1;
  let currentDate = today;

  // Group activities by day
  const activitiesByDay = new Map<string, boolean>();
  sortedHistory.forEach((entry) => {
    const date = new Date(entry.created_at);
    date.setHours(0, 0, 0, 0);
    activitiesByDay.set(date.toISOString(), true);
  });

  // Check previous days
  for (let i = 1; i <= 30; i++) {
    // Check up to 30 days back
    const prevDate = new Date(today);
    prevDate.setDate(today.getDate() - i);
    prevDate.setHours(0, 0, 0, 0);

    if (activitiesByDay.has(prevDate.toISOString())) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
