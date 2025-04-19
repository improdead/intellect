import { Achievement } from "./achievement-service";
import { ACHIEVEMENTS } from "./achievement-service";
import { historyService } from "./history-service";
import { sessionService } from "./session-service";

// Local storage keys
const ACHIEVEMENTS_KEY = "user_achievements";

// Safe localStorage wrapper for SSR
const storage = {
  getItem(key: string): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem(key: string, value: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
    }
  },
};

// Local achievement service for managing user achievements in browser storage
export const localAchievementService = {
  // Get all achievements for a user
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      console.log(`Getting achievements for user: ${userId}`);

      // First, ensure all achievements exist for this user
      await this.ensureAllAchievementsExist(userId);

      // Get achievements from local storage
      const achievementsJson = storage.getItem(`${ACHIEVEMENTS_KEY}_${userId}`);
      if (!achievementsJson) {
        return [];
      }

      const achievements = JSON.parse(achievementsJson);
      return achievements || [];
    } catch (error) {
      console.error("Error in getUserAchievements:", error);
      return [];
    }
  },

  // Ensure all achievements exist for a user
  async ensureAllAchievementsExist(userId: string): Promise<void> {
    try {
      console.log(`Ensuring all achievements exist for user: ${userId}`);

      // Get existing achievements from local storage
      const achievementsJson = storage.getItem(`${ACHIEVEMENTS_KEY}_${userId}`);
      const existingAchievements = achievementsJson
        ? JSON.parse(achievementsJson)
        : [];

      // Create a map of existing achievement names
      const existingNames = new Set(
        existingAchievements.map((a: Achievement) => a.name)
      );

      // Check if we need to add any achievements
      let needsUpdate = false;
      const now = new Date().toISOString();

      // Add any missing achievements
      for (const key in ACHIEVEMENTS) {
        const achievement = ACHIEVEMENTS[key];
        if (!existingNames.has(achievement.name)) {
          existingAchievements.push({
            id: this.generateUuid(),
            user_id: userId,
            name: achievement.name,
            description: achievement.description,
            progress: 0,
            completed: false,
            icon: achievement.icon,
            created_at: now,
            updated_at: now,
          });
          needsUpdate = true;
        }
      }

      // Save updated achievements to local storage if needed
      if (needsUpdate) {
        storage.setItem(
          `${ACHIEVEMENTS_KEY}_${userId}`,
          JSON.stringify(existingAchievements)
        );
        console.log(`Added missing achievements for user: ${userId}`);
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

      // Get existing achievements from local storage
      const achievementsJson = storage.getItem(`${ACHIEVEMENTS_KEY}_${userId}`);
      const achievements = achievementsJson ? JSON.parse(achievementsJson) : [];

      // Find the achievement to update
      const existingIndex = achievements.findIndex(
        (a: Achievement) => a.name === achievementData.name
      );

      // Determine if achievement is completed
      const isCompleted =
        achievementData.completed || achievementData.progress >= 100;
      const completedAt = isCompleted ? new Date().toISOString() : null;
      let newlyCompleted = false;

      if (existingIndex >= 0) {
        // Achievement exists, update it
        const existingAchievement = achievements[existingIndex];

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
          const updatedAchievement = {
            ...existingAchievement,
            progress: achievementData.progress,
            completed: isCompleted,
            completed_at: isCompleted
              ? completedAt
              : existingAchievement.completed_at,
            updated_at: new Date().toISOString(),
          };

          // Update the achievement in the array
          achievements[existingIndex] = updatedAchievement;

          // Save to local storage
          storage.setItem(
            `${ACHIEVEMENTS_KEY}_${userId}`,
            JSON.stringify(achievements)
          );

          console.log(
            `Achievement updated successfully: ${achievementData.name}`
          );
          return { achievement: updatedAchievement, newlyCompleted };
        }

        return { achievement: existingAchievement, newlyCompleted: false };
      } else {
        // Achievement doesn't exist, create it
        const newAchievement = {
          id: this.generateUuid(),
          user_id: userId,
          name: achievementData.name,
          description: achievementData.description,
          progress: achievementData.progress,
          completed: isCompleted,
          completed_at: completedAt,
          icon: achievementData.icon,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Add to achievements array
        achievements.push(newAchievement);

        // Save to local storage
        storage.setItem(
          `${ACHIEVEMENTS_KEY}_${userId}`,
          JSON.stringify(achievements)
        );

        // If the new achievement is already completed, mark as newly completed
        if (isCompleted) {
          newlyCompleted = true;
          console.log(`New achievement completed: ${achievementData.name}`);
        }

        console.log(
          `Achievement created successfully: ${achievementData.name}`
        );
        return { achievement: newAchievement, newlyCompleted };
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
      console.log(`Checking achievements for user: ${userId}`);

      const newlyCompletedAchievements: Achievement[] = [];

      // Check Early Bird achievement
      console.log(`Checking Early Bird achievement`);
      const isEarlyBird = await sessionService.checkEarlyLogin(userId);
      console.log(`Early Bird check result: ${isEarlyBird}`);

      if (isEarlyBird) {
        console.log(`Updating Early Bird achievement to completed`);
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
      const allAchievements = await this.getUserAchievements(userId);
      const completedCount = allAchievements.filter((a) => a.completed).length;
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

      return { newlyCompletedAchievements };
    } catch (error) {
      console.error("Error in checkAndUpdateAchievements:", error);
      return { newlyCompletedAchievements: [] };
    }
  },

  // Generate a UUID for new achievements
  generateUuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  },
};
