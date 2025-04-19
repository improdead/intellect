-- Create user_achievements table with minimal dependencies
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    icon TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_completed ON public.user_achievements(completed);

-- Add RLS policies
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own achievements
DROP POLICY IF EXISTS user_achievements_select_policy ON public.user_achievements;
CREATE POLICY user_achievements_select_policy ON public.user_achievements
    FOR SELECT
    USING (auth.uid() = user_id::text);

-- Policy for users to insert their own achievements
DROP POLICY IF EXISTS user_achievements_insert_policy ON public.user_achievements;
CREATE POLICY user_achievements_insert_policy ON public.user_achievements
    FOR INSERT
    WITH CHECK (auth.uid() = user_id::text);

-- Policy for users to update their own achievements
DROP POLICY IF EXISTS user_achievements_update_policy ON public.user_achievements;
CREATE POLICY user_achievements_update_policy ON public.user_achievements
    FOR UPDATE
    USING (auth.uid() = user_id::text);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.user_achievements TO authenticated;
