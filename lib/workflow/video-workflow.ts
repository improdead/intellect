import { generateVideoScript } from '../langchain/script-generation';
import { generateSectionNarrations } from '../voice-generation';
import { updateVideoJobStatus } from '../supabase';

// Define the state interface
interface VideoGenerationState {
  jobId: string;
  topic: string;
  script?: any;
  narrations?: Record<string, string>;
  images?: Record<string, string>;
  videoUrl?: string;
  status: string;
  progress: number;
  currentStage: string;
  errors: Array<{ stage: string; error: string }>;
  retryCount: Record<string, number>;
}

/**
 * Simple workflow implementation without LangGraph dependencies
 * Uses async/await and Promise.all for parallel processing
 */
export async function runVideoWorkflow(jobId: string, topic: string) {
  // Initialize the state
  let state: VideoGenerationState = {
    jobId,
    topic,
    status: 'pending',
    progress: 0,
    currentStage: 'Initializing',
    errors: [],
    retryCount: {},
  };

  try {
    // 1. Generate script
    try {
      console.log(`Generating script for topic: ${topic}`);
      
      // Update job status
      await updateVideoJobStatus(jobId, {
        status: 'in_progress',
        progress: 10,
        current_stage: 'Generating script with Gemini 2.0 Pro',
      });
      
      // Generate script
      const script = await generateVideoScript(topic);
      
      // Update job status
      await updateVideoJobStatus(jobId, {
        progress: 30,
        current_stage: 'Script generated',
        script_data: script,
      });
      
      // Update state
      state = {
        ...state,
        script,
        status: 'script_generated',
        progress: 30,
        currentStage: 'Script generated',
      };
    } catch (error) {
      console.error('Error in script generation:', error);
      
      // Update job status
      await updateVideoJobStatus(jobId, {
        status: 'failed',
        current_stage: 'Script generation failed',
        error_message: error.message,
      });
      
      // Update state and throw to exit workflow
      state = {
        ...state,
        errors: [...state.errors, { stage: 'script', error: error.message }],
        status: 'failed',
        currentStage: 'Script generation failed',
      };
      
      throw new Error(`Script generation failed: ${error.message}`);
    }

    // 2. Generate narrations (in parallel)
    try {
      console.log('Generating narrations for script sections');
      
      // Update job status
      await updateVideoJobStatus(jobId, {
        progress: 40,
        current_stage: 'Generating voice narration with Eleven Labs',
      });
      
      // Generate narrations for each section (uses Promise.all internally)
      const narrations = await generateSectionNarrations(state.script, jobId);
      
      // Update job status
      await updateVideoJobStatus(jobId, {
        progress: 60,
        current_stage: 'Voice narration generated',
        narration_urls: narrations,
      });
      
      // Update state
      state = {
        ...state,
        narrations,
        status: 'narration_generated',
        progress: 60,
        currentStage: 'Voice narration generated',
      };
    } catch (error) {
      console.error('Error generating narrations:', error);
      
      // Update job status
      await updateVideoJobStatus(jobId, {
        status: 'failed',
        current_stage: 'Voice narration failed',
        error_message: error.message,
      });
      
      // Update state and throw to exit workflow
      state = {
        ...state,
        errors: [...state.errors, { stage: 'narration', error: error.message }],
        status: 'failed',
        currentStage: 'Voice narration failed',
      };
      
      throw new Error(`Voice narration failed: ${error.message}`);
    }

    // 3. Finalize video
    try {
      console.log('Finalizing video');
      
      // Update job status
      await updateVideoJobStatus(jobId, {
        progress: 90,
        current_stage: 'Finalizing video',
      });
      
      // For now, we'll use a sample video URL
      // In a real implementation, this would compose the video from narrations and images
      const videoUrl = 'https://fs-opennote-us-east-1.s3.us-east-1.amazonaws.com/2025-04-18T15:09:11.338354---1551e7de-1c67-11f0-9c6f-0afffc63bc59---output.mp4';
      
      // Update job status
      await updateVideoJobStatus(jobId, {
        status: 'completed',
        progress: 100,
        current_stage: 'Video generation complete',
        video_url: videoUrl,
      });
      
      // Update state
      state = {
        ...state,
        videoUrl,
        status: 'completed',
        progress: 100,
        currentStage: 'Video generation complete',
      };
    } catch (error) {
      console.error('Error finalizing video:', error);
      
      // Update job status
      await updateVideoJobStatus(jobId, {
        status: 'failed',
        current_stage: 'Video finalization failed',
        error_message: error.message,
      });
      
      // Update state and throw to exit workflow
      state = {
        ...state,
        errors: [...state.errors, { stage: 'finalize', error: error.message }],
        status: 'failed',
        currentStage: 'Video finalization failed',
      };
      
      throw new Error(`Video finalization failed: ${error.message}`);
    }

    return state;
  } catch (error) {
    console.error(`Error running workflow for job ${jobId}:`, error);
    
    // Update job status if not already updated
    if (state.status !== 'failed') {
      await updateVideoJobStatus(jobId, {
        status: 'failed',
        current_stage: 'Workflow execution failed',
        error_message: error.message,
      });
    }
    
    throw error;
  }
}
