import { NextRequest } from 'next/server';

// The URL of your deployed Manim Video API
const MANIM_API_URL = process.env.MANIM_API_URL || 'https://your-manim-api.onrender.com';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    
    if (!jobId) {
      return new Response('Job ID is required', { status: 400 });
    }
    
    // Get the job status to find the video URL
    const statusResponse = await fetch(`${MANIM_API_URL}/job/${jobId}`);
    
    if (!statusResponse.ok) {
      return new Response('Failed to get job status', { status: statusResponse.status });
    }
    
    const statusData = await statusResponse.json();
    
    if (statusData.status !== 'completed' || !statusData.video_url) {
      return new Response('Video not available', { status: 404 });
    }
    
    // Forward the request to the Manim Video API
    const videoResponse = await fetch(`${MANIM_API_URL}${statusData.video_url}`);
    
    if (!videoResponse.ok) {
      return new Response('Failed to get video', { status: videoResponse.status });
    }
    
    // Stream the video response
    const videoBlob = await videoResponse.blob();
    return new Response(videoBlob, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `inline; filename="manim-video-${jobId}.mp4"`,
      },
    });
  } catch (error) {
    console.error('Error streaming video:', error);
    return new Response('An error occurred while streaming the video', { status: 500 });
  }
}
