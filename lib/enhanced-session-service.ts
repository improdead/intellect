import { getSupabaseClient } from './supabase-client';
import { auth0IdToUuid } from './auth0-utils';

// Enhanced session service with additional methods for achievement tracking
export const enhancedSessionService = {
  // Check if user logged in before 7am
  async checkEarlyLogin(userId: string): Promise<boolean> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from('user_sessions')
        .select('login_time')
        .eq('user_id', supabaseUuid)
        .order('login_time', { ascending: false })
        .limit(10);
      
      if (error || !data || data.length === 0) {
        return false;
      }
      
      // Check if any of the recent logins were before 7am
      return data.some(session => {
        const loginTime = new Date(session.login_time);
        return loginTime.getHours() < 7;
      });
    } catch (error) {
      console.error('Error in checkEarlyLogin:', error);
      return false;
    }
  },
  
  // Get number of days user studied after 10pm
  async getNightOwlDays(userId: string): Promise<number> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from('user_sessions')
        .select('login_time')
        .eq('user_id', supabaseUuid);
      
      if (error || !data) {
        return 0;
      }
      
      // Get unique days where user studied after 10pm
      const nightOwlDays = new Set();
      data.forEach(session => {
        const loginTime = new Date(session.login_time);
        if (loginTime.getHours() >= 22) {
          // Add the date (without time) to the set
          nightOwlDays.add(loginTime.toDateString());
        }
      });
      
      return nightOwlDays.size;
    } catch (error) {
      console.error('Error in getNightOwlDays:', error);
      return 0;
    }
  },
  
  // Get total study time on weekends (in minutes)
  async getWeekendStudyTime(userId: string): Promise<number> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from('user_sessions')
        .select('login_time, duration')
        .eq('user_id', supabaseUuid);
      
      if (error || !data) {
        return 0;
      }
      
      // Sum up duration of weekend sessions
      let totalMinutes = 0;
      data.forEach(session => {
        const loginTime = new Date(session.login_time);
        const day = loginTime.getDay();
        
        // 0 is Sunday, 6 is Saturday
        if (day === 0 || day === 6) {
          totalMinutes += session.duration || 0;
        }
      });
      
      return totalMinutes;
    } catch (error) {
      console.error('Error in getWeekendStudyTime:', error);
      return 0;
    }
  },
  
  // Get number of days user studied during lunch (12-1pm)
  async getLunchStudyDays(userId: string): Promise<number> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from('user_sessions')
        .select('login_time')
        .eq('user_id', supabaseUuid);
      
      if (error || !data) {
        return 0;
      }
      
      // Get unique days where user studied during lunch
      const lunchDays = new Set();
      data.forEach(session => {
        const loginTime = new Date(session.login_time);
        if (loginTime.getHours() === 12) {
          // Add the date (without time) to the set
          lunchDays.add(loginTime.toDateString());
        }
      });
      
      return lunchDays.size;
    } catch (error) {
      console.error('Error in getLunchStudyDays:', error);
      return 0;
    }
  },
  
  // Get number of days studied in the current month
  async getMonthlyStudyDays(userId: string): Promise<number> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();
      
      // Get current month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
      
      const { data, error } = await supabase
        .from('user_sessions')
        .select('login_time')
        .eq('user_id', supabaseUuid)
        .gte('login_time', firstDayOfMonth)
        .lte('login_time', lastDayOfMonth);
      
      if (error || !data) {
        return 0;
      }
      
      // Count unique days
      const uniqueDays = new Set();
      data.forEach(session => {
        uniqueDays.add(new Date(session.login_time).toDateString());
      });
      
      return uniqueDays.size;
    } catch (error) {
      console.error('Error in getMonthlyStudyDays:', error);
      return 0;
    }
  },
  
  // Get number of study sessions in the last 3 months
  async getQuarterlySessions(userId: string): Promise<number> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();
      
      // Get date 3 months ago
      const now = new Date();
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      
      const { data, error } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('user_id', supabaseUuid)
        .gte('login_time', threeMonthsAgo.toISOString());
      
      if (error || !data) {
        return 0;
      }
      
      return data.length;
    } catch (error) {
      console.error('Error in getQuarterlySessions:', error);
      return 0;
    }
  },
  
  // Get number of days since last login
  async getDaysInactive(userId: string): Promise<number> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from('user_sessions')
        .select('login_time')
        .eq('user_id', supabaseUuid)
        .order('login_time', { ascending: false })
        .limit(2);
      
      if (error || !data || data.length < 2) {
        return 0;
      }
      
      // Calculate days between current and previous login
      const currentLogin = new Date(data[0].login_time);
      const previousLogin = new Date(data[1].login_time);
      
      const diffTime = Math.abs(currentLogin.getTime() - previousLogin.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    } catch (error) {
      console.error('Error in getDaysInactive:', error);
      return 0;
    }
  },
  
  // Get last login time
  async getLastLoginTime(userId: string): Promise<Date | null> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from('user_sessions')
        .select('login_time')
        .eq('user_id', supabaseUuid)
        .order('login_time', { ascending: false })
        .limit(1);
      
      if (error || !data || data.length === 0) {
        return null;
      }
      
      return new Date(data[0].login_time);
    } catch (error) {
      console.error('Error in getLastLoginTime:', error);
      return null;
    }
  },
  
  // Get longest session duration (in minutes)
  async getLongestSession(userId: string): Promise<number> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from('user_sessions')
        .select('duration')
        .eq('user_id', supabaseUuid)
        .order('duration', { ascending: false })
        .limit(1);
      
      if (error || !data || data.length === 0) {
        return 0;
      }
      
      return data[0].duration || 0;
    } catch (error) {
      console.error('Error in getLongestSession:', error);
      return 0;
    }
  },
  
  // Get total study time for today (in minutes)
  async getDailyStudyTime(userId: string): Promise<number> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();
      
      // Get today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('user_sessions')
        .select('duration')
        .eq('user_id', supabaseUuid)
        .gte('login_time', today.toISOString());
      
      if (error || !data) {
        return 0;
      }
      
      // Sum up durations
      return data.reduce((total, session) => total + (session.duration || 0), 0);
    } catch (error) {
      console.error('Error in getDailyStudyTime:', error);
      return 0;
    }
  },
  
  // Get weekly study time (in minutes)
  async getWeeklyStudyTime(userId: string): Promise<number> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();
      
      // Get date 7 days ago
      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      
      const { data, error } = await supabase
        .from('user_sessions')
        .select('duration')
        .eq('user_id', supabaseUuid)
        .gte('login_time', sevenDaysAgo.toISOString());
      
      if (error || !data) {
        return 0;
      }
      
      // Sum up durations
      return data.reduce((total, session) => total + (session.duration || 0), 0);
    } catch (error) {
      console.error('Error in getWeeklyStudyTime:', error);
      return 0;
    }
  }
};
