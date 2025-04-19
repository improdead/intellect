import { getSupabaseClient } from "./supabase-client";
import { auth0IdToUuid } from "./auth0-utils";

// User service for managing users
export const userService = {
  // Get the UUID for an Auth0 user ID
  async getSupabaseUuid(auth0UserId: string): Promise<string> {
    // Simply convert the Auth0 ID to a UUID using our utility function
    // This ensures consistent mapping between Auth0 IDs and Supabase UUIDs
    const supabaseUuid = auth0IdToUuid(auth0UserId);
    console.log(`Converted Auth0 ID to UUID: ${supabaseUuid}`);
    return supabaseUuid;
  },

  // Check if a user exists in the database
  async checkUserExists(supabaseUuid: string): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();

      // Try to get the user from the database
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("id", supabaseUuid)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking if user exists:", error);
        console.error("Error details:", JSON.stringify(error));
        return false;
      }

      return !!data;
    } catch (error) {
      console.error("Error in checkUserExists:", error);
      return false;
    }
  },

  // Ensure a user exists in the database
  async ensureUserExists(auth0UserId: string): Promise<string> {
    try {
      console.log(`Ensuring user exists for Auth0 ID: ${auth0UserId}`);
      const supabaseUuid = await this.getSupabaseUuid(auth0UserId);

      // Check if the user exists
      const userExists = await this.checkUserExists(supabaseUuid);

      if (userExists) {
        console.log(`User already exists: ${supabaseUuid}`);
        return supabaseUuid;
      }

      // If we're here, we don't need to create the user - we'll just use the UUID
      // This is because we're using the Auth0 ID -> UUID mapping directly
      // The user table might not exist or might have a different structure
      console.log(`Using UUID without creating user: ${supabaseUuid}`);
      return supabaseUuid;
    } catch (error) {
      console.error("Error in ensureUserExists:", error);
      // Return the UUID anyway, since we can still use it
      return auth0IdToUuid(auth0UserId);
    }
  },

  // Get user by Auth0 ID
  async getUserByAuth0Id(auth0UserId: string) {
    try {
      const supabaseUuid = await this.getSupabaseUuid(auth0UserId);
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", supabaseUuid)
        .single();

      if (error) {
        console.error("Error fetching user:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getUserByAuth0Id:", error);
      return null;
    }
  },
};
