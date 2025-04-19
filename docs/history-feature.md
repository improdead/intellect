# History Feature Implementation

This document explains how the history feature is implemented and how to set it up.

## Overview

The history feature tracks user activities such as:
- Chat sessions
- Quiz attempts
- Lesson completions
- Video views
- Achievements earned

This data is stored in the `user_history` table in Supabase and displayed on the History page.

## Database Setup

1. Run the SQL script to create the necessary tables:

```bash
psql -U postgres -d your_database_name -f scripts/create-user-history-table.sql
```

Or execute the SQL directly in the Supabase SQL Editor:

```sql
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
```

## Components

### History Service

The `historyService` in `lib/history-service.ts` provides methods to:
- Get user history
- Add history entries
- Get user achievements
- Update achievements
- Get user progress data

### Track Activity Utility

The `track-activity.ts` utility provides functions to track different types of activities:
- `trackActivity`: Generic function to track any activity
- `trackChatActivity`: Track chat sessions
- `trackQuizActivity`: Track quiz attempts
- `trackLessonActivity`: Track lesson completions
- `trackVideoActivity`: Track video views

### History Page

The History page (`app/dashboard/history/page.tsx`) displays:
- Recent activities
- Quiz history
- Achievements

## Usage

### Tracking Chat Activities

Chat activities are automatically tracked when using the `ChatInterfaceWithHistory` component:

```tsx
import ChatInterfaceWithHistory from '@/components/chat-interface-with-history';

export default function ChatPage() {
  return (
    <div className="flex-1">
      <ChatInterfaceWithHistory />
    </div>
  );
}
```

### Tracking Other Activities

To track other activities, import the appropriate function from `track-activity.ts`:

```tsx
import { trackQuizActivity } from '@/lib/track-activity';

// In your component:
const handleQuizSubmit = async (quizId, title, score) => {
  if (session?.user?.sub) {
    await trackQuizActivity(session.user.sub, quizId, title, score);
  }
};
```

## Testing

To test the history feature:
1. Make sure the database tables are created
2. Log in with a user account
3. Perform various activities (chat, etc.)
4. Visit the History page to see the recorded activities
