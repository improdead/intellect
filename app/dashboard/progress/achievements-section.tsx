"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Trophy, Lock } from "lucide-react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { localAchievementService as achievementService } from "@/lib/local-achievement-service";
import { enhancedSessionService } from "@/lib/enhanced-session-service";
import { enhancedHistoryService } from "@/lib/enhanced-history-service";

// Import the achievement icons from the parent component
import { ACHIEVEMENT_ICONS } from "./achievement-icons";

export default function AchievementsSection() {
  const { user, isLoading: isUserLoading } = useUser();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAchievements() {
      if (user?.sub) {
        try {
          setIsLoading(true);

          // Check for new achievements
          try {
            const { newlyCompletedAchievements } =
              await achievementService.checkAndUpdateAchievements(user.sub);

            // Show toast notifications for newly completed achievements
            if (
              newlyCompletedAchievements &&
              newlyCompletedAchievements.length > 0
            ) {
              newlyCompletedAchievements.forEach((achievement) => {
                toast({
                  title: "Achievement Unlocked! 🏆",
                  description: `${achievement.name}: ${achievement.description}`,
                  duration: 5000,
                });
              });
            }
          } catch (error) {
            console.error("Error checking achievements:", error);
          }

          // Fetch all achievements
          const achievementsData = await achievementService.getUserAchievements(
            user.sub
          );
          setAchievements(achievementsData);
        } catch (error) {
          console.error("Error fetching achievements:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    if (user && !isUserLoading) {
      fetchAchievements();
    }
  }, [user, isUserLoading, toast]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-primary/10 animate-pulse">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="p-4 rounded-full bg-gray-200 dark:bg-gray-800 h-20 w-20"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {achievements.map((achievement) => (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            className={`border-primary/10 ${
              !achievement.completed ? "opacity-70" : ""
            }`}
          >
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div
                  className={`p-4 rounded-full ${
                    achievement.completed
                      ? "bg-primary/10"
                      : "bg-gray-200 dark:bg-gray-800"
                  } h-fit relative`}
                >
                  {achievement.completed ? (
                    ACHIEVEMENT_ICONS[achievement.name] || (
                      <Trophy className="h-10 w-10 text-amber-500" />
                    )
                  ) : (
                    <>
                      <div className="filter grayscale">
                        {ACHIEVEMENT_ICONS[achievement.name] || (
                          <Trophy className="h-10 w-10 text-gray-400" />
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-gray-200 dark:bg-gray-700 rounded-full p-1">
                        <Lock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </div>
                    </>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{achievement.name}</h3>
                    <Badge
                      variant={achievement.completed ? "default" : "outline"}
                    >
                      {achievement.completed ? "Completed" : "In Progress"}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground/70 mb-4">
                    {achievement.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{achievement.progress}%</span>
                    </div>
                    <Progress
                      value={achievement.progress}
                      className={`h-2 ${
                        !achievement.completed
                          ? "bg-gray-200 dark:bg-gray-700"
                          : ""
                      }`}
                    />
                    <div className="text-xs text-foreground/60">
                      {achievement.completed_at
                        ? `Achieved on ${new Date(
                            achievement.completed_at
                          ).toLocaleDateString()}`
                        : "In progress"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
