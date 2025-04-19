/**
 * Eleven Labs voice generation utility
 */
const { stream } = require('elevenlabs');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

// Eleven Labs API key
const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY || 'sk_bffc819ab6425ffdaa3cb93ca2874200a0dc39be57cb6db2';

// Default voice ID (Rachel)
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

/**
 * Generate voice narration from text
 * @param {string} text - The text to convert to speech
 * @param {string} outputPath - Path to save the audio file
 * @param {Object} options - Voice generation options
 * @param {string} options.voiceId - Eleven Labs voice ID
 * @param {number} options.stability - Voice stability (0-1)
 * @param {number} options.similarityBoost - Voice similarity boost (0-1)
 * @returns {Promise<string>} Path to the generated audio file
 */
async function generateVoice(text, outputPath, options = {}) {
  try {
    // Ensure the directory exists
    const dir = path.dirname(outputPath);
    await mkdirAsync(dir, { recursive: true }).catch(() => {});

    // Set default options
    const voiceId = options.voiceId || DEFAULT_VOICE_ID;
    const stability = options.stability || 0.5;
    const similarityBoost = options.similarityBoost || 0.75;

    // Generate audio using Eleven Labs API
    const audioStream = await stream({
      apiKey: ELEVEN_LABS_API_KEY,
      voiceId: voiceId,
      textInput: text,
      stability: stability,
      similarityBoost: similarityBoost,
      outputFormat: 'mp3'
    });

    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Save to file
    await writeFileAsync(outputPath, buffer);

    return outputPath;
  } catch (error) {
    console.error('Error generating voice:', error);
    throw error;
  }
}

/**
 * Generate voice narration for a script with timeline
 * @param {string} script - The script with timeline
 * @param {string} outputDir - Directory to save audio files
 * @param {Object} options - Voice generation options
 * @returns {Promise<Array>} Array of segment objects with audio paths
 */
async function generateVoiceForScript(script, outputDir, options = {}) {
  try {
    // Parse the script into segments
    const segments = parseScript(script);

    // Generate voice for each segment
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const outputPath = path.join(outputDir, `segment_${i}.mp3`);

      // Generate voice for this segment
      segment.audioPath = await generateVoice(segment.content, outputPath, options);
    }

    return segments;
  } catch (error) {
    console.error('Error generating voice for script:', error);
    throw error;
  }
}

/**
 * Parse a script with timeline into segments
 * @param {string} script - The script with timeline
 * @returns {Array} Array of segment objects
 */
function parseScript(script) {
  const segments = [];
  const lines = script.split('\n');

  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) continue;

    // Try to match timeline pattern (e.g., "0:00-0:30: Introduction to topic")
    const timelineMatch = line.match(/(\d+):(\d+)\s*-\s*(\d+):(\d+)\s*:\s*(.*)/);

    if (timelineMatch) {
      const startMin = parseInt(timelineMatch[1]);
      const startSec = parseInt(timelineMatch[2]);
      const endMin = parseInt(timelineMatch[3]);
      const endSec = parseInt(timelineMatch[4]);
      const content = timelineMatch[5].trim();

      segments.push({
        startTime: `${startMin}:${startSec.toString().padStart(2, '0')}`,
        endTime: `${endMin}:${endSec.toString().padStart(2, '0')}`,
        startSeconds: startMin * 60 + startSec,
        endSeconds: endMin * 60 + endSec,
        duration: (endMin * 60 + endSec) - (startMin * 60 + startSec),
        content
      });
    } else {
      // If no timeline pattern, add to the last segment's content if it exists
      if (segments.length > 0) {
        segments[segments.length - 1].content += ' ' + line.trim();
      }
    }
  }

  return segments;
}

module.exports = {
  generateVoice,
  generateVoiceForScript,
  parseScript
};
