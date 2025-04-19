-- Create user_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    activity_type TEXT NOT NULL,
    activity_id TEXT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT '',
    completed BOOLEAN DEFAULT FALSE,
    score INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_history_user_id ON public.user_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_history_activity_type ON public.user_history(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_history_created_at ON public.user_history(created_at);

-- Add RLS policies
ALTER TABLE public.user_history ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own history
DROP POLICY IF EXISTS user_history_select_policy ON public.user_history;
CREATE POLICY user_history_select_policy ON public.user_history
    FOR SELECT
    USING (auth.uid() = user_id::text);

-- Policy for users to insert their own history
DROP POLICY IF EXISTS user_history_insert_policy ON public.user_history;
CREATE POLICY user_history_insert_policy ON public.user_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id::text);

-- Policy for users to update their own history
DROP POLICY IF EXISTS user_history_update_policy ON public.user_history;
CREATE POLICY user_history_update_policy ON public.user_history
    FOR UPDATE
    USING (auth.uid() = user_id::text);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.user_history TO authenticated;
