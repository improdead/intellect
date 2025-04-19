# Real Video Generation System

This document explains the implementation of a real video generation system using Gemini 2.0 Pro for script generation and Eleven Labs for voice synthesis.

## Overview

The system generates educational videos by:
1. Creating a structured script with Gemini 2.0 Pro
2. Generating voice narration with Eleven Labs
3. Creating visuals (currently simulated)
4. Composing the final video (currently using a sample video)

## Components

### 1. API Endpoints

- `POST /api/real-video`: Starts a new video generation job
- `GET /api/real-video?jobId={id}`: Gets the status of a job

### 2. Script Generation

The system uses Gemini 2.0 Pro to generate a structured script with:
- Title
- Introduction
- Multiple sections with visual descriptions
- Conclusion

The script is formatted as JSON for easy processing.

### 3. Voice Narration

The system uses Eleven Labs to generate realistic voice narration from the script text. The audio file is saved to the server and made available via a URL.

### 4. Job Status Tracking

The system tracks the status of each video generation job, including:
- Current stage
- Progress percentage
- Generated assets (script, audio, etc.)
- Error information if applicable

## How to Use

1. Make a POST request to `/api/real-video` with a topic:
   ```json
   {
     "topic": "Quantum Physics"
   }
   ```

2. The API returns a job ID:
   ```json
   {
     "jobId": "video_1234567890_abc123"
   }
   ```

3. Poll the status endpoint to track progress:
   ```
   GET /api/real-video?jobId=video_1234567890_abc123
   ```

4. When the job is complete, the status will include a video URL:
   ```json
   {
     "status": "completed",
     "progress": 100,
     "videoUrl": "/path/to/video.mp4"
   }
   ```

## Required Environment Variables

- `GOOGLE_API_KEY`: API key for Google Generative AI (Gemini)
- `ELEVEN_LABS_API_KEY`: API key for Eleven Labs voice synthesis

## Limitations and Future Improvements

1. **Real Image Generation**: Currently, the system doesn't generate real images. This could be implemented using Stable Diffusion or a similar service.

2. **Video Composition**: The system currently uses a sample video instead of composing a real video from images and audio. This could be implemented using FFmpeg.

3. **Persistent Storage**: The system uses in-memory storage for job status. In production, this should be replaced with a database.

4. **Error Handling**: The system has basic error handling, but this could be improved with retry mechanisms and more detailed error reporting.

5. **Parallel Processing**: The system processes each step sequentially. This could be optimized with parallel processing for image generation.

## Technical Details

- The system is built with Next.js API routes
- Script generation uses Gemini 2.0 Pro with structured output
- Voice narration uses Eleven Labs with the Adam voice
- Generated files are stored in the `public/generated` directory
