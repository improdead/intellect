-- Create user_achievements table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS user_achievements_user_id_idx ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS user_achievements_name_idx ON user_achievements(name);
CREATE INDEX IF NOT EXISTS user_achievements_completed_idx ON user_achievements(completed);

-- Create a function to create the user_achievements table if it doesn't exist
CREATE OR REPLACE FUNCTION create_user_achievements_table()
RETURNS void AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'user_achievements'
  ) THEN
    -- Create the table
    EXECUTE '
      CREATE TABLE user_achievements (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id),
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        progress INTEGER NOT NULL DEFAULT 0,
        completed BOOLEAN NOT NULL DEFAULT false,
        completed_at TIMESTAMP WITH TIME ZONE,
        icon TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, name)
      );
      
      CREATE INDEX user_achievements_user_id_idx ON user_achievements(user_id);
      CREATE INDEX user_achievements_name_idx ON user_achievements(name);
      CREATE INDEX user_achievements_completed_idx ON user_achievements(completed);
    ';
  END IF;
END;
$$ LANGUAGE plpgsql;
