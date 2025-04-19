-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  script TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own videos
CREATE POLICY "Users can view their own videos"
  ON videos
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy for users to insert their own videos
CREATE POLICY "Users can insert their own videos"
  ON videos
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Public can view videos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'videos');

CREATE POLICY "Authenticated users can upload videos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'videos' AND
    auth.role() = 'authenticated'
  );
