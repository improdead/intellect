import { NextRequest, NextResponse } from 'next/server';
import { createVideoJob, getVideoJobStatus } from '@/lib/supabase';
import { runVideoWorkflow } from '@/lib/langgraph/real-video-workflow';

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Create a job in Supabase
    const jobId = await createVideoJob(topic);

    // Start the video generation workflow in the background
    // We don't await this because it will run asynchronously
    runVideoWorkflow(jobId, topic).catch(error => {
      console.error(`Unhandled error in workflow for job ${jobId}:`, error);
    });

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

    // Get job status from Supabase
    const jobStatus = await getVideoJobStatus(jobId);

    // Format the response
    return NextResponse.json({
      jobId: jobStatus.job_id,
      topic: jobStatus.topic,
      status: jobStatus.status,
      progress: jobStatus.progress,
      currentStage: jobStatus.current_stage,
      videoUrl: jobStatus.video_url,
      error: jobStatus.error_message,
      createdAt: jobStatus.created_at,
      updatedAt: jobStatus.updated_at,
    });
  } catch (error) {
    console.error('Error fetching job status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job status', details: error.message },
      { status: 500 }
    );
  }
}
