-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,
    email TEXT,
    name TEXT,
    auth0_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_auth0_id ON public.users(auth0_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Add RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own data
DROP POLICY IF EXISTS users_select_policy ON public.users;
CREATE POLICY users_select_policy ON public.users
    FOR SELECT
    USING (auth.uid() = id::text);

-- Policy for users to update their own data
DROP POLICY IF EXISTS users_update_policy ON public.users;
CREATE POLICY users_update_policy ON public.users
    FOR UPDATE
    USING (auth.uid() = id::text);

-- Grant permissions to authenticated users
GRANT SELECT, UPDATE ON public.users TO authenticated;
