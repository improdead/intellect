# Enhanced Video Generation System

This document explains the implementation of an enhanced video generation system using LangChain, LangGraph, and Supabase, with fallback mechanisms for local development.

## Architecture Overview

The enhanced video generation system uses a sophisticated architecture:

1. **LangChain**: For structured script generation with Gemini 2.0 Pro
2. **LangGraph**: For workflow orchestration and state management
3. **Supabase**: For persistent storage of job status and generated assets (with local fallback)
4. **Eleven Labs**: For realistic voice narration

## Key Features

1. **Works with Your Existing Setup**: Uses your existing Supabase configuration from `.env.local`
2. **Robust Fallback Mechanisms**: Falls back to local storage if Supabase is unavailable
3. **Real Script Generation**: Uses Gemini 2.0 Pro for high-quality educational scripts
4. **Real Voice Narration**: Uses Eleven Labs for realistic voice synthesis
5. **Structured Workflow**: Uses LangGraph for reliable process orchestration

## How It Works

1. **User Request**: User requests a video on a topic through the chat interface
2. **Job Creation**: System creates a job in Supabase (or local storage) and returns a job ID
3. **Script Generation**: LangChain generates a structured script using Gemini 2.0 Pro
4. **Voice Narration**: System generates voice narration for each section using Eleven Labs
5. **Status Tracking**: Frontend polls for status updates and displays progress
6. **Video Delivery**: When complete, the system provides a URL to the generated video

## Implementation Details

### 1. Supabase Integration with Fallbacks

The system uses your existing Supabase configuration but includes robust fallbacks:

- If Supabase is available, it stores job status and files there
- If Supabase is unavailable, it falls back to in-memory storage for job status
- For file storage, it falls back to local file system in the `public/generated` directory

### 2. LangChain Script Generation

The script generation uses LangChain with Gemini 2.0 Pro:

- Structured output parsing with Zod schemas
- Detailed educational content with visual descriptions
- Error handling and fallback mechanisms

### 3. LangGraph Workflow

The workflow orchestrates the entire video generation process:

- State-driven approach with clear node definitions
- Conditional edges for error handling and retries
- Persistent state tracking through Supabase or fallbacks

### 4. Voice Generation

The system uses Eleven Labs for realistic voice narration:

- High-quality voice synthesis
- Section-by-section narration
- Storage of audio files in Supabase or local filesystem

## How to Use

The system is ready to use with your existing setup:

1. The API endpoints are:
   - `POST /api/enhanced-video`: Start video generation
   - `GET /api/enhanced-video?jobId={id}`: Check job status

2. The chat interface is already updated to use these endpoints

3. No additional configuration is needed if your `.env.local` already has:
   - Supabase configuration
   - Google API key for Gemini
   - Eleven Labs API key

## Directory Structure

```
lib/
  ├── langchain/
  │   └── script-generation.ts  # LangChain script generation
  ├── langgraph/
  │   └── real-video-workflow.ts  # LangGraph workflow
  ├── supabase.ts  # Supabase client with fallbacks
  └── voice-generation.ts  # Eleven Labs voice generation

app/
  └── api/
      └── enhanced-video/
          └── route.ts  # API endpoints

public/
  └── generated/
      ├── audio/  # Generated audio files
      ├── images/  # Generated images
      ├── videos/  # Generated videos
      └── fallback/  # Fallback files
```

## Troubleshooting

### Common Issues

1. **Script Generation Fails**: Check your Google API key and quota
2. **Voice Generation Fails**: Check your Eleven Labs API key and quota
3. **Storage Issues**: The system will fall back to local storage if Supabase is unavailable

### Debugging

1. Check the console logs for detailed error messages
2. Inspect the job status through the API
3. Check the network requests in the browser developer tools

## Future Enhancements

1. **Image Generation**: Add integration with Stable Diffusion for generating visuals
2. **Video Composition**: Implement FFmpeg for combining images and audio into a video
3. **Parallel Processing**: Add Ray for parallel processing of image generation
4. **User Customization**: Allow users to customize video style and content
