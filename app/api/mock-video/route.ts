import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for job status
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
      job_id: jobId,
      topic: topic,
      status: 'pending',
      progress: 0,
      current_stage: 'Initializing',
      created_at: new Date().toISOString(),
    });

    // Start a background process to update the job status
    simulateVideoGeneration(jobId, topic);

    // Return the job ID immediately
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

    // Get job status from storage
    const jobStatus = jobStorage.get(jobId);
    
    if (!jobStatus) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

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

// Simulate video generation process
function simulateVideoGeneration(jobId: string, topic: string) {
  // Update job status to in_progress
  jobStorage.set(jobId, {
    ...jobStorage.get(jobId),
    status: 'in_progress',
    progress: 10,
    current_stage: 'Generating script',
    updated_at: new Date().toISOString(),
  });

  // Simulate script generation (after 3 seconds)
  setTimeout(() => {
    jobStorage.set(jobId, {
      ...jobStorage.get(jobId),
      progress: 30,
      current_stage: 'Script generated',
      updated_at: new Date().toISOString(),
    });

    // Simulate voice generation (after 3 more seconds)
    setTimeout(() => {
      jobStorage.set(jobId, {
        ...jobStorage.get(jobId),
        progress: 60,
        current_stage: 'Voice narration generated',
        updated_at: new Date().toISOString(),
      });

      // Simulate animation generation (after 3 more seconds)
      setTimeout(() => {
        jobStorage.set(jobId, {
          ...jobStorage.get(jobId),
          progress: 80,
          current_stage: 'Animations generated',
          updated_at: new Date().toISOString(),
        });

        // Simulate video finalization (after 3 more seconds)
        setTimeout(() => {
          jobStorage.set(jobId, {
            ...jobStorage.get(jobId),
            status: 'completed',
            progress: 100,
            current_stage: 'Video generation complete',
            video_url: 'https://fs-opennote-us-east-1.s3.us-east-1.amazonaws.com/2025-04-18T15:09:11.338354---1551e7de-1c67-11f0-9c6f-0afffc63bc59---output.mp4',
            updated_at: new Date().toISOString(),
          });
        }, 3000);
      }, 3000);
    }, 3000);
  }, 3000);
}
