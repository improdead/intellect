import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Google API Key for Gemini 2.0 Flash (for text responses)
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  console.error("GOOGLE_API_KEY environment variable not set");
  throw new Error("GOOGLE_API_KEY environment variable not set");
}

// OpenRouter API Key for DeepSeek Chat v3 (for SVG generation)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = "deepseek/deepseek-chat-v3-0324:free";

if (!OPENROUTER_API_KEY) {
  console.error("OPENROUTER_API_KEY environment variable not set");
  throw new Error("OPENROUTER_API_KEY environment variable not set");
}

// Create the Google Generative AI model with safety settings
const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = googleAI.getGenerativeModel({
  model: "gemini-2.0-flash", // Using Gemini 2.0 Flash - the correct model name
  safetySettings: [
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
  ],
});

// For fallback SVG generation
const genAI = GOOGLE_API_KEY ? new GoogleGenerativeAI(GOOGLE_API_KEY) : null;

interface RequestBody {
  prompt: string;
  previousSVG?: string;
}

export async function POST(request: NextRequest) {
  // Define promptString at the function level so it's accessible in the catch block
  let promptString = '';

  try {
    const body: RequestBody = await request.json();
    const { prompt, previousSVG } = body;

    // Ensure prompt is a string
    promptString = typeof prompt === 'string' ? prompt : '';

    if (!promptString) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    console.log("Generating text and SVG for prompt:", promptString);

    // Step 1: Generate text response using Gemini
    let textResponse;
    try {
      textResponse = await generateTextResponse(promptString);
      console.log("Successfully generated text response");
    } catch (textError) {
      console.error("Error generating text response:", textError);
      // Generate a fallback text response
      textResponse = `Hello! 👋 I'd be happy to help you learn about ${promptString}!

I'm currently experiencing some technical difficulties with generating a detailed response. Please try again in a moment, or rephrase your question.

In the meantime, I'll try to provide a basic overview of ${promptString} with the visualization below.`;
    }

    // Step 2: Generate SVG visualization based on the prompt
    let svgData;
    try {
      svgData = await generateSVG(promptString, previousSVG);
      console.log("Successfully generated SVG visualization");
    } catch (svgError) {
      console.error("Error generating SVG:", svgError);
      // Generate a fallback SVG
      svgData = generateFallbackSVG(promptString || 'generic concept');
      console.log("Generated fallback SVG");
    }

    // Return both the text response and SVG data
    return NextResponse.json({
      textResponse,
      svgData
    });
  } catch (error) {
    console.error("Error in text-with-svg API:", error);
    // Log additional information about the error
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");

    // Generate fallback responses
    const textResponse = `I encountered an issue while processing your request about "${promptString}". Let me provide a basic explanation instead.

## ${promptString}

This topic involves several key concepts and principles that are important to understand. While I couldn't generate a complete response, I can offer some general information.

The study of ${promptString} typically involves examining its structure, function, and relationships with other concepts in the field.

Would you like me to try again or focus on a specific aspect of this topic?`;

    // Generate a fallback SVG
    console.log("Generating fallback SVG");
    const svgData = generateFallbackSVG(promptString || 'generic concept');

    return NextResponse.json({
      textResponse,
      svgData,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Function to generate text response using Gemini
async function generateTextResponse(prompt: string): Promise<string> {
  try {
    // System prompt to prepend - designed to generate responses like the protein structure example
    const systemPrompt = `You are an AI learning assistant called Intellect.

    IMPORTANT FORMATTING INSTRUCTIONS:
    1. Use a friendly, conversational tone with emoji where appropriate
    2. Start with a warm greeting and introduction to the topic
    3. Format your response with clear headings and subheadings
    4. Use emoji to highlight key points (🔑, 📌, 💡, etc.)
    5. Bold important terms and concepts with **term**
    6. Use bullet points for lists
    7. Include analogies and examples to make concepts more relatable
    8. Use a structured approach that breaks down complex topics into digestible parts
    9. End with a brief summary or invitation for further questions

    Your response should be comprehensive, educational, and engaging - similar to this example format:

    "Hello! 👋 I can certainly help you with [topic]! Let's dive into this fascinating subject! 🚀

    Understanding [Topic] 🏗️
    [Brief overview of what the topic is and why it's important]

    Key Concepts of [Topic] 🪜
    [List main concepts with emoji]

    Let's explore each in more detail! 👇

    1. [First Concept] 📜
    [Detailed explanation]
    [Example or analogy]

    2. [Second Concept] 🌀
    [Detailed explanation]
    [Example or analogy]

    3. [Third Concept] 🧶
    [Detailed explanation]
    [Example or analogy]

    4. [Fourth Concept] 🧩
    [Detailed explanation]
    [Example or analogy]"

    I'll be creating an interactive SVG visualization to accompany your response, so focus on explaining concepts that can be visually represented.
    `;

    // Prepare messages with system prompt
    const messages = [
      { role: "user", content: systemPrompt },
      { role: "assistant", content: "I'll follow these instructions and create an engaging, well-structured response with appropriate emoji and formatting." },
      { role: "user", content: `Please provide a comprehensive explanation about ${prompt}. Make it educational and engaging, similar to the example format in your instructions.` },
    ];

    // Generate response using the Google Generative AI SDK
    const result = await model.generateContent({
      contents: messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4000,
      }
    });

    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating text response:", error);
    throw new Error(`Failed to generate text response: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Function to generate SVG visualization using DeepSeek Chat v3
async function generateSVG(prompt: string, previousSVG?: string): Promise<string> {
  try {
    // Create a more detailed prompt for SVG generation that will create custom, interactive visualizations
    let svgPrompt = `Generate a beautiful, interactive SVG visualization about "${prompt}".

IMPORTANT GUIDELINES:
- Create an SVG that is 600px wide and 400px tall
- Use vibrant colors with a cohesive color scheme (blues, purples, greens, etc.)
- Make it HIGHLY INTERACTIVE with hover effects, animations, and clickable elements
- Include at least 4-6 interactive elements that respond to user actions
- Add hover effects that change colors, show tooltips, or animate elements
- Include onClick events that trigger animations or state changes
- Use clear, readable labels and titles
- Ensure the visualization is educational and clearly explains the concept
- Include data-label attributes for all interactive elements
- Make sure all text is readable against its background
- Use appropriate visual metaphors for the topic
- Include a title for the visualization

TECHNICAL REQUIREMENTS:
- The SVG must be valid and well-structured
- Include CSS animations and transitions for smooth effects
- Use <style> tags within the SVG for CSS
- Include JavaScript with <script> tags for interactivity
- Ensure all interactive elements have cursor:pointer and appropriate hover states
- DO NOT include any explanations or text outside the SVG code
- ONLY return the SVG code, nothing else

The SVG should start with: <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
and end with: </svg>

IMPORTANT: Your response must ONLY contain the SVG code, no markdown, no explanations, no additional text. Just the raw SVG code starting with <svg and ending with </svg>.`;

    // If there's a previous SVG, include it in the prompt
    if (
      previousSVG &&
      previousSVG.startsWith("<svg") &&
      previousSVG.includes("</svg>")
    ) {
      console.log("Previous SVG provided, will use for reference");
      svgPrompt = `Generate an improved or modified version of the following SVG visualization based on the prompt: "${prompt}"

Here is the previous SVG that you created:

${previousSVG}

Please create a new SVG that builds upon or improves this visualization. The user may want specific changes or improvements.

Guidelines:
- Maintain the same dimensions (600px wide and 400px tall)
- Keep the same general structure but improve or modify as needed
- Preserve any useful interactive elements and data-label attributes
- Add new elements or modify existing ones based on the prompt
- The SVG should be educational and help visualize the concept
- DO NOT include any explanations or text outside the SVG code
- ONLY return the SVG code, nothing else

The SVG should start with: <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
and end with: </svg>

IMPORTANT: Your response must ONLY contain the SVG code, no markdown, no explanations, no additional text. Just the raw SVG code starting with <svg and ending with </svg>.`;
    }

    console.log("Using DeepSeek Chat v3 for SVG generation");
    console.log("OpenRouter API Key length:", OPENROUTER_API_KEY?.length || 0);
    console.log("OpenRouter Model:", OPENROUTER_MODEL);

    // Use OpenRouter API with DeepSeek Chat v3 model
    // Create an AbortController to handle timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    // Define the type for OpenRouter response
    interface OpenRouterResponse {
      choices: Array<{
        message: {
          content: string;
        };
      }>;
    }

    let openRouterData: OpenRouterResponse | undefined;
    try {
      const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://intellect.app", // Replace with your actual domain
          "X-Title": "Intellect App"
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [
            {
              role: "system",
              content: "You are an expert at creating interactive SVG visualizations. Create visually appealing, interactive SVGs based on the user's prompt. Only return the SVG code, no explanations."
            },
            {
              role: "user",
              content: svgPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      // Clear the timeout
      clearTimeout(timeoutId);

      if (!openRouterResponse.ok) {
        const errorData = await openRouterResponse.text();
        console.error("OpenRouter API error:", errorData);
        console.error("OpenRouter API status:", openRouterResponse.status);
        console.error("OpenRouter API headers:", JSON.stringify(Object.fromEntries([...openRouterResponse.headers])));
        throw new Error(`OpenRouter API error: ${openRouterResponse.status} - ${errorData}`);
      }

      openRouterData = await openRouterResponse.json();

      if (!openRouterData.choices || openRouterData.choices.length === 0) {
        throw new Error("No response received from OpenRouter.");
      }
    } catch (error) {
      // Clear the timeout if there was an error
      clearTimeout(timeoutId);

      // Check if it was a timeout error
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('OpenRouter API request timed out after 30 seconds');
      }

      // Re-throw the error
      throw error;
    }

    // Check if we have valid data before proceeding
    if (!openRouterData || !openRouterData.choices || openRouterData.choices.length === 0) {
      throw new Error("No valid response data from OpenRouter");
    }

    // Extract the SVG from the response
    let svgContent = openRouterData.choices[0].message.content;
    console.log(
      "Raw SVG response (first 100 chars):",
      svgContent.substring(0, 100)
    );

    // Clean up the SVG content (remove markdown code blocks if present)
    svgContent = svgContent
      .replace(/```svg\n/g, "")
      .replace(/```xml\n/g, "")
      .replace(/```html\n/g, "")
      .replace(/```/g, "");

    // Ensure the SVG starts and ends correctly
    if (!svgContent.trim().startsWith("<svg")) {
      const svgStart = svgContent.indexOf("<svg");
      if (svgStart !== -1) {
        svgContent = svgContent.substring(svgStart);
        console.log("Extracted SVG starting tag");
      } else {
        console.error("No SVG tag found in response");
        throw new Error("No SVG found in the response");
      }
    }

    if (!svgContent.trim().endsWith("</svg>")) {
      const svgEnd = svgContent.lastIndexOf("</svg>");
      if (svgEnd !== -1) {
        svgContent = svgContent.substring(0, svgEnd + 6);
        console.log("Extracted SVG ending tag");
      } else {
        console.error("No closing SVG tag found in response");
        throw new Error("Incomplete SVG in the response");
      }
    }

    // Final validation check
    if (!svgContent.includes("<svg") || !svgContent.includes("</svg>")) {
      console.error("SVG validation failed");
      throw new Error("Invalid SVG content");
    }

    console.log("Final SVG content length:", svgContent.length);

    return svgContent;
  } catch (error) {
    console.error("Error generating SVG:", error);
    throw error;
  }
}

// Fallback SVG generator in case the API fails
function generateFallbackSVG(prompt: string): string {
  // Extract keywords from the prompt
  const keywords = prompt.toLowerCase().split(/\s+/);

  // Determine the type of visualization based on keywords
  let svgType = "generic";

  if (
    keywords.some((word) =>
      ["physics", "force", "motion", "newton"].includes(word)
    )
  ) {
    svgType = "physics";
  } else if (
    keywords.some((word) =>
      ["math", "equation", "formula", "calculus"].includes(word)
    )
  ) {
    svgType = "math";
  } else if (
    keywords.some((word) =>
      ["biology", "cell", "organism", "dna", "protein"].includes(word)
    )
  ) {
    svgType = "biology";
  } else if (
    keywords.some((word) =>
      ["chemistry", "molecule", "atom", "reaction"].includes(word)
    )
  ) {
    svgType = "chemistry";
  } else if (
    keywords.some((word) =>
      ["history", "timeline", "event", "war", "revolution"].includes(word)
    )
  ) {
    svgType = "history";
  }

  console.log("Fallback SVG type:", svgType);

  // Generate SVG based on type
  switch (svgType) {
    case "physics":
      return `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="400" fill="#1a1a2e"/>
        <rect x="50" y="200" width="500" height="10" fill="#e1e1e1" id="ground" data-label="Ground surface"/>
        <rect x="100" y="150" width="80" height="50" fill="#ff6b6b" id="object" data-label="Object with mass"/>
        <line x1="180" y1="175" x2="280" y2="175" stroke="#4cc9f0" stroke-width="5" marker-end="url(#arrowhead)" id="force" data-label="Applied force"/>
        <text x="300" y="50" font-family="Arial" font-size="24" fill="white" id="title">Physics Visualization</text>
        <text x="300" y="80" font-family="Arial" font-size="16" fill="white" id="subtitle">Interactive Demonstration</text>
        <text x="220" y="160" font-family="Arial" font-size="16" fill="white" id="force-label">Force</text>
        <text x="140" y="140" font-family="Arial" font-size="16" fill="white" id="mass-label">Mass</text>
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#4cc9f0"/>
          </marker>
        </defs>
      </svg>`;

    case "math":
      return `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="400" fill="#1a1a2e"/>
        <circle cx="300" cy="200" r="150" fill="none" stroke="#e1e1e1" stroke-width="2" id="unit-circle" data-label="Unit Circle"/>
        <line x1="150" y1="200" x2="450" y2="200" stroke="#e1e1e1" stroke-width="2" id="x-axis" data-label="X-Axis"/>
        <line x1="300" y1="50" x2="300" y2="350" stroke="#e1e1e1" stroke-width="2" id="y-axis" data-label="Y-Axis"/>
        <circle cx="400" cy="200" r="5" fill="#ff6b6b" id="point" data-label="Point on circle"/>
        <line x1="300" y1="200" x2="400" y2="200" stroke="#4cc9f0" stroke-width="2" id="cos-line" data-label="Cosine value"/>
        <line x1="400" y1="200" x2="400" y2="150" stroke="#4ecdc4" stroke-width="2" id="sin-line" data-label="Sine value"/>
        <path d="M 300 200 L 400 200 A 10 10 0 0 0 390 190" fill="none" stroke="#ffd166" stroke-width="2" id="angle" data-label="Angle θ"/>
        <text x="300" y="50" font-family="Arial" font-size="24" fill="white" id="title">Mathematical Concepts</text>
        <text x="300" y="80" font-family="Arial" font-size="16" fill="white" id="subtitle">Interactive Visualization</text>
      </svg>`;

    case "biology":
      return `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="400" fill="#1a1a2e"/>
        <ellipse cx="300" cy="200" rx="150" ry="100" fill="#2a9d8f" stroke="#e1e1e1" stroke-width="2" id="cell" data-label="Cell membrane"/>
        <circle cx="300" cy="200" r="40" fill="#264653" stroke="#e1e1e1" stroke-width="2" id="nucleus" data-label="Nucleus: Contains genetic material"/>
        <ellipse cx="230" cy="150" rx="25" ry="15" fill="#e76f51" stroke="#e1e1e1" stroke-width="1" id="mitochondria1" data-label="Mitochondria: Powerhouse of the cell"/>
        <ellipse cx="350" cy="230" rx="25" ry="15" fill="#e76f51" stroke="#e1e1e1" stroke-width="1" id="mitochondria2" data-label="Mitochondria: Powerhouse of the cell"/>
        <circle cx="370" cy="170" r="15" fill="#e9c46a" stroke="#e1e1e1" stroke-width="1" id="lysosome" data-label="Lysosome: Contains digestive enzymes"/>
        <path d="M 250 220 C 270 240, 290 240, 310 220" fill="none" stroke="#f4a261" stroke-width="3" id="er" data-label="Endoplasmic Reticulum: Protein synthesis"/>
        <text x="300" y="50" font-family="Arial" font-size="24" fill="white" id="title">Cell Structure</text>
        <text x="300" y="80" font-family="Arial" font-size="16" fill="white" id="subtitle">Interactive Cell Diagram</text>
      </svg>`;

    case "chemistry":
      return `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="400" fill="#1a1a2e"/>
        <circle cx="300" cy="200" r="30" fill="#264653" stroke="#e1e1e1" stroke-width="2" id="nucleus" data-label="Nucleus: Contains protons and neutrons"/>
        <circle cx="300" cy="200" r="5" fill="#e76f51" id="proton1" data-label="Proton: Positive charge"/>
        <circle cx="310" cy="195" r="5" fill="#e76f51" id="proton2" data-label="Proton: Positive charge"/>
        <circle cx="290" cy="205" r="5" fill="#2a9d8f" id="neutron1" data-label="Neutron: No charge"/>
        <circle cx="295" cy="190" r="5" fill="#2a9d8f" id="neutron2" data-label="Neutron: No charge"/>
        <ellipse cx="300" cy="200" rx="100" ry="100" fill="none" stroke="#e9c46a" stroke-width="1" stroke-dasharray="5,5" id="electron-orbit1" data-label="Electron orbit"/>
        <circle cx="400" cy="200" r="4" fill="#4cc9f0" id="electron1" data-label="Electron: Negative charge"/>
        <ellipse cx="300" cy="200" rx="70" ry="70" fill="none" stroke="#e9c46a" stroke-width="1" stroke-dasharray="5,5" id="electron-orbit2" data-label="Electron orbit"/>
        <circle cx="300" cy="130" r="4" fill="#4cc9f0" id="electron2" data-label="Electron: Negative charge"/>
        <text x="300" y="50" font-family="Arial" font-size="24" fill="white" id="title">Atomic Structure</text>
        <text x="300" y="80" font-family="Arial" font-size="16" fill="white" id="subtitle">Interactive Atom Model</text>
      </svg>`;

    case "history":
      return `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="400" fill="#1a1a2e"/>
        <line x1="100" y1="200" x2="500" y2="200" stroke="#e1e1e1" stroke-width="2" id="timeline" data-label="Timeline"/>
        <circle cx="150" cy="200" r="10" fill="#ff6b6b" id="event1" data-label="Historical Event 1"/>
        <circle cx="250" cy="200" r="10" fill="#ff6b6b" id="event2" data-label="Historical Event 2"/>
        <circle cx="350" cy="200" r="10" fill="#ff6b6b" id="event3" data-label="Historical Event 3"/>
        <circle cx="450" cy="200" r="10" fill="#ff6b6b" id="event4" data-label="Historical Event 4"/>
        <text x="150" y="230" font-family="Arial" font-size="12" fill="white" text-anchor="middle" id="date1">1700</text>
        <text x="250" y="230" font-family="Arial" font-size="12" fill="white" text-anchor="middle" id="date2">1800</text>
        <text x="350" y="230" font-family="Arial" font-size="12" fill="white" text-anchor="middle" id="date3">1900</text>
        <text x="450" y="230" font-family="Arial" font-size="12" fill="white" text-anchor="middle" id="date4">2000</text>
        <text x="150" y="170" font-family="Arial" font-size="12" fill="white" text-anchor="middle" id="event1-text">Event 1</text>
        <text x="250" y="170" font-family="Arial" font-size="12" fill="white" text-anchor="middle" id="event2-text">Event 2</text>
        <text x="350" y="170" font-family="Arial" font-size="12" fill="white" text-anchor="middle" id="event3-text">Event 3</text>
        <text x="450" y="170" font-family="Arial" font-size="12" fill="white" text-anchor="middle" id="event4-text">Event 4</text>
        <text x="300" y="50" font-family="Arial" font-size="24" fill="white" id="title">Historical Timeline</text>
        <text x="300" y="80" font-family="Arial" font-size="16" fill="white" id="subtitle">Interactive History Visualization</text>
      </svg>`;

    default: // generic
      return `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="400" fill="#1a1a2e"/>
        <circle cx="300" cy="200" r="80" fill="#2a9d8f" id="main-concept" data-label="Main concept"/>
        <circle cx="180" cy="150" r="40" fill="#e9c46a" id="related1" data-label="Related concept 1"/>
        <circle cx="420" cy="150" r="40" fill="#e9c46a" id="related2" data-label="Related concept 2"/>
        <circle cx="180" cy="250" r="40" fill="#e9c46a" id="related3" data-label="Related concept 3"/>
        <circle cx="420" cy="250" r="40" fill="#e9c46a" id="related4" data-label="Related concept 4"/>
        <line x1="230" y1="150" x2="260" y2="170" stroke="#e1e1e1" stroke-width="2" id="connection1" data-label="Connection"/>
        <line x1="370" y1="150" x2="340" y2="170" stroke="#e1e1e1" stroke-width="2" id="connection2" data-label="Connection"/>
        <line x1="230" y1="250" x2="260" y2="230" stroke="#e1e1e1" stroke-width="2" id="connection3" data-label="Connection"/>
        <line x1="370" y1="250" x2="340" y2="230" stroke="#e1e1e1" stroke-width="2" id="connection4" data-label="Connection"/>
        <text x="300" y="200" font-family="Arial" font-size="16" fill="white" text-anchor="middle" id="main-text">${
          prompt.length > 20 ? prompt.substring(0, 20) + "..." : prompt
        }</text>
        <text x="180" y="150" font-family="Arial" font-size="12" fill="white" text-anchor="middle" id="related1-text">Topic 1</text>
        <text x="420" y="150" font-family="Arial" font-size="12" fill="white" text-anchor="middle" id="related2-text">Topic 2</text>
        <text x="180" y="250" font-family="Arial" font-size="12" fill="white" text-anchor="middle" id="related3-text">Topic 3</text>
        <text x="420" y="250" font-family="Arial" font-size="12" fill="white" text-anchor="middle" id="related4-text">Topic 4</text>
        <text x="300" y="50" font-family="Arial" font-size="24" fill="white" text-anchor="middle" id="title">Interactive Visualization</text>
        <text x="300" y="80" font-family="Arial" font-size="16" fill="white" text-anchor="middle" id="subtitle">${
          prompt.length > 30 ? prompt.substring(0, 30) + "..." : prompt
        }</text>
      </svg>`;
  }
}
