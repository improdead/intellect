import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ElevenLabs } from "elevenlabs";
import fs from 'fs';
import path from 'path';

// Initialize Google AI
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
if (!GOOGLE_API_KEY) {
  console.error("GOOGLE_API_KEY environment variable not set");
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
    // 1. Generate script
    updateJobStatus(jobId, {
      status: "in_progress",
      progress: 10,
      currentStage: "Generating script with Gemini 2.0 Pro",
    });

    const scriptData = await generateScript(topic);
    
    updateJobStatus(jobId, {
      status: "in_progress",
      progress: 30,
      currentStage: "Script generated",
      script: scriptData,
    });

    // 2. Generate voice narration
    updateJobStatus(jobId, {
      status: "in_progress",
      progress: 40,
      currentStage: "Generating voice narration",
    });

    // Prepare the narration text
    const narrationText = `${scriptData.title}. ${scriptData.introduction} `;
    
    let audioUrl = '';
    try {
      // Generate audio using Eleven Labs
      const audioResponse = await elevenLabs.generate({
        voice: "21m00Tcm4TlvDq8ikWAM", // Adam voice
        text: narrationText.substring(0, 5000), // Limit text length
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      });

      // Create directory for storing audio
      const audioDir = path.join(process.cwd(), 'public', 'generated', 'audio');
      fs.mkdirSync(audioDir, { recursive: true });
      
      // Save the audio file
      const audioBuffer = await audioResponse.arrayBuffer();
      const audioFileName = `audio_${jobId}.mp3`;
      const audioPath = path.join(audioDir, audioFileName);
      fs.writeFileSync(audioPath, Buffer.from(audioBuffer));
      
      // Set the public URL
      audioUrl = `/generated/audio/${audioFileName}`;
      
      updateJobStatus(jobId, {
        status: "in_progress",
        progress: 60,
        currentStage: "Voice narration generated",
        audioUrl: audioUrl,
      });
    } catch (audioError) {
      console.error("Error generating audio:", audioError);
      // Continue without audio
      updateJobStatus(jobId, {
        status: "in_progress",
        progress: 60,
        currentStage: "Voice generation failed, continuing without audio",
      });
    }

    // 3. Generate images (simulated for now)
    updateJobStatus(jobId, {
      status: "in_progress",
      progress: 70,
      currentStage: "Generating images",
    });

    // Simulate image generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 4. Compose video (simulated for now)
    updateJobStatus(jobId, {
      status: "in_progress",
      progress: 90,
      currentStage: "Composing final video",
    });

    // Simulate video composition
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 5. Complete the job
    updateJobStatus(jobId, {
      status: "completed",
      progress: 100,
      currentStage: "Video generation complete",
      videoUrl: "https://fs-opennote-us-east-1.s3.us-east-1.amazonaws.com/2025-04-18T15:09:11.338354---1551e7de-1c67-11f0-9c6f-0afffc63bc59---output.mp4",
    });
  } catch (error) {
    console.error(`Error generating video for job ${jobId}:`, error);
    updateJobStatus(jobId, {
      status: "failed",
      currentStage: "Failed",
      error: error.message,
    });
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

    // Create a prompt for educational video script
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
          "animationNotes": "Notes for animations if needed"
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
      const jsonMatch = scriptText.match(/\\{[\\s\\S]*\\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      
      const jsonStr = jsonMatch[0];
      const scriptData = JSON.parse(jsonStr);
      
      // Validate the structure
      if (!scriptData.title || !scriptData.introduction || !Array.isArray(scriptData.sections) || !scriptData.conclusion) {
        throw new Error("Invalid script structure");
      }
      
      return scriptData;
    } catch (parseError) {
      console.error("Error parsing script JSON:", parseError);
      console.log("Raw script text:", scriptText);
      
      // Fallback: Return a basic structure if JSON parsing fails
      return {
        title: `Video about ${topic}`,
        introduction: "Introduction to the topic",
        sections: [
          {
            title: "Key Concepts",
            content: scriptText.substring(0, 500) + "...",
            visualDescription: `Visualization of ${topic}`,
            animationNotes: ""
          }
        ],
        conclusion: "Thank you for watching"
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
