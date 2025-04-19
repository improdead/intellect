# Enhanced Video Generation System

This document explains the implementation of an enhanced video generation system using LangChain, LangGraph, and Supabase.

## Architecture Overview

The enhanced video generation system uses a sophisticated architecture:

1. **LangChain**: For structured script generation with Gemini 2.0 Pro
2. **LangGraph**: For workflow orchestration and state management
3. **Supabase**: For persistent storage of job status and generated assets
4. **Eleven Labs**: For realistic voice narration

## Components

### 1. LangChain Script Generation

The system uses LangChain with Gemini 2.0 Pro to generate structured scripts:

- Structured output parsing with Zod schemas
- Detailed educational content with visual descriptions
- Error handling and fallback mechanisms

### 2. LangGraph Workflow

The workflow orchestrates the entire video generation process:

- State-driven approach with clear node definitions
- Conditional edges for error handling and retries
- Persistent state tracking through Supabase

### 3. Supabase Integration

Supabase provides persistent storage for:

- Job status and progress tracking
- Generated assets (scripts, audio, images)
- Video files and public URLs

### 4. Voice Generation

The system uses Eleven Labs for realistic voice narration:

- High-quality voice synthesis
- Section-by-section narration
- Storage of audio files in Supabase

## How It Works

1. **User Request**: User requests a video on a topic through the chat interface
2. **Job Creation**: System creates a job in Supabase and returns a job ID
3. **Script Generation**: LangChain generates a structured script using Gemini 2.0 Pro
4. **Voice Narration**: System generates voice narration for each section using Eleven Labs
5. **Status Tracking**: Frontend polls for status updates and displays progress
6. **Video Delivery**: When complete, the system provides a URL to the generated video

## Setup Instructions

### 1. Environment Variables

Copy the `.env.local.example` file to `.env.local` and fill in the required values:

```
# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google AI API key for Gemini
GOOGLE_API_KEY=your-google-api-key

# Eleven Labs API key for voice generation
ELEVEN_LABS_API_KEY=your-eleven-labs-api-key
```

### 2. Supabase Setup

1. Create a new Supabase project
2. Run the SQL migration in `supabase/migrations/20230501000000_create_video_jobs_table.sql`
3. Create a storage bucket named `video-generation`
4. Set up the appropriate storage policies

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

## API Endpoints

### Start Video Generation

```
POST /api/enhanced-video
Content-Type: application/json

{
  "topic": "Quantum Physics"
}
```

Response:

```json
{
  "jobId": "video_1234567890_abc123"
}
```

### Check Job Status

```
GET /api/enhanced-video?jobId=video_1234567890_abc123
```

Response:

```json
{
  "jobId": "video_1234567890_abc123",
  "topic": "Quantum Physics",
  "status": "in_progress",
  "progress": 60,
  "currentStage": "Voice narration generated",
  "videoUrl": null,
  "error": null,
  "createdAt": "2023-05-01T12:00:00Z",
  "updatedAt": "2023-05-01T12:05:00Z"
}
```

## Future Enhancements

1. **Image Generation**: Add integration with Stable Diffusion for generating visuals
2. **Video Composition**: Implement FFmpeg for combining images and audio into a video
3. **Parallel Processing**: Add Ray for parallel processing of image generation
4. **User Customization**: Allow users to customize video style and content

## Technical Details

### LangChain Implementation

The LangChain implementation uses:
- Structured output parsing with Zod schemas
- ChatGoogleGenerativeAI for Gemini 2.0 Pro integration
- Error handling and fallback mechanisms

### LangGraph Workflow

The LangGraph workflow includes:
- Nodes for each step of the process
- Conditional edges for error handling
- State management for tracking progress

### Supabase Schema

The Supabase schema includes:
- `video_jobs` table for job status tracking
- Storage bucket for generated assets
- Appropriate indexes and policies

## Troubleshooting

### Common Issues

1. **Script Generation Fails**: Check your Google API key and quota
2. **Voice Generation Fails**: Check your Eleven Labs API key and quota
3. **Storage Issues**: Check your Supabase configuration and policies

### Debugging

1. Check the console logs for detailed error messages
2. Inspect the job status in Supabase
3. Check the network requests in the browser developer tools
