import { getSupabaseClient } from "./supabase-client";
import { auth0IdToUuid } from "./auth0-utils";
import { sessionService } from "./session-service";
import { historyService } from "./history-service";
import { userService } from "./user-service";

// Achievement interface
export interface Achievement {
  id: string;
  user_id: string;
  name: string;
  description: string;
  progress: number;
  completed: boolean;
  completed_at?: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

// Achievement definitions
export const ACHIEVEMENTS = {
  // Time-based achievements
  EARLY_BIRD: {
    name: "Early Bird",
    description: "Log in before 7am",
    icon: "Sunrise",
    category: "time",
  },
  NIGHT_OWL: {
    name: "Night Owl",
    description: "Study after 10pm for 3 days",
    icon: "Moon",
    category: "time",
  },
  WEEKEND_WARRIOR: {
    name: "Weekend Warrior",
    description: "Study for 3 hours on a weekend",
    icon: "Dumbbell",
    category: "time",
  },
  LUNCH_BREAK_LEARNER: {
    name: "Lunch Break Learner",
    description: "Study between 12pm and 1pm for 5 days",
    icon: "Utensils",
    category: "time",
  },

  // Consistency achievements
  CONSISTENT_LEARNER: {
    name: "Consistent Learner",
    description: "Study for 7 days in a row",
    icon: "Calendar",
    category: "consistency",
  },
  MONTHLY_MASTER: {
    name: "Monthly Master",
    description: "Study for 20 days in a month",
    icon: "CalendarDays",
    category: "consistency",
  },
  QUARTERLY_QUEST: {
    name: "Quarterly Quest",
    description: "Complete 50 study sessions in 3 months",
    icon: "CalendarRange",
    category: "consistency",
  },
  COMEBACK_KID: {
    name: "Comeback Kid",
    description: "Return after 14+ days of inactivity",
    icon: "Undo2",
    category: "consistency",
  },

  // Topic achievements
  TOPIC_STARTER: {
    name: "Topic Starter",
    description: "Learn your first 10 topics",
    icon: "Flag",
    category: "topics",
  },
  TOPIC_EXPLORER: {
    name: "Topic Explorer",
    description: "Learn 50 different topics",
    icon: "Compass",
    category: "topics",
  },
  TOPIC_MASTER: {
    name: "Topic Master",
    description: "Learn 100 different topics",
    icon: "BookOpen",
    category: "topics",
  },
  SUBJECT_SPECIALIST: {
    name: "Subject Specialist",
    description: "Complete all topics in a subject",
    icon: "GraduationCap",
    category: "topics",
  },

  // Quiz achievements
  QUIZ_TAKER: {
    name: "Quiz Taker",
    description: "Complete your first quiz",
    icon: "ListChecks",
    category: "quizzes",
  },
  QUIZ_WHIZ: {
    name: "Quiz Whiz",
    description: "Score 80%+ on 10 quizzes",
    icon: "Zap",
    category: "quizzes",
  },
  QUIZ_CHAMPION: {
    name: "Quiz Champion",
    description: "Score 100% on 5 quizzes",
    icon: "CheckCircle2",
    category: "quizzes",
  },
  SPEED_DEMON: {
    name: "Speed Demon",
    description: "Complete a quiz in under 2 minutes with 90%+ score",
    icon: "Timer",
    category: "quizzes",
  },

  // Study achievements
  STUDY_SPRINT: {
    name: "Study Sprint",
    description: "Study for 2 hours without breaks",
    icon: "Gauge",
    category: "study",
  },
  STUDY_MARATHON: {
    name: "Study Marathon",
    description: "Study for 5 hours in a single day",
    icon: "Clock",
    category: "study",
  },
  KNOWLEDGE_SEEKER: {
    name: "Knowledge Seeker",
    description: "Spend 50 total hours studying",
    icon: "Lightbulb",
    category: "study",
  },
  GRAND_MASTER: {
    name: "Grand Master",
    description: "Unlock 15 other achievements",
    icon: "Award",
    category: "meta",
  },
};

// Achievement service for managing user achievements
export const achievementService = {
  // Get all achievements for a user
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      // Get the Supabase UUID for this user
      const supabaseUuid = await userService.getSupabaseUuid(userId);
      console.log(`Using Supabase UUID: ${supabaseUuid}`);

      const supabase = getSupabaseClient();

      // First, ensure all achievements exist for this user
      await this.ensureAllAchievementsExist(userId);

      const { data, error } = await supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", supabaseUuid)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching achievements:", error);
        console.error("Error details:", JSON.stringify(error));
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getUserAchievements:", error);
      return [];
    }
  },

  // Ensure all achievements exist for a user
  async ensureAllAchievementsExist(userId: string): Promise<void> {
    try {
      console.log(`Ensuring all achievements exist for user: ${userId}`);

      // Get the Supabase UUID for this user
      const supabaseUuid = await userService.getSupabaseUuid(userId);
      console.log(`Using Supabase UUID: ${supabaseUuid}`);

      const supabase = getSupabaseClient();

      // Get existing achievements for the user
      const { data: existingAchievements, error: fetchError } = await supabase
        .from("user_achievements")
        .select("name")
        .eq("user_id", supabaseUuid);

      if (fetchError) {
        console.error("Error fetching existing achievements:", fetchError);
        console.error("Error details:", JSON.stringify(fetchError));
        return;
      }

      // Create a set of existing achievement names
      const existingNames = new Set(
        (existingAchievements || []).map((a) => a.name)
      );

      console.log(`Found ${existingNames.size} existing achievements`);

      // Create any missing achievements
      const achievementsToCreate = [];
      const now = new Date().toISOString();

      for (const key in ACHIEVEMENTS) {
        const achievement = ACHIEVEMENTS[key];
        if (!existingNames.has(achievement.name)) {
          achievementsToCreate.push({
            user_id: supabaseUuid,
            name: achievement.name,
            description: achievement.description,
            progress: 0,
            completed: false,
            icon: achievement.icon,
            created_at: now,
            updated_at: now,
          });
        }
      }

      // Insert missing achievements if any
      if (achievementsToCreate.length > 0) {
        console.log(
          `Creating ${achievementsToCreate.length} missing achievements for user`
        );

        // Insert achievements one by one to avoid potential issues
        for (const achievement of achievementsToCreate) {
          try {
            console.log(`Creating achievement: ${achievement.name}`);
            const { error: insertError } = await supabase
              .from("user_achievements")
              .insert(achievement);

            if (insertError) {
              console.error(
                `Error creating achievement ${achievement.name}:`,
                insertError
              );
              console.error("Error details:", JSON.stringify(insertError));
            } else {
              console.log(
                `Successfully created achievement: ${achievement.name}`
              );
            }
          } catch (error) {
            console.error(
              `Exception creating achievement ${achievement.name}:`,
              error
            );
          }
        }
      } else {
        console.log("All achievements already exist for this user");
      }
    } catch (error) {
      console.error("Error in ensureAllAchievementsExist:", error);
    }
  },

  // Create or update an achievement
  async updateAchievement(
    userId: string,
    achievementData: {
      name: string;
      description: string;
      progress: number;
      completed?: boolean;
      icon: string;
    }
  ): Promise<{ achievement: Achievement | null; newlyCompleted: boolean }> {
    try {
      console.log(
        `Updating achievement for user ${userId}: ${achievementData.name}`
      );

      // Get the Supabase UUID for this user
      const supabaseUuid = await userService.getSupabaseUuid(userId);
      console.log(`Using Supabase UUID: ${supabaseUuid}`);

      const supabase = getSupabaseClient();

      // Check if the achievement already exists
      console.log(`Checking if achievement exists: ${achievementData.name}`);
      const { data: existingAchievement, error: fetchError } = await supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", supabaseUuid)
        .eq("name", achievementData.name)
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching achievement:", fetchError);
        console.error("Error details:", JSON.stringify(fetchError));
        return { achievement: null, newlyCompleted: false };
      }

      // Determine if achievement is completed
      const isCompleted =
        achievementData.completed || achievementData.progress >= 100;
      const completedAt = isCompleted ? new Date().toISOString() : null;
      let newlyCompleted = false;

      if (existingAchievement) {
        console.log(`Achievement exists: ${achievementData.name}`);
        // Check if this achievement is being newly completed
        if (isCompleted && !existingAchievement.completed) {
          newlyCompleted = true;
          console.log(`Achievement newly completed: ${achievementData.name}`);
        }

        // Only update if not already completed or progress has increased
        if (
          !existingAchievement.completed ||
          achievementData.progress > existingAchievement.progress
        ) {
          console.log(`Updating achievement: ${achievementData.name}`);
          const { data: updatedAchievement, error: updateError } =
            await supabase
              .from("user_achievements")
              .update({
                progress: achievementData.progress,
                completed: isCompleted,
                completed_at: isCompleted
                  ? completedAt
                  : existingAchievement.completed_at,
                updated_at: new Date().toISOString(),
              })
              .eq("id", existingAchievement.id)
              .select()
              .single();

          if (updateError) {
            console.error("Error updating achievement:", updateError);
            console.error("Error details:", JSON.stringify(updateError));
            return { achievement: null, newlyCompleted: false };
          }

          console.log(
            `Achievement updated successfully: ${achievementData.name}`
          );
          return { achievement: updatedAchievement, newlyCompleted };
        }
        return { achievement: existingAchievement, newlyCompleted: false };
      } else {
        // Create new achievement
        console.log(`Creating new achievement: ${achievementData.name}`);
        try {
          // Now create the achievement
          const { data: newAchievement, error: insertError } = await supabase
            .from("user_achievements")
            .insert({
              user_id: supabaseUuid,
              name: achievementData.name,
              description: achievementData.description,
              progress: achievementData.progress,
              completed: isCompleted,
              completed_at: completedAt,
              icon: achievementData.icon,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (insertError) {
            console.error("Error creating achievement:", insertError);
            console.error("Error details:", JSON.stringify(insertError));
            return { achievement: null, newlyCompleted: false };
          }

          console.log(
            `Achievement created successfully: ${achievementData.name}`
          );

          // If the new achievement is already completed, mark as newly completed
          if (isCompleted) {
            newlyCompleted = true;
            console.log(`New achievement completed: ${achievementData.name}`);
          }

          return { achievement: newAchievement, newlyCompleted };
        } catch (insertError) {
          console.error("Exception creating achievement:", insertError);
          return { achievement: null, newlyCompleted: false };
        }
      }
    } catch (error) {
      console.error("Error in updateAchievement:", error);
      return { achievement: null, newlyCompleted: false };
    }
  },

  // Check and update all achievements for a user
  async checkAndUpdateAchievements(
    userId: string
  ): Promise<{ newlyCompletedAchievements: Achievement[] }> {
    try {
      console.log(
        `[achievement-service] Checking achievements for user: ${userId}`
      );

      const newlyCompletedAchievements: Achievement[] = [];

      // Check Early Bird achievement
      console.log(`[achievement-service] Checking Early Bird achievement`);
      const isEarlyBird = await sessionService.checkEarlyLogin(userId);
      console.log(
        `[achievement-service] Early Bird check result: ${isEarlyBird}`
      );

      if (isEarlyBird) {
        console.log(
          `[achievement-service] Updating Early Bird achievement to completed`
        );
        const { achievement, newlyCompleted } = await this.updateAchievement(
          userId,
          {
            ...ACHIEVEMENTS.EARLY_BIRD,
            progress: 100,
            completed: true,
          }
        );

        if (newlyCompleted && achievement) {
          newlyCompletedAchievements.push(achievement);
        }
      }

      // Check Consistent Learner achievement
      const { streak } = await historyService.getUserProgressData(userId);
      const streakProgress = Math.min(Math.round((streak / 7) * 100), 100);
      const {
        achievement: consistentAchievement,
        newlyCompleted: consistentNewlyCompleted,
      } = await this.updateAchievement(userId, {
        ...ACHIEVEMENTS.CONSISTENT_LEARNER,
        progress: streakProgress,
        completed: streak >= 7,
      });

      if (consistentNewlyCompleted && consistentAchievement) {
        newlyCompletedAchievements.push(consistentAchievement);
      }

      // Check Topic achievements
      const { recent } = await historyService.getUserHistory(userId);
      const chatCount = recent.filter(
        (entry) => entry.activity_type === "chat"
      ).length;

      // Topic Starter (10 topics)
      const starterProgress = Math.min(Math.round((chatCount / 10) * 100), 100);
      const {
        achievement: starterAchievement,
        newlyCompleted: starterNewlyCompleted,
      } = await this.updateAchievement(userId, {
        ...ACHIEVEMENTS.TOPIC_STARTER,
        progress: starterProgress,
        completed: chatCount >= 10,
      });

      if (starterNewlyCompleted && starterAchievement) {
        newlyCompletedAchievements.push(starterAchievement);
      }

      // Topic Explorer (50 topics)
      const explorerProgress = Math.min(
        Math.round((chatCount / 50) * 100),
        100
      );
      const {
        achievement: explorerAchievement,
        newlyCompleted: explorerNewlyCompleted,
      } = await this.updateAchievement(userId, {
        ...ACHIEVEMENTS.TOPIC_EXPLORER,
        progress: explorerProgress,
        completed: chatCount >= 50,
      });

      if (explorerNewlyCompleted && explorerAchievement) {
        newlyCompletedAchievements.push(explorerAchievement);
      }

      // Topic Master (100 topics)
      const masterProgress = Math.min(Math.round((chatCount / 100) * 100), 100);
      const {
        achievement: masterAchievement,
        newlyCompleted: masterNewlyCompleted,
      } = await this.updateAchievement(userId, {
        ...ACHIEVEMENTS.TOPIC_MASTER,
        progress: masterProgress,
        completed: chatCount >= 100,
      });

      if (masterNewlyCompleted && masterAchievement) {
        newlyCompletedAchievements.push(masterAchievement);
      }

      // Check Quiz achievements
      const quizzes = recent.filter((entry) => entry.activity_type === "quiz");
      const perfectQuizzes = recent.filter(
        (entry) => entry.activity_type === "quiz" && entry.score === 100
      ).length;

      // Quiz Taker (first quiz)
      const {
        achievement: takerAchievement,
        newlyCompleted: takerNewlyCompleted,
      } = await this.updateAchievement(userId, {
        ...ACHIEVEMENTS.QUIZ_TAKER,
        progress: quizzes.length > 0 ? 100 : 0,
        completed: quizzes.length > 0,
      });

      if (takerNewlyCompleted && takerAchievement) {
        newlyCompletedAchievements.push(takerAchievement);
      }

      // Quiz Champion (5 perfect quizzes)
      const championProgress = Math.min(
        Math.round((perfectQuizzes / 5) * 100),
        100
      );
      const {
        achievement: championAchievement,
        newlyCompleted: championNewlyCompleted,
      } = await this.updateAchievement(userId, {
        ...ACHIEVEMENTS.QUIZ_CHAMPION,
        progress: championProgress,
        completed: perfectQuizzes >= 5,
      });

      if (championNewlyCompleted && championAchievement) {
        newlyCompletedAchievements.push(championAchievement);
      }

      // Check Study Marathon achievement
      const weeklyStudyTime = await sessionService.getWeeklyStudyTime(userId);
      const studyHours = weeklyStudyTime / 60;

      // Study Marathon (5 hours in a day)
      const marathonProgress = Math.min(
        Math.round((studyHours / 5) * 100),
        100
      );
      const {
        achievement: marathonAchievement,
        newlyCompleted: marathonNewlyCompleted,
      } = await this.updateAchievement(userId, {
        ...ACHIEVEMENTS.STUDY_MARATHON,
        progress: marathonProgress,
        completed: studyHours >= 5,
      });

      if (marathonNewlyCompleted && marathonAchievement) {
        newlyCompletedAchievements.push(marathonAchievement);
      }

      // Check Grand Master achievement (15 other achievements)
      const { data: allAchievements, error: achievementsError } =
        await getSupabaseClient()
          .from("user_achievements")
          .select("*")
          .eq("user_id", auth0IdToUuid(userId))
          .eq("completed", true);

      if (!achievementsError) {
        const completedCount = (allAchievements || []).length;
        const grandMasterProgress = Math.min(
          Math.round((completedCount / 15) * 100),
          100
        );

        const {
          achievement: grandMasterAchievement,
          newlyCompleted: grandMasterNewlyCompleted,
        } = await this.updateAchievement(userId, {
          ...ACHIEVEMENTS.GRAND_MASTER,
          progress: grandMasterProgress,
          completed: completedCount >= 15,
        });

        if (grandMasterNewlyCompleted && grandMasterAchievement) {
          newlyCompletedAchievements.push(grandMasterAchievement);
        }
      }

      return { newlyCompletedAchievements };
    } catch (error) {
      console.error("Error in checkAndUpdateAchievements:", error);
      return { newlyCompletedAchievements: [] };
    }
  },
};
