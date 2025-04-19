import { NextResponse } from "next/server";

export async function GET() {
  // Check Google API key without exposing its actual value
  const googleApiKey = process.env.GOOGLE_API_KEY;
  const googleAiModel = process.env.GOOGLE_AI_MODEL || "gemini-2.0-flash";
  
  return NextResponse.json({
    status: "Google API configuration check",
    googleApiKeySet: !!googleApiKey,
    googleApiKeyLength: googleApiKey ? googleApiKey.length : 0,
    googleAiModel: googleAiModel,
    nodeEnv: process.env.NODE_ENV
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
