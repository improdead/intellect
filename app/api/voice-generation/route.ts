import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";
import fs from 'fs';
import path from 'path';

// Initialize Eleven Labs
const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY || "sk_bffc819ab6425ffdaa3cb93ca2874200a0dc39be57cb6db6db6db";
const elevenLabs = new ElevenLabsClient({
  apiKey: ELEVEN_LABS_API_KEY,
});

// Voice ID for a male voice (you can change this to any voice ID from Eleven Labs)
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Adam voice

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    console.log("Generating voice for text (first 100 chars):", text.substring(0, 100));

    try {
      // Generate audio using Eleven Labs
      const audioResponse = await elevenLabs.generate({
        voice: VOICE_ID,
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      });

      // Get audio as ArrayBuffer
      const audioBuffer = await audioResponse.arrayBuffer();

      // Create directory for storing audio files
      const audioDir = path.join(process.cwd(), 'public', 'generated', 'audio');
      fs.mkdirSync(audioDir, { recursive: true });

      // Save the audio file
      const audioName = `audio_${Date.now()}.mp3`;
      const audioPath = path.join(audioDir, audioName);
      fs.writeFileSync(audioPath, Buffer.from(audioBuffer));

      // Return the public URL
      const audioUrl = `/generated/audio/${audioName}`;

      return NextResponse.json({ audioUrl });
    } catch (elevenLabsError) {
      console.error("Eleven Labs API error:", elevenLabsError);

      // Return a fallback audio URL
      return NextResponse.json({
        audioUrl: "/fallback-audio.mp3",
        fallback: true
      });
    }
  } catch (error) {
    console.error("Error generating voice:", error);
    return NextResponse.json(
      { error: "Failed to generate voice", details: error.message },
      { status: 500 }
    );
  }
}
