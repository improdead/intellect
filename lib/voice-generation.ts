import { ElevenLabsClient } from 'elevenlabs';
import fs from 'fs';
import path from 'path';
import { uploadFile } from './supabase';

// Initialize Eleven Labs
const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY || 'sk_bffc819ab6425ffdaa3cb93ca2874200a0dc39be57cb6db6db6db';
const elevenLabs = new ElevenLabsClient({
  apiKey: ELEVEN_LABS_API_KEY,
});

// Voice ID for a male voice (you can change this to any voice ID from Eleven Labs)
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Adam voice

export async function generateVoiceNarration(text: string, jobId: string, sectionId?: string) {
  try {
    console.log(`Generating voice for text (length: ${text.length} chars)`);

    // Limit text length to avoid API issues
    const limitedText = text.substring(0, 5000);

    // Generate audio using Eleven Labs
    const audioResponse = await elevenLabs.generate({
      voice: VOICE_ID,
      text: limitedText,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    });

    // Get audio as ArrayBuffer
    const audioBuffer = await audioResponse.arrayBuffer();

    // Create a unique filename
    const fileId = sectionId ? `${jobId}_${sectionId}` : jobId;
    const fileName = `audio_${fileId}.mp3`;

    // Upload to Supabase
    const publicUrl = await uploadFile(`audio/${fileName}`, Buffer.from(audioBuffer));

    return publicUrl;
  } catch (error) {
    console.error('Error generating voice narration:', error);
    throw new Error(`Voice generation failed: ${error.message}`);
  }
}

export async function generateSectionNarrations(script: any, jobId: string) {
  const narrations: Record<string, string> = {};

  try {
    console.log('Generating narrations in parallel for all sections');

    // Prepare all narration tasks
    const narrationTasks = [
      // Introduction
      {
        key: 'introduction',
        text: `${script.title}. ${script.introduction}`,
        sectionId: 'intro'
      },

      // All sections
      ...script.sections.map((section, i) => ({
        key: `section_${i}`,
        text: `${section.title}. ${section.content}`,
        sectionId: `section_${i}`
      })),

      // Conclusion
      {
        key: 'conclusion',
        text: script.conclusion,
        sectionId: 'conclusion'
      }
    ];

    // Generate all narrations in parallel
    const results = await Promise.all(
      narrationTasks.map(task =>
        generateVoiceNarration(task.text, jobId, task.sectionId)
          .then(url => ({ key: task.key, url }))
          .catch(error => {
            console.error(`Error generating narration for ${task.key}:`, error);
            return { key: task.key, url: null, error };
          })
      )
    );

    // Process results
    for (const result of results) {
      if (result.url) {
        narrations[result.key] = result.url;
      } else {
        console.warn(`Failed to generate narration for ${result.key}, using fallback`);
        narrations[result.key] = '/fallback-audio.mp3';
      }
    }

    return narrations;
  } catch (error) {
    console.error('Error generating section narrations:', error);
    throw new Error(`Section narration generation failed: ${error.message}`);
  }
}
