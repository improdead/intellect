import { StateGraph, END } from '@langchain/langgraph';
import { generateVideoScript } from '../langchain/script-generation';
import { generateSectionNarrations } from '../voice-generation';
import { generateSimplifiedAnimations } from '../manim/simplified-animation-generator';
import { composeVideo } from '../video/composer';
import { updateVideoJobStatus } from '../supabase';

// Define the state interface
interface VideoGenerationState {
  jobId: string;
  topic: string;
  script?: any;
  narrations?: Record<string, string>;
  animations?: Record<string, string>;
  images?: Record<string, string>;
  videoUrl?: string;
  status: string;
  progress: number;
  currentStage: string;
  errors: Array<{ stage: string; error: string }>;
  retryCount: Record<string, number>;
}

// Create the workflow graph
export function createVideoWorkflow() {
  const workflow = new StateGraph<VideoGenerationState>({
    channels: {
      jobId: {},
      topic: {},
      script: {},
      narrations: {},
      animations: {},
      images: {},
      videoUrl: {},
      status: {},
      progress: {},
      currentStage: {},
      errors: {},
      retryCount: {},
    },
  });

  // Define the nodes
  workflow.addNode('generateScript', async (state) => {
    try {
      console.log(`Generating script for topic: ${state.topic}`);

      // Update job status
      await updateVideoJobStatus(state.jobId, {
        status: 'in_progress',
        progress: 10,
        current_stage: 'Generating script with Gemini 2.0 Pro',
      });

      // Generate script
      const script = await generateVideoScript(state.topic);

      // Update job status
      await updateVideoJobStatus(state.jobId, {
        progress: 30,
        current_stage: 'Script generated',
        script_data: script,
      });

      return {
        ...state,
        script,
        status: 'script_generated',
        progress: 30,
        currentStage: 'Script generated',
      };
    } catch (error) {
      console.error('Error in script generation:', error);

      // Update job status
      await updateVideoJobStatus(state.jobId, {
        status: 'failed',
        current_stage: 'Script generation failed',
        error_message: error.message,
      });

      return {
        ...state,
        errors: [...(state.errors || []), { stage: 'script', error: error.message }],
        retryCount: { ...state.retryCount, script: (state.retryCount.script || 0) + 1 },
        status: 'failed',
        currentStage: 'Script generation failed',
      };
    }
  });

  workflow.addNode('generateNarration', async (state) => {
    try {
      console.log('Generating narrations for script sections');

      // Update job status
      await updateVideoJobStatus(state.jobId, {
        progress: 40,
        current_stage: 'Generating voice narration with Eleven Labs',
      });

      // Generate narrations for each section
      const narrations = await generateSectionNarrations(state.script, state.jobId);

      // Update job status
      await updateVideoJobStatus(state.jobId, {
        progress: 60,
        current_stage: 'Voice narration generated',
        narration_urls: narrations,
      });

      return {
        ...state,
        narrations,
        status: 'narration_generated',
        progress: 60,
        currentStage: 'Voice narration generated',
      };
    } catch (error) {
      console.error('Error generating narrations:', error);

      // Update job status
      await updateVideoJobStatus(state.jobId, {
        status: 'failed',
        current_stage: 'Voice narration failed',
        error_message: error.message,
      });

      return {
        ...state,
        errors: [...(state.errors || []), { stage: 'narration', error: error.message }],
        retryCount: { ...state.retryCount, narration: (state.retryCount.narration || 0) + 1 },
        status: 'failed',
        currentStage: 'Voice narration failed',
      };
    }
  });

  workflow.addNode('generateAnimations', async (state) => {
    try {
      console.log('Generating mathematical animations for script sections');

      // Update job status
      await updateVideoJobStatus(state.jobId, {
        progress: 65,
        current_stage: 'Generating mathematical animations with Manim.js',
      });

      // Generate animations for each section
      const animations = await generateSimplifiedAnimations(state.script, state.jobId);

      // Update job status
      await updateVideoJobStatus(state.jobId, {
        progress: 80,
        current_stage: 'Animations generated',
        animation_urls: animations,
      });

      return {
        ...state,
        animations,
        status: 'animations_generated',
        progress: 80,
        currentStage: 'Animations generated',
      };
    } catch (error) {
      console.error('Error generating animations:', error);

      // Update job status
      await updateVideoJobStatus(state.jobId, {
        status: 'failed',
        current_stage: 'Animation generation failed',
        error_message: error.message,
      });

      return {
        ...state,
        errors: [...(state.errors || []), { stage: 'animation', error: error.message }],
        retryCount: { ...state.retryCount, animation: (state.retryCount.animation || 0) + 1 },
        status: 'failed',
        currentStage: 'Animation generation failed',
      };
    }
  });

  workflow.addNode('finalizeVideo', async (state) => {
    try {
      console.log('Finalizing video');

      // Update job status
      await updateVideoJobStatus(state.jobId, {
        progress: 90,
        current_stage: 'Combining animations and narrations into final video',
      });

      // Compose the final video from animations and narrations
      const videoUrl = await composeVideo(
        state.animations || {},
        state.narrations || {},
        state.jobId
      );

      // Update job status
      await updateVideoJobStatus(state.jobId, {
        status: 'completed',
        progress: 100,
        current_stage: 'Video generation complete',
        video_url: videoUrl,
        narration_urls: state.narrations,
        animation_urls: state.animations
      });

      return {
        ...state,
        videoUrl,
        status: 'completed',
        progress: 100,
        currentStage: 'Video generation complete',
      };
    } catch (error) {
      console.error('Error finalizing video:', error);

      // Update job status
      await updateVideoJobStatus(state.jobId, {
        status: 'failed',
        current_stage: 'Video finalization failed',
        error_message: error.message,
      });

      return {
        ...state,
        errors: [...(state.errors || []), { stage: 'finalize', error: error.message }],
        status: 'failed',
        currentStage: 'Video finalization failed',
      };
    }
  });

  // Define the edges
  workflow.addEdge('generateScript', 'generateNarration');
  workflow.addEdge('generateNarration', 'generateAnimations');
  workflow.addEdge('generateAnimations', 'finalizeVideo');
  workflow.addEdge('finalizeVideo', END);

  // Define conditional edges for error handling
  workflow.addConditionalEdges(
    'generateScript',
    (state) => {
      if (state.errors?.some(e => e.stage === 'script') && state.retryCount?.script < 3) {
        return 'retryScript';
      }
      if (state.errors?.some(e => e.stage === 'script')) {
        return END;
      }
      return 'generateNarration';
    },
    {
      retryScript: 'generateScript',
      generateNarration: 'generateNarration',
      [END]: END,
    }
  );

  // Compile the graph
  return workflow;
}

// Function to run the workflow
export async function runVideoWorkflow(jobId: string, topic: string) {
  const workflow = createVideoWorkflow();
  const graph = workflow.compile();

  // Initialize the state
  const initialState: VideoGenerationState = {
    jobId,
    topic,
    status: 'pending',
    progress: 0,
    currentStage: 'Initializing',
    errors: [],
    retryCount: {},
  };

  // Run the workflow
  try {
    const result = await graph.invoke(initialState);
    return result;
  } catch (error) {
    console.error(`Error running workflow for job ${jobId}:`, error);

    // Update job status
    await updateVideoJobStatus(jobId, {
      status: 'failed',
      current_stage: 'Workflow execution failed',
      error_message: error.message,
    });

    throw error;
  }
}
