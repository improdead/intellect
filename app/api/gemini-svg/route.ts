import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

// Create the Google Generative AI model for SVG generation
const svgModel = google("gemini-2.0-flash");

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    // Generate SVG content using the AI SDK
    const result = await generateText({
      model: svgModel,
      prompt: `
        Create an SVG visualization to help explain or illustrate concepts related to this question: "${query}"

        The SVG should:
        1. Be educational and visually appealing
        2. Use a color scheme that's easy on the eyes
        3. Include appropriate labels and visual elements
        4. Be self-contained (no external dependencies)
        5. Have a width and height of 100% with a viewBox of "0 0 800 500"
        6. Use animations where appropriate to enhance understanding
        7. Include a title element

        Return ONLY the complete SVG code with no explanation or markdown formatting.
        The SVG should start with <svg> and end with </svg>.
      `,
      temperature: 0.7, // Add some creativity for the visualization
      maxTokens: 4000, // SVGs can be quite large
    });

    const svgText = result.text;

    // Extract just the SVG code
    const svgMatch = svgText.match(/<svg[\s\S]*<\/svg>/);
    const svgCode = svgMatch ? svgMatch[0] : generateFallbackSVG(query);

    return NextResponse.json({ svgData: svgCode });
  } catch (error) {
    console.error("Error generating SVG:", error);
    return NextResponse.json({
      svgData: generateFallbackSVG(query),
      error: "Failed to generate SVG visualization",
    });
  }
}

function generateFallbackSVG(query: string): string {
  // Create a simple fallback SVG if generation fails
  return `
    <svg width="100%" height="100%" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4F46E5" stop-opacity="0.2" />
          <stop offset="100%" stop-color="#8B5CF6" stop-opacity="0.2" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="#1F2937" rx="15" ry="15" />
      <rect x="50" y="50" width="700" height="400" fill="url(#bg-gradient)" rx="10" ry="10" />
      <text x="400" y="150" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle">Visualization</text>
      <text x="400" y="200" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle" opacity="0.8">for</text>
      <text x="400" y="250" font-family="Arial, sans-serif" font-size="20" fill="white" text-anchor="middle" font-style="italic">"${query.substring(
        0,
        50
      )}${query.length > 50 ? "..." : ""}"</text>
      <g transform="translate(400, 350)">
        <circle cx="0" cy="0" r="40" fill="#4F46E5" opacity="0.6">
          <animate attributeName="r" values="40;45;40" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0.8;0.6" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="0" cy="0" r="20" fill="#8B5CF6" opacity="0.8">
          <animate attributeName="r" values="20;25;20" dur="3s" repeatCount="indefinite" begin="0.5s" />
        </circle>
      </g>
    </svg>
  `;
}
