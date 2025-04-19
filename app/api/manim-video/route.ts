import { NextRequest, NextResponse } from 'next/server';

// The URL of your deployed Manim Video API
const MANIM_API_URL = process.env.MANIM_API_URL || 'https://your-manim-api.onrender.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward the request to the Manim Video API
    const response = await fetch(`${MANIM_API_URL}/generate-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || 'Failed to generate video' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating video:', error);
    return NextResponse.json(
      { error: 'An error occurred while generating the video' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }
    
    // Forward the request to the Manim Video API
    const response = await fetch(`${MANIM_API_URL}/job/${jobId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || 'Failed to get job status' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // If the job is completed and has a video URL, rewrite the URL to point to our API
    if (data.status === 'completed' && data.video_url) {
      data.video_url = `/api/manim-video/video?jobId=${jobId}`;
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting job status:', error);
    return NextResponse.json(
      { error: 'An error occurred while getting the job status' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }
    
    // Forward the request to the Manim Video API
    const response = await fetch(`${MANIM_API_URL}/job/${jobId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || 'Failed to delete job' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the job' },
      { status: 500 }
    );
  }
}
