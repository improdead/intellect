import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for job status (using a global variable to persist between requests)
const jobStorage = new Map();

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Create a job ID
    const jobId = `video_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Store initial job status
    jobStorage.set(jobId, {
      jobId: jobId,
      topic: topic,
      status: 'in_progress',
      progress: 10,
      currentStage: 'Generating script',
      createdAt: new Date().toISOString(),
    });

    console.log(`Created job ${jobId} for topic: ${topic}`);

    return NextResponse.json({ jobId });
  } catch (error) {
    console.error('Error starting video generation:', error);
    return NextResponse.json(
      { error: 'Failed to start video generation', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const jobId = url.searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    console.log(`Checking status for job: ${jobId}`);

    // Get job status from storage
    let jobStatus = jobStorage.get(jobId);
    
    if (!jobStatus) {
      console.log(`Job not found: ${jobId}, creating mock status`);
      // If job not found, create a mock status
      jobStatus = {
        jobId: jobId,
        topic: "Unknown topic",
        status: 'in_progress',
        progress: 10,
        currentStage: 'Generating script',
        createdAt: new Date().toISOString(),
      };
      jobStorage.set(jobId, jobStatus);
    }

    // Update job progress based on current progress
    const currentProgress = jobStatus.progress || 0;
    
    if (currentProgress < 100) {
      const newProgress = Math.min(currentProgress + 15, 100);
      const newStatus = newProgress === 100 ? 'completed' : 'in_progress';
      
      let currentStage = 'Generating script';
      if (newProgress > 25 && newProgress <= 50) {
        currentStage = 'Generating voice narration';
      } else if (newProgress > 50 && newProgress <= 75) {
        currentStage = 'Creating animations';
      } else if (newProgress > 75 && newProgress < 100) {
        currentStage = 'Finalizing video';
      } else if (newProgress === 100) {
        currentStage = 'Video generation complete';
      }
      
      jobStatus = {
        ...jobStatus,
        status: newStatus,
        progress: newProgress,
        currentStage: currentStage,
        updatedAt: new Date().toISOString(),
      };
      
      // Add video URL when complete
      if (newStatus === 'completed') {
        jobStatus.videoUrl = 'https://fs-opennote-us-east-1.s3.us-east-1.amazonaws.com/2025-04-18T15:09:11.338354---1551e7de-1c67-11f0-9c6f-0afffc63bc59---output.mp4';
      }
      
      jobStorage.set(jobId, jobStatus);
    }

    console.log(`Returning status for job ${jobId}:`, jobStatus);
    
    // Return the job status
    return NextResponse.json(jobStatus);
  } catch (error) {
    console.error('Error fetching job status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job status', details: error.message },
      { status: 500 }
    );
  }
}
