import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Create a Supabase client with the anonymous key for client-side operations
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
};

// Singleton instance for client components
let clientInstance: ReturnType<typeof createSupabaseClient> | null = null;

export const getSupabaseClient = () => {
  if (!clientInstance) {
    clientInstance = createSupabaseClient();
  }
  return clientInstance;
};
