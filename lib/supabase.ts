import { createClient } from '@supabase/supabase-js';

// Supabase configuration - using existing environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found. Using fallback storage for video generation.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// In-memory fallback storage when Supabase isn't available
const inMemoryJobStorage = new Map();

// Job status functions
export async function createVideoJob(topic: string) {
  const jobId = `video_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  try {
    if (supabaseUrl && supabaseKey) {
      // Use Supabase if credentials are available
      const { data, error } = await supabase
        .from('video_jobs')
        .insert([
          {
            job_id: jobId,
            topic: topic,
            status: 'pending',
            progress: 0,
            current_stage: 'Initializing',
            created_at: new Date().toISOString(),
          }
        ]);

      if (error) {
        console.error('Error creating video job in Supabase:', error);
        throw error;
      }
    } else {
      // Fallback to in-memory storage
      inMemoryJobStorage.set(jobId, {
        job_id: jobId,
        topic: topic,
        status: 'pending',
        progress: 0,
        current_stage: 'Initializing',
        created_at: new Date().toISOString(),
      });
    }

    return jobId;
  } catch (error) {
    console.error('Error creating video job:', error);

    // Last resort fallback - still use in-memory storage
    inMemoryJobStorage.set(jobId, {
      job_id: jobId,
      topic: topic,
      status: 'pending',
      progress: 0,
      current_stage: 'Initializing',
      created_at: new Date().toISOString(),
    });

    return jobId;
  }
}

export async function updateVideoJobStatus(jobId: string, updates: any) {
  try {
    if (supabaseUrl && supabaseKey) {
      // Use Supabase if credentials are available
      const { data, error } = await supabase
        .from('video_jobs')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('job_id', jobId);

      if (error) {
        console.error(`Error updating video job ${jobId} in Supabase:`, error);
        throw error;
      }

      return data;
    } else {
      // Fallback to in-memory storage
      const currentJob = inMemoryJobStorage.get(jobId) || {};
      const updatedJob = {
        ...currentJob,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      inMemoryJobStorage.set(jobId, updatedJob);
      return updatedJob;
    }
  } catch (error) {
    console.error(`Error updating video job ${jobId}:`, error);

    // Last resort fallback - still update in-memory storage if available
    if (inMemoryJobStorage.has(jobId)) {
      const currentJob = inMemoryJobStorage.get(jobId) || {};
      const updatedJob = {
        ...currentJob,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      inMemoryJobStorage.set(jobId, updatedJob);
      return updatedJob;
    }

    // If all else fails, just return the updates
    return { job_id: jobId, ...updates };
  }
}

export async function getVideoJobStatus(jobId: string) {
  try {
    if (supabaseUrl && supabaseKey) {
      // Use Supabase if credentials are available
      const { data, error } = await supabase
        .from('video_jobs')
        .select('*')
        .eq('job_id', jobId)
        .single();

      if (error) {
        console.error(`Error fetching video job ${jobId} from Supabase:`, error);
        throw error;
      }

      return data;
    } else {
      // Fallback to in-memory storage
      const jobData = inMemoryJobStorage.get(jobId);

      if (!jobData) {
        throw new Error(`Job not found: ${jobId}`);
      }

      return jobData;
    }
  } catch (error) {
    console.error(`Error fetching video job ${jobId}:`, error);

    // Last resort fallback - check in-memory storage
    const jobData = inMemoryJobStorage.get(jobId);

    if (jobData) {
      return jobData;
    }

    throw new Error(`Failed to fetch video job: ${error.message}`);
  }
}

// Local file storage for fallback
import fs from 'fs';
import path from 'path';

// File storage functions
export async function uploadFile(filePath: string, fileBuffer: Buffer) {
  try {
    if (supabaseUrl && supabaseKey) {
      // Use Supabase if credentials are available
      const { data, error } = await supabase.storage
        .from('video-generation')
        .upload(filePath, fileBuffer, {
          contentType: filePath.endsWith('.mp3') ? 'audio/mpeg' :
                      filePath.endsWith('.mp4') ? 'video/mp4' :
                      filePath.endsWith('.png') ? 'image/png' :
                      filePath.endsWith('.jpg') ? 'image/jpeg' :
                      'application/octet-stream',
          upsert: true
        });

      if (error) {
        console.error(`Error uploading file ${filePath} to Supabase:`, error);
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('video-generation')
        .getPublicUrl(filePath);

      return publicUrl;
    } else {
      // Fallback to local file storage
      const publicDir = path.join(process.cwd(), 'public');
      const generatedDir = path.join(publicDir, 'generated');

      // Create directories if they don't exist
      if (!fs.existsSync(generatedDir)) {
        fs.mkdirSync(generatedDir, { recursive: true });
      }

      // Determine the subdirectory based on file type
      let subdir = 'files';
      if (filePath.includes('/audio/')) subdir = 'audio';
      if (filePath.includes('/images/')) subdir = 'images';
      if (filePath.includes('/videos/')) subdir = 'videos';

      const subdirPath = path.join(generatedDir, subdir);
      if (!fs.existsSync(subdirPath)) {
        fs.mkdirSync(subdirPath, { recursive: true });
      }

      // Extract filename from path
      const filename = filePath.split('/').pop();
      const localFilePath = path.join(subdirPath, filename);

      // Write the file
      fs.writeFileSync(localFilePath, fileBuffer);

      // Return the public URL
      return `/generated/${subdir}/${filename}`;
    }
  } catch (error) {
    console.error(`Error uploading file ${filePath}:`, error);

    try {
      // Last resort fallback - try to save locally
      const publicDir = path.join(process.cwd(), 'public');
      const generatedDir = path.join(publicDir, 'generated');
      const fallbackDir = path.join(generatedDir, 'fallback');

      // Create directories if they don't exist
      if (!fs.existsSync(fallbackDir)) {
        fs.mkdirSync(fallbackDir, { recursive: true });
      }

      // Generate a unique filename
      const timestamp = Date.now();
      const filename = filePath.split('/').pop();
      const fallbackFilename = `${timestamp}_${filename}`;
      const fallbackPath = path.join(fallbackDir, fallbackFilename);

      // Write the file
      fs.writeFileSync(fallbackPath, fileBuffer);

      // Return the public URL
      return `/generated/fallback/${fallbackFilename}`;
    } catch (fallbackError) {
      console.error('Fallback file storage also failed:', fallbackError);

      // If all else fails, return a placeholder URL
      if (filePath.endsWith('.mp3')) {
        return '/fallback-audio.mp3';
      } else if (filePath.endsWith('.mp4')) {
        return 'https://fs-opennote-us-east-1.s3.us-east-1.amazonaws.com/2025-04-18T15:09:11.338354---1551e7de-1c67-11f0-9c6f-0afffc63bc59---output.mp4';
      } else {
        return '/fallback-image.jpg';
      }
    }
  }
}
