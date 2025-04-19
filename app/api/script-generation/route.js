/**
 * API route for script-only generation
 */
import { NextResponse } from 'next/server';

// Initialize Gemini for script generation
const scriptGenerator = require('../../../lib/ai/scriptGenerator');

// Initialize Gemini API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
scriptGenerator.initialize(GEMINI_API_KEY);

/**
 * POST handler for script generation
 * @param {Request} request - The request object
 * @returns {Promise<Response>} The response object
 */
export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { prompt, options } = body;
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }
    
    // Determine which model to use
    const modelName = options?.scriptModel === 'gemini-2.5-flash' 
      ? 'gemini-2.5-flash' 
      : 'gemini-2.0-flash';
    
    console.log(`Generating script using ${modelName}...`);
    
    // Generate script with timeline using Gemini
    const script = await scriptGenerator.generateScript(prompt, { model: modelName });
    
    // Return the script
    return NextResponse.json({
      success: true,
      script,
      generatedWith: modelName
    });
    
  } catch (error) {
    console.error('Error generating script:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
