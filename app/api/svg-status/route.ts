import { NextRequest, NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

// In-memory cache for SVG generation status
// In a production app, you'd use Redis or another distributed cache
const svgGenerationStatus = new Map<
  string,
  {
    status: "pending" | "completed" | "failed";
    svgData?: string;
    error?: string;
  }
>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, prompt } = body;

    if (!messageId) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    // Check if we already have a status for this message
    if (!svgGenerationStatus.has(messageId)) {
      // Start SVG generation
      console.log(`Starting SVG generation for message ${messageId}`);
      svgGenerationStatus.set(messageId, { status: "pending" });

      // Generate SVG in the background
      generateSvg(messageId, prompt).catch((error) => {
        console.error(`Error generating SVG for message ${messageId}:`, error);
        svgGenerationStatus.set(messageId, {
          status: "failed",
          error: error.message || "Unknown error",
        });
      });
    }

    // Return current status
    const status = svgGenerationStatus.get(messageId);
    return NextResponse.json(status);
  } catch (error) {
    console.error("Error in SVG status API:", error);
    return NextResponse.json(
      { error: "Failed to process SVG status request" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const messageId = request.nextUrl.searchParams.get("messageId");

    if (!messageId) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    // Check if we have a status for this message
    if (!svgGenerationStatus.has(messageId)) {
      return NextResponse.json(
        { error: "No SVG generation found for this message ID" },
        { status: 404 }
      );
    }

    // Return current status
    const status = svgGenerationStatus.get(messageId);
    return NextResponse.json(status);
  } catch (error) {
    console.error("Error in SVG status API:", error);
    return NextResponse.json(
      { error: "Failed to process SVG status request" },
      { status: 500 }
    );
  }
}

// Function to generate SVG
async function generateSvg(messageId: string, prompt: string) {
  try {
    // Google AI configuration
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    if (!GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY environment variable not set");
    }

    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

    // Safety settings
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    console.log(
      `Generating SVG for message ${messageId} with prompt: ${prompt}`
    );

    // Prepare the system message for SVG generation
    const systemMessage = `You are an expert at creating interactive SVG visualizations.
    Your task is to generate a visually appealing, interactive SVG based on the user's prompt.

    Guidelines:
    - Create an SVG that is 600px wide and 400px tall
    - Use vibrant colors and clear visual elements
    - Include interactive elements with hover effects where appropriate
    - Make sure the SVG is well-structured and valid
    - Include data-label attributes for interactive elements
    - The SVG should be educational and help visualize the concept
    - DO NOT include any explanations or text outside the SVG code
    - ONLY return the SVG code, nothing else
    - IMPORTANT: Your response must ONLY contain the SVG code, no markdown, no explanations

    The SVG should start with: <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
    and end with: </svg>`;

    // Create the prompt for SVG generation
    const svgPrompt = `Generate an interactive and cool looking SVG visualization for: "${prompt}"

Guidelines:
- Create an SVG that is 600px wide and 400px tall
- Use vibrant colors and clear visual elements
- Include interactive elements with hover effects where appropriate
- Make sure the SVG is well-structured and valid
- Include data-label attributes for interactive elements
- The SVG should be educational and help visualize the concept
- DO NOT include any explanations or text outside the SVG code
- ONLY return the SVG code, nothing else
- IMPORTANT: Your response must ONLY contain the SVG code, no markdown, no explanations

The SVG should start with: <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
and end with: </svg>

IMPORTANT: Your response must ONLY contain the SVG code, no markdown, no explanations, no additional text. Just the raw SVG code starting with <svg and ending with </svg>.`;

    // Initialize the Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4000,
      },
      safetySettings,
    });

    console.log(
      `Gemini API request sent with model: gemini-2.0-flash for message ${messageId}`
    );

    // Generate the SVG content
    const result = await model.generateContent(svgPrompt);
    const response = result.response;

    if (!response) {
      throw new Error("No response received from the AI model.");
    }

    // Extract the SVG from the response
    let svgContent = response.text();
    console.log(
      `Raw SVG response for message ${messageId} (first 100 chars):`,
      svgContent.substring(0, 100)
    );

    // Clean up the SVG content (remove markdown code blocks if present)
    svgContent = svgContent
      .replace(/```svg\\n/g, "")
      .replace(/```xml\\n/g, "")
      .replace(/```html\\n/g, "")
      .replace(/```/g, "");

    // Ensure the SVG starts and ends correctly
    if (!svgContent.trim().startsWith("<svg")) {
      const svgStart = svgContent.indexOf("<svg");
      if (svgStart !== -1) {
        svgContent = svgContent.substring(svgStart);
        console.log(`Extracted SVG starting tag for message ${messageId}`);
      } else {
        console.error(`No SVG tag found in response for message ${messageId}`);
        throw new Error("No SVG found in the response");
      }
    }

    if (!svgContent.trim().endsWith("</svg>")) {
      const svgEnd = svgContent.lastIndexOf("</svg>");
      if (svgEnd !== -1) {
        svgContent = svgContent.substring(0, svgEnd + 6);
        console.log(`Extracted SVG ending tag for message ${messageId}`);
      } else {
        console.error(
          `No closing SVG tag found in response for message ${messageId}`
        );
        throw new Error("Incomplete SVG in the response");
      }
    }

    // Final validation check
    if (!svgContent.includes("<svg") || !svgContent.includes("</svg>")) {
      console.error(`SVG validation failed for message ${messageId}`);
      throw new Error("Invalid SVG content");
    }

    console.log(
      `Final SVG content length for message ${messageId}:`,
      svgContent.length
    );

    // Update status with completed SVG
    svgGenerationStatus.set(messageId, {
      status: "completed",
      svgData: svgContent,
    });

    return svgContent;
  } catch (error) {
    console.error(`Error generating SVG for message ${messageId}:`, error);

    // Update status with error
    svgGenerationStatus.set(messageId, {
      status: "failed",
      error: error.message || "Unknown error",
    });

    throw error;
  }
}
