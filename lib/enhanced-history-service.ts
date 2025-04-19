import { getSupabaseClient } from "./supabase-client";
import { auth0IdToUuid } from "./auth0-utils";

// Enhanced history service with additional methods for achievement tracking
export const enhancedHistoryService = {
  // Get user history with real data from Supabase
  async getUserHistory(userId: string) {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();

      // Get user history from Supabase
      const { data: historyData, error: historyError } = await supabase
        .from("history")
        .select(
          `
          id,
          user_id,
          activity_type,
          topic_id,
          subject_id,
          score,
          duration,
          created_at,
          subjects(name, icon, color)
        `
        )
        .eq("user_id", supabaseUuid)
        .order("created_at", { ascending: false })
        .limit(50);

      if (historyError) {
        console.error("Error fetching user history:", historyError);
        return { recent: [], history: [] };
      }

      // Format the data
      const formattedHistory = (historyData || []).map((item) => ({
        id: item.id,
        activity_type: item.activity_type,
        topic_id: item.topic_id,
        subject_id: item.subject_id,
        subject: item.subjects?.name || "Unknown",
        icon: item.subjects?.icon || "BookOpen",
        color: item.subjects?.color || "blue",
        score: item.score,
        duration: item.duration,
        date: new Date(item.created_at).toLocaleDateString(),
        time: new Date(item.created_at).toLocaleTimeString(),
      }));

      return {
        recent: formattedHistory,
        history: formattedHistory,
      };
    } catch (error) {
      console.error("Error in getUserHistory:", error);
      return { recent: [], history: [] };
    }
  },

  // Get user progress data with real data from Supabase
  async getUserProgressData(userId: string) {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();

      // Default values in case tables don't exist
      let streak = 0;
      let totalHours = 0;
      let topicsLearned = 0;
      let quizzesTaken = 0;
      let averageScore = 0;

      try {
        // Get user sessions for streak calculation
        const { data: sessionData, error: sessionError } = await supabase
          .from("user_sessions")
          .select("login_time, duration")
          .eq("user_id", supabaseUuid)
          .order("login_time", { ascending: false });

        if (!sessionError && sessionData) {
          // Calculate streak
          streak = this.calculateStreak(sessionData);

          // Calculate total study time
          const totalMinutes = sessionData.reduce((total, session) => {
            return total + (session.duration || 0);
          }, 0);
          totalHours = Math.round(totalMinutes / 60);
        }
      } catch (error) {
        console.log("User sessions table might not exist:", error);
      }

      try {
        // Get history data for topics and quizzes
        const { data: historyData, error: historyError } = await supabase
          .from("history")
          .select("activity_type, topic_id, score")
          .eq("user_id", supabaseUuid);

        if (!historyError && historyData) {
          // Count unique topics
          const uniqueTopics = new Set();
          historyData.forEach((item) => {
            if (item.topic_id) {
              uniqueTopics.add(item.topic_id);
            }
          });
          topicsLearned = uniqueTopics.size;

          // Count quizzes and calculate average score
          const quizzes =
            historyData.filter((item) => item.activity_type === "quiz") || [];
          quizzesTaken = quizzes.length;
          const totalScore = quizzes.reduce(
            (total, quiz) => total + (quiz.score || 0),
            0
          );
          averageScore =
            quizzesTaken > 0 ? Math.round(totalScore / quizzesTaken) : 0;
        }
      } catch (error) {
        console.log("History table might not exist:", error);
      }

      // Return the progress data
      return {
        streak,
        totalHours,
        topicsLearned,
        quizzesTaken,
        averageScore,
      };
    } catch (error) {
      console.error("Error in getUserProgressData:", error);
      return {
        streak: 0,
        totalHours: 0,
        topicsLearned: 0,
        quizzesTaken: 0,
        averageScore: 0,
      };
    }
  },

  // Calculate streak from session data
  calculateStreak(sessions: any[]): number {
    if (!sessions || sessions.length === 0) {
      return 0;
    }

    // Group sessions by day
    const sessionsByDay = new Map();
    sessions.forEach((session) => {
      const date = new Date(session.login_time).toDateString();
      sessionsByDay.set(date, true);
    });

    // Convert to array of dates
    const dates = Array.from(sessionsByDay.keys()).map(
      (dateStr) => new Date(dateStr)
    );
    dates.sort((a, b) => b.getTime() - a.getTime()); // Sort descending

    // Calculate streak
    let streak = 1;
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    // Check if user studied today or yesterday
    if (
      dates[0].toDateString() !== today &&
      dates[0].toDateString() !== yesterdayStr
    ) {
      return 0; // Streak broken
    }

    // Count consecutive days
    for (let i = 1; i < dates.length; i++) {
      const currentDate = dates[i - 1];
      const prevDate = dates[i];

      // Check if dates are consecutive
      const diffTime = currentDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
      } else {
        break; // Streak broken
      }
    }

    return streak;
  },

  // Check if user has completed all topics in any subject
  async hasCompletedSubject(userId: string): Promise<boolean> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();

      // Get all subjects
      const { data: subjects, error: subjectsError } = await supabase
        .from("subjects")
        .select("id");

      if (subjectsError || !subjects || subjects.length === 0) {
        return false;
      }

      // For each subject, check if all topics are completed
      for (const subject of subjects) {
        // Get all topics for this subject
        const { data: topics, error: topicsError } = await supabase
          .from("topics")
          .select("id")
          .eq("subject_id", subject.id);

        if (topicsError || !topics || topics.length === 0) {
          continue;
        }

        // Get completed topics for this subject
        const { data: history, error: historyError } = await supabase
          .from("history")
          .select("topic_id")
          .eq("user_id", supabaseUuid)
          .eq("subject_id", subject.id);

        if (historyError) {
          continue;
        }

        // Count unique completed topics
        const completedTopics = new Set();
        history?.forEach((item) => {
          if (item.topic_id) {
            completedTopics.add(item.topic_id);
          }
        });

        // Check if all topics are completed
        if (completedTopics.size === topics.length) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error in hasCompletedSubject:", error);
      return false;
    }
  },

  // Get real-time progress data for the overview page
  async getOverviewData(userId: string) {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();

      // Default weekly progress data
      const weeklyProgress = [
        { day: "Sun", minutes: 0, topics: 0 },
        { day: "Mon", minutes: 0, topics: 0 },
        { day: "Tue", minutes: 0, topics: 0 },
        { day: "Wed", minutes: 0, topics: 0 },
        { day: "Thu", minutes: 0, topics: 0 },
        { day: "Fri", minutes: 0, topics: 0 },
        { day: "Sat", minutes: 0, topics: 0 },
      ];

      // Default subject progress data
      let subjectProgress = [
        { subject: "Math", progress: 0 },
        { subject: "Science", progress: 0 },
        { subject: "History", progress: 0 },
        { subject: "Language", progress: 0 },
      ];

      try {
        // Get weekly progress data
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        weekStart.setHours(0, 0, 0, 0);

        const { data: weeklyData, error: weeklyError } = await supabase
          .from("user_sessions")
          .select("login_time, duration")
          .eq("user_id", supabaseUuid)
          .gte("login_time", weekStart.toISOString());

        if (weeklyError) {
          console.log("User sessions table might not exist:", weeklyError);
        } else {
          // Update minutes studied
          weeklyData?.forEach((session) => {
            const date = new Date(session.login_time);
            const day = date.getDay(); // 0 = Sunday, 6 = Saturday
            weeklyProgress[day].minutes += session.duration || 0;
          });
        }

        try {
          // Count topics studied each day
          const { data: historyData, error: historyError } = await supabase
            .from("history")
            .select("created_at, topic_id")
            .eq("user_id", supabaseUuid)
            .gte("created_at", weekStart.toISOString());

          if (!historyError && historyData) {
            const topicsByDay = new Map();

            historyData.forEach((item) => {
              const date = new Date(item.created_at);
              const day = date.getDay(); // 0 = Sunday, 6 = Saturday

              if (item.topic_id) {
                if (!topicsByDay.has(day)) {
                  topicsByDay.set(day, new Set());
                }
                topicsByDay.get(day).add(item.topic_id);
              }
            });

            // Update topics count
            topicsByDay.forEach((topics, day) => {
              weeklyProgress[day].topics = topics.size;
            });
          }
        } catch (error) {
          console.log("History table might not exist:", error);
        }

        try {
          // Get subject progress data
          const { data: subjects, error: subjectsError } = await supabase
            .from("subjects")
            .select("id, name");

          if (!subjectsError && subjects && subjects.length > 0) {
            // Calculate progress for each subject
            subjectProgress = [];

            for (const subject of subjects) {
              try {
                // Get total topics for this subject
                const { data: topics, error: topicsError } = await supabase
                  .from("topics")
                  .select("id")
                  .eq("subject_id", subject.id);

                if (topicsError || !topics) {
                  subjectProgress.push({
                    subject: subject.name,
                    progress: 0,
                  });
                  continue;
                }

                try {
                  // Get completed topics for this subject
                  const { data: history, error: historyError } = await supabase
                    .from("history")
                    .select("topic_id")
                    .eq("user_id", supabaseUuid)
                    .eq("subject_id", subject.id);

                  if (historyError || !history) {
                    subjectProgress.push({
                      subject: subject.name,
                      progress: 0,
                    });
                    continue;
                  }

                  // Count unique completed topics
                  const completedTopics = new Set();
                  history.forEach((item) => {
                    if (item.topic_id) {
                      completedTopics.add(item.topic_id);
                    }
                  });

                  // Calculate progress percentage
                  const totalTopics = topics.length || 0;
                  const progress =
                    totalTopics > 0
                      ? Math.round((completedTopics.size / totalTopics) * 100)
                      : 0;

                  subjectProgress.push({
                    subject: subject.name,
                    progress,
                  });
                } catch (error) {
                  console.log("Error processing history for subject:", error);
                  subjectProgress.push({
                    subject: subject.name,
                    progress: 0,
                  });
                }
              } catch (error) {
                console.log("Error processing topics for subject:", error);
                subjectProgress.push({
                  subject: subject.name,
                  progress: 0,
                });
              }
            }
          }
        } catch (error) {
          console.log("Subjects table might not exist:", error);
        }
      } catch (error) {
        console.log("Error in getOverviewData:", error);
      }

      // Return the data, even if some parts failed
      return {
        weeklyProgress,
        subjectProgress,
      };
    } catch (error) {
      console.error("Error in getOverviewData:", error);
      // Return default data on error
      return {
        weeklyProgress: [
          { day: "Sun", minutes: 0, topics: 0 },
          { day: "Mon", minutes: 0, topics: 0 },
          { day: "Tue", minutes: 0, topics: 0 },
          { day: "Wed", minutes: 0, topics: 0 },
          { day: "Thu", minutes: 0, topics: 0 },
          { day: "Fri", minutes: 0, topics: 0 },
          { day: "Sat", minutes: 0, topics: 0 },
        ],
        subjectProgress: [
          { subject: "Math", progress: 0 },
          { subject: "Science", progress: 0 },
          { subject: "History", progress: 0 },
          { subject: "Language", progress: 0 },
        ],
      };
    }
  },
};
