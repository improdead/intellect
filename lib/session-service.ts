import { getSupabaseClient } from "./supabase-client";
import { auth0IdToUuid } from "./auth0-utils";

// User session interface
export interface UserSession {
  id: string;
  user_id: string;
  login_time: string;
  logout_time?: string;
  duration_minutes?: number;
  is_active: boolean;
  created_at: string;
}

// Session service for tracking user login/logout and calculating study time
export const sessionService = {
  // Start a new session when user logs in
  async startSession(userId: string): Promise<UserSession | null> {
    try {
      console.log(`[session-service] Starting session for user: ${userId}`);
      const supabaseUuid = auth0IdToUuid(userId);
      console.log(
        `[session-service] Converted Auth0 ID to UUID: ${supabaseUuid}`
      );
      const supabase = getSupabaseClient();

      // First, check if there's an active session and close it
      console.log(
        `[session-service] Ending any active sessions for user: ${userId}`
      );
      await this.endActiveSessions(userId);

      // Create a new session
      console.log(
        `[session-service] Creating new session for user: ${supabaseUuid}`
      );
      const { data, error } = await supabase
        .from("user_sessions")
        .insert({
          user_id: supabaseUuid,
          login_time: new Date().toISOString(),
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error("Error starting session:", error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        return null;
      }

      console.log(`[session-service] Session created successfully: ${data.id}`);
      return data;
    } catch (error) {
      console.error("Error in startSession:", error);
      return null;
    }
  },

  // End a session when user logs out
  async endSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();

      // Get the session
      const { data: session, error: fetchError } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", supabaseUuid)
        .single();

      if (fetchError) {
        console.error("Error fetching session:", fetchError);
        return false;
      }

      // Calculate duration
      const loginTime = new Date(session.login_time);
      const logoutTime = new Date();
      const durationMinutes = Math.round(
        (logoutTime.getTime() - loginTime.getTime()) / (1000 * 60)
      );

      // Update the session
      const { error } = await supabase
        .from("user_sessions")
        .update({
          logout_time: logoutTime.toISOString(),
          duration_minutes: durationMinutes,
          is_active: false,
        })
        .eq("id", sessionId)
        .eq("user_id", supabaseUuid);

      if (error) {
        console.error("Error ending session:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in endSession:", error);
      return false;
    }
  },

  // End all active sessions for a user
  async endActiveSessions(userId: string): Promise<boolean> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();

      // Get all active sessions
      const { data: activeSessions, error: fetchError } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("user_id", supabaseUuid)
        .eq("is_active", true);

      if (fetchError) {
        console.error("Error fetching active sessions:", fetchError);
        return false;
      }

      // End each active session
      for (const session of activeSessions || []) {
        const loginTime = new Date(session.login_time);
        const logoutTime = new Date();
        const durationMinutes = Math.round(
          (logoutTime.getTime() - loginTime.getTime()) / (1000 * 60)
        );

        await supabase
          .from("user_sessions")
          .update({
            logout_time: logoutTime.toISOString(),
            duration_minutes: durationMinutes,
            is_active: false,
          })
          .eq("id", session.id);
      }

      return true;
    } catch (error) {
      console.error("Error in endActiveSessions:", error);
      return false;
    }
  },

  // Get the current active session for a user
  async getActiveSession(userId: string): Promise<UserSession | null> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("user_id", supabaseUuid)
        .eq("is_active", true)
        .order("login_time", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No active session found
          return null;
        }
        console.error("Error fetching active session:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getActiveSession:", error);
      return null;
    }
  },

  // Calculate total study time for a user in the current week
  async getWeeklyStudyTime(userId: string): Promise<number> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();

      // Get the start of the current week (Sunday)
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Go back to Sunday
      startOfWeek.setHours(0, 0, 0, 0);

      // Get all sessions for the current week
      const { data, error } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("user_id", supabaseUuid)
        .gte("login_time", startOfWeek.toISOString());

      if (error) {
        console.error("Error fetching weekly sessions:", error);
        return 0;
      }

      // Calculate total duration
      let totalMinutes = 0;
      for (const session of data || []) {
        if (session.duration_minutes) {
          totalMinutes += session.duration_minutes;
        } else if (session.is_active) {
          // For active sessions, calculate duration up to now
          const loginTime = new Date(session.login_time);
          const now = new Date();
          const durationMinutes = Math.round(
            (now.getTime() - loginTime.getTime()) / (1000 * 60)
          );
          totalMinutes += durationMinutes;
        }
      }

      return totalMinutes;
    } catch (error) {
      console.error("Error in getWeeklyStudyTime:", error);
      return 0;
    }
  },

  // Check if user logged in before 7am today
  async checkEarlyLogin(userId: string): Promise<boolean> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();

      // Get the start of today
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      // Get the 7am threshold
      const earlyThreshold = new Date(now);
      earlyThreshold.setHours(7, 0, 0, 0);

      // Get sessions for today
      const { data, error } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("user_id", supabaseUuid)
        .gte("login_time", startOfDay.toISOString())
        .lt("login_time", earlyThreshold.toISOString())
        .limit(1);

      if (error) {
        console.error("Error checking early login:", error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error("Error in checkEarlyLogin:", error);
      return false;
    }
  },
};
