import { historyService } from "./history-service";

/**
 * Track a user activity by adding it to the history
 * 
 * @param userId The user's Auth0 ID
 * @param data Activity data to record
 * @returns Promise<boolean> indicating success or failure
 */
export async function trackActivity(
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
    console.log(`[track-activity] Recording activity for user ${userId}: ${data.activity_type} - ${data.title}`);
    
    // Add the activity to history
    const success = await historyService.addHistoryEntry(userId, data);
    
    if (success) {
      console.log(`[track-activity] Successfully recorded activity`);
    } else {
      console.error(`[track-activity] Failed to record activity`);
    }
    
    return success;
  } catch (error) {
    console.error(`[track-activity] Error recording activity:`, error);
    return false;
  }
}

/**
 * Track a chat activity
 */
export async function trackChatActivity(
  userId: string,
  chatId: string,
  title: string
): Promise<boolean> {
  return trackActivity(userId, {
    activity_type: "chat",
    activity_id: chatId,
    title: `Chat: ${title}`,
    category: "Learning",
    completed: true,
  });
}

/**
 * Track a quiz activity
 */
export async function trackQuizActivity(
  userId: string,
  quizId: string,
  title: string,
  score: number,
  completed: boolean = true
): Promise<boolean> {
  return trackActivity(userId, {
    activity_type: "quiz",
    activity_id: quizId,
    title: `Quiz: ${title}`,
    category: "Assessment",
    completed,
    score,
  });
}

/**
 * Track a lesson activity
 */
export async function trackLessonActivity(
  userId: string,
  lessonId: string,
  title: string,
  completed: boolean = false
): Promise<boolean> {
  return trackActivity(userId, {
    activity_type: "lesson",
    activity_id: lessonId,
    title: `Lesson: ${title}`,
    category: "Learning",
    completed,
  });
}

/**
 * Track a video activity
 */
export async function trackVideoActivity(
  userId: string,
  videoId: string,
  title: string,
  completed: boolean = false
): Promise<boolean> {
  return trackActivity(userId, {
    activity_type: "video",
    activity_id: videoId,
    title: `Video: ${title}`,
    category: "Learning",
    completed,
  });
}
