-- Create video_jobs table
CREATE TABLE IF NOT EXISTS video_jobs (
  id BIGSERIAL PRIMARY KEY,
  job_id TEXT NOT NULL UNIQUE,
  topic TEXT NOT NULL,
  status TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  current_stage TEXT,
  script_data JSONB,
  narration_urls JSONB,
  image_urls JSONB,
  video_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on job_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_video_jobs_job_id ON video_jobs(job_id);

-- Create storage bucket for video generation assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('video-generation', 'video-generation', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies to allow public access to the bucket
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'video-generation');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated Users Can Upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'video-generation' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated Users Can Update Own Files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'video-generation' AND auth.uid() = owner);

-- Allow authenticated users to delete their own files
CREATE POLICY "Authenticated Users Can Delete Own Files" ON storage.objects
  FOR DELETE USING (bucket_id = 'video-generation' AND auth.uid() = owner);
