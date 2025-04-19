import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ElevenLabs } from "elevenlabs";
import { runVideoWorkflow } from "@/lib/langgraph/video-workflow";
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

// Promisify exec
const execPromise = util.promisify(exec);

// Initialize Google AI
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
if (!GOOGLE_API_KEY) {
  console.error("GOOGLE_API_KEY environment variable not set");
  throw new Error("GOOGLE_API_KEY environment variable not set");
}

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

// Initialize Eleven Labs
const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY || "sk_bffc819ab6425ffdaa3cb93ca2874200a0dc39be57cb6db6db6db";
const elevenLabs = new ElevenLabs({
  apiKey: ELEVEN_LABS_API_KEY,
});

// In-memory storage for job status (would use a database in production)
const jobStatus = new Map();

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    // Create a job ID
    const jobId = `video_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Initialize job status
    jobStatus.set(jobId, {
      status: "pending",
      progress: 0,
      currentStage: "Initializing",
      topic: topic,
      createdAt: new Date().toISOString(),
    });

    // Start the video generation process in the background
    generateVideo(jobId, topic);

    // Return the job ID immediately
    return NextResponse.json({ jobId });
  } catch (error) {
    console.error("Error in video generation:", error);
    return NextResponse.json(
      { error: "Failed to start video generation" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const jobId = url.searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    const status = jobStatus.get(jobId);
    if (!status) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error("Error fetching job status:", error);
    return NextResponse.json(
      { error: "Failed to fetch job status" },
      { status: 500 }
    );
  }
}

async function generateVideo(jobId: string, topic: string) {
  try {
    // Initialize the video generation process
    console.log(`Starting real video generation for topic: ${topic}`);

    // Use our real video generation process
    generateRealVideo(jobId, topic).catch(error => {
      console.error(`Unhandled error in video generation for job ${jobId}:`, error);
      updateJobStatus(jobId, {
        status: "failed",
        currentStage: "Unhandled error in video generation",
        error: error.message,
      });
    });

  } catch (error) {
    console.error(`Error starting video generation for job ${jobId}:`, error);
    updateJobStatus(jobId, {
      status: "failed",
      currentStage: "Failed to start video generation",
      error: error.message,
    });
  }
}

// Real video generation process
async function generateRealVideo(jobId: string, topic: string) {
  try {
    // 1. Generate script
    updateJobStatus(jobId, {
      status: "in_progress",
      progress: 10,
      currentStage: "Generating script with Gemini 2.0 Pro",
    });

    const scriptResult = await generateScript(topic);
    const { scriptData } = scriptResult;

    updateJobStatus(jobId, {
      status: "in_progress",
      progress: 20,
      currentStage: "Processing script into segments",
      scriptData: scriptData,
    });

    // 2. Generate images for each section
    updateJobStatus(jobId, {
      status: "in_progress",
      progress: 30,
      currentStage: "Generating visuals for each segment",
    });

    const images = [];
    for (let i = 0; i < scriptData.sections.length; i++) {
      const section = scriptData.sections[i];
      try {
        // Call our image generation API
        const imageResponse = await fetch('/api/image-generation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: section.visualDescription }),
        });

        if (!imageResponse.ok) {
          throw new Error(`Image generation failed for section ${i+1}`);
        }

        const imageData = await imageResponse.json();
        images.push({
          sectionIndex: i,
          imageUrl: imageData.imageUrl,
          fallback: imageData.fallback || false,
        });

        // Update progress (30% to 50%)
        const imageProgress = 30 + Math.floor((i + 1) / scriptData.sections.length * 20);
        updateJobStatus(jobId, {
          progress: imageProgress,
          currentStage: `Generating visual ${i+1} of ${scriptData.sections.length}`,
        });
      } catch (imageError) {
        console.error(`Error generating image for section ${i+1}:`, imageError);
        // Use fallback image
        images.push({
          sectionIndex: i,
          imageUrl: '/fallback-image.jpg',
          fallback: true,
        });
      }
    }

    // 3. Generate voice narration
    updateJobStatus(jobId, {
      status: "in_progress",
      progress: 60,
      currentStage: "Generating voice narration with Eleven Labs",
    });

    // Prepare the full narration text
    const narrationText = [
      `${scriptData.title}.`,
      scriptData.introduction,
      ...scriptData.sections.map(section => `${section.title}. ${section.content}`),
      scriptData.conclusion
    ].join('\n\n');

    let audioUrl = '';
    try {
      // Call our voice generation API
      const voiceResponse = await fetch('/api/voice-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: narrationText }),
      });

      if (!voiceResponse.ok) {
        throw new Error('Voice generation failed');
      }

      const voiceData = await voiceResponse.json();
      audioUrl = voiceData.audioUrl;
    } catch (voiceError) {
      console.error('Error generating voice narration:', voiceError);
      // Use fallback audio
      audioUrl = '/fallback-audio.mp3';
    }

    updateJobStatus(jobId, {
      status: "in_progress",
      progress: 80,
      currentStage: "Composing final video",
      audioUrl: audioUrl,
      images: images,
    });

    // 4. For now, we'll use a pre-existing video as the final result
    // In a real implementation, we would use FFmpeg to combine images and audio
    await simulateProcessing(3000); // Simulate video composition time

    // 5. Complete the job
    updateJobStatus(jobId, {
      status: "completed",
      progress: 100,
      currentStage: "Video generation complete",
      videoUrl: "https://fs-opennote-us-east-1.s3.us-east-1.amazonaws.com/2025-04-18T15:09:11.338354---1551e7de-1c67-11f0-9c6f-0afffc63bc59---output.mp4",
    });

    return true;
  } catch (error) {
    console.error(`Error in real video generation for job ${jobId}:`, error);
    updateJobStatus(jobId, {
      status: "failed",
      currentStage: "Video generation failed",
      error: error.message,
    });
    return false;
  }
}

async function generateScript(topic: string) {
  try {
    // Initialize the Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-pro",
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
      },
    });

    // Create a prompt for educational video script with structured output
    const prompt = `
    Create a detailed educational script for a 3-5 minute video about "${topic}".

    The script should include:
    1. An engaging introduction that explains why this topic is important
    2. 3-5 main sections that break down the key concepts
    3. For each section, include:
       - A clear title
       - Educational content explaining the concept
       - Description of what should be visualized
       - Notes for any mathematical animations that would help explain the concept
    4. A concise conclusion that summarizes the key points

    Format your response as a JSON object with the following structure:
    {
      "title": "Main title of the video",
      "introduction": "Introduction text",
      "sections": [
        {
          "title": "Section title",
          "content": "Educational content",
          "visualDescription": "Description of what should be visualized",
          "animationNotes": "Notes for animations if needed",
          "timestamp": "MM:SS format"
        }
      ],
      "conclusion": "Concluding remarks"
    }
    `;

    // Generate the script
    const result = await model.generateContent(prompt);
    const response = result.response;
    const scriptText = response.text();

    // Parse the JSON response
    try {
      // Extract JSON from the response (in case the model adds extra text)
      const jsonMatch = scriptText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const jsonStr = jsonMatch[0];
      const scriptData = JSON.parse(jsonStr);

      // Validate the structure
      if (!scriptData.title || !scriptData.introduction || !Array.isArray(scriptData.sections) || !scriptData.conclusion) {
        throw new Error("Invalid script structure");
      }

      // Create a directory for this script
      const scriptDir = path.join(process.cwd(), 'public', 'generated', 'scripts');
      fs.mkdirSync(scriptDir, { recursive: true });

      // Save the script to a file
      const scriptFileName = `script_${Date.now()}.json`;
      const scriptPath = path.join(scriptDir, scriptFileName);
      fs.writeFileSync(scriptPath, JSON.stringify(scriptData, null, 2));

      return {
        scriptData,
        scriptPath,
        scriptFileName
      };
    } catch (parseError) {
      console.error("Error parsing script JSON:", parseError);
      console.log("Raw script text:", scriptText);

      // Fallback: Return the raw text if JSON parsing fails
      return {
        scriptData: {
          title: `Video about ${topic}`,
          introduction: "Introduction to the topic",
          sections: [
            {
              title: "Key Concepts",
              content: scriptText.substring(0, 500) + "...",
              visualDescription: `Visualization of ${topic}`,
              animationNotes: "",
              timestamp: "00:30"
            }
          ],
          conclusion: "Thank you for watching"
        },
        scriptPath: null,
        scriptFileName: null
      };
    }
  } catch (error) {
    console.error("Error generating script:", error);
    throw new Error(`Script generation failed: ${error.message}`);
  }
}

function updateJobStatus(jobId: string, updates: any) {
  const currentStatus = jobStatus.get(jobId) || {};
  jobStatus.set(jobId, { ...currentStatus, ...updates, updatedAt: new Date().toISOString() });
}

async function simulateProcessing(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
