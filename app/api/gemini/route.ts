import { google } from "@ai-sdk/google";
import { StreamingTextResponse } from "ai";
import { NextRequest } from "next/server";

// Create the Google Generative AI model with safety settings
const model = google("gemini-2.0-flash", {
  safetySettings: [
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
  ],
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];
    const query = lastMessage.content;

    // Check if an SVG visualization would enhance the response based on keywords
    const visualTopics = [
      "diagram",
      "chart",
      "graph",
      "visualization",
      "flow",
      "process",
      "architecture",
      "structure",
      "system",
      "network",
      "relationship",
      "concept",
      "model",
      "framework",
      "hierarchy",
      "timeline",
      "cycle",
      "comparison",
      "physics",
      "math",
      "chemistry",
      "biology",
      "algorithm",
      "data structure",
      "quantum",
      "neural network",
      "machine learning",
    ];

    const needsSvg = visualTopics.some((topic) =>
      query.toLowerCase().includes(topic.toLowerCase())
    );

    // System prompt to prepend
    const systemPrompt = `You are an AI learning assistant called Intelect.
    Format your responses using Markdown for better readability.
    Use headings (## for main sections, ### for subsections), **bold** for important concepts,
    *italic* for emphasis, bullet points for lists, and code blocks for code or formulas.
    ${
      needsSvg
        ? "I'll be creating an SVG visualization to accompany your response, so focus on explaining concepts clearly."
        : ""
    }
    `;

    // Prepare messages with system prompt
    const formattedMessages = [
      { role: "user", content: systemPrompt },
      { role: "assistant", content: "I'll follow these instructions." },
      ...messages,
    ];

    // Generate streaming response using the AI SDK
    const { stream } = await model.streamText({
      messages: formattedMessages,
    });

    // Add custom header for SVG flag
    const headers = new Headers();
    headers.set("X-Needs-SVG", needsSvg.toString());

    // Return the streaming response with headers
    return new StreamingTextResponse(stream, { headers });
  } catch (error) {
    console.error("Error in Gemini API:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process your request" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
