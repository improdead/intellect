import { syncUserWithSupabase } from "@/lib/supabase-auth";

// This is a server component that syncs the Auth0 user with Supabase
// It doesn't render anything visible, but performs the sync operation
export default async function SyncUser() {
  try {
    await syncUserWithSupabase();
  } catch (error) {
    console.error("Error syncing user with Supabase:", error);
  }

  return null;
}
