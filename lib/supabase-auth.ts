import { createClient } from "@supabase/supabase-js";
import { getSession } from "@auth0/nextjs-auth0";
import { auth0IdToUuid, auth0IdMapping } from "./auth0-utils";

// Create a Supabase client with the service role key for server-side operations
export const createSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, supabaseServiceKey);
};

// Create a Supabase client with the anonymous key for client-side operations
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseAnonKey);
};

// Function to sync Auth0 user with Supabase user
export async function syncUserWithSupabase() {
  console.log("Starting syncUserWithSupabase");
  const session = await getSession();

  if (!session?.user) {
    console.log("No user session found");
    return null;
  }

  const { user } = session;
  console.log("Auth0 user found:", user.sub);

  try {
    const supabase = createSupabaseAdmin();
    console.log("Supabase admin client created");

    // Convert Auth0 ID to UUID for Supabase
    const supabaseUuid = auth0IdToUuid(user.sub);
    auth0IdMapping[user.sub] = supabaseUuid;

    console.log("Auth0 ID:", user.sub);
    console.log("Converted UUID for Supabase:", supabaseUuid);

    // Check if user exists in Supabase
    console.log("Checking if user exists in Supabase for UUID:", supabaseUuid);
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", supabaseUuid)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        console.log("User not found in Supabase, will create new user");
      } else {
        console.error("Error fetching user from Supabase:", fetchError);
        return null;
      }
    }

    // If user doesn't exist, create a new user
    if (!existingUser) {
      console.log("Creating new user in Supabase");
      // Use the converted UUID for Supabase
      const userData = {
        id: supabaseUuid, // Converted UUID from Auth0 ID
        email: user.email,
        display_name: user.name,
        avatar_url: user.picture,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("User data to insert:", userData);

      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert(userData)
        .select()
        .single();

      if (insertError) {
        console.error("Error creating user in Supabase:", insertError);
        console.error("Insert error details:", {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
        });
        return null;
      }

      console.log("New user created in Supabase:", newUser.id);
      return newUser;
    }

    // If user exists but some fields might need updating
    console.log("User exists in Supabase, updating user data");
    const updateData = {
      email: user.email,
      display_name: user.name,
      avatar_url: user.picture,
      updated_at: new Date().toISOString(),
    };

    console.log("User data to update:", updateData);

    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", supabaseUuid) // Use the converted UUID
      .select()
      .single();

    if (updateError) {
      console.error("Error updating user in Supabase:", updateError);
      console.log("Returning existing user data");
      return existingUser; // Return existing user data if update fails
    }

    console.log("User updated in Supabase:", updatedUser.id);
    return updatedUser;
  } catch (error) {
    console.error("Unexpected error in syncUserWithSupabase:", error);
    return null;
  }
}
