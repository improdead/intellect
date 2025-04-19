-- Create history table if it doesn't exist
CREATE TABLE IF NOT EXISTS history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  activity_type TEXT NOT NULL,
  activity_id UUID,
  topic_id UUID,
  subject_id UUID REFERENCES subjects(id),
  title TEXT NOT NULL,
  description TEXT,
  score INTEGER,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS history_user_id_idx ON history(user_id);
CREATE INDEX IF NOT EXISTS history_subject_id_idx ON history(subject_id);
CREATE INDEX IF NOT EXISTS history_activity_type_idx ON history(activity_type);

-- Create a function to create the history table if it doesn't exist
CREATE OR REPLACE FUNCTION create_history_table()
RETURNS void AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'history'
  ) THEN
    -- Create the table
    EXECUTE '
      CREATE TABLE history (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id),
        activity_type TEXT NOT NULL,
        activity_id UUID,
        topic_id UUID,
        subject_id UUID REFERENCES subjects(id),
        title TEXT NOT NULL,
        description TEXT,
        score INTEGER,
        duration INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX history_user_id_idx ON history(user_id);
      CREATE INDEX history_subject_id_idx ON history(subject_id);
      CREATE INDEX history_activity_type_idx ON history(activity_type);
    ';
  END IF;
END;
$$ LANGUAGE plpgsql;
