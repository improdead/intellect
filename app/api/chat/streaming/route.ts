import { NextRequest } from "next/server";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  Content,
} from "@google/generative-ai";
// If using ai v3+ (vercel/ai), this import is correct:
import { NextResponse } from "next/server";

// Define the expected request body structure
interface ChatRequestBody {
  message: string;
  // History format needs to match Google AI models' expected format
  history: { role: "user" | "model"; parts: { text: string }[] }[];
  // When true, uses the more advanced model
  useThinkingModel: boolean;
  // Flag to indicate if this is a follow-up question
  isFollowUp?: boolean;
}

// --- Initialize Google AI Client ---
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error("GOOGLE_API_KEY environment variable not set");
  throw new Error("GOOGLE_API_KEY environment variable not set");
}

const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 0.2, // Very low temperature to ensure it follows instructions precisely
  topK: 1,
  topP: 0.95,
  maxOutputTokens: 8192, // Significantly increased for detailed output
};

// Safety settings - adjust as needed
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

export async function POST(request: NextRequest) {
  console.log("Chat API Request received");

  try {
    // Parse request body
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: "No message provided" },
        { status: 400 }
      );
    }

    console.log("Processing message:", message.substring(0, 30) + "...");

    try {
      // Use gemini-2.0-flash model
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });

      // Generate a response
      const result = await model.generateContent(message);
      const responseText =
        result.response?.text() || "I couldn't generate a response.";

      console.log("Generated response:", responseText.substring(0, 50) + "...");

      // Return a simple JSON response (no streaming)
      return NextResponse.json({
        role: "assistant",
        content: responseText,
        id: Date.now().toString(),
      });
    } catch (aiError: any) {
      console.error("Gemini API error:", aiError?.message || aiError);
      return NextResponse.json(
        {
          role: "assistant",
          content:
            "I'm sorry, I encountered an error while processing your request. Please try again later.",
          id: Date.now().toString(),
        },
        { status: 200 }
      ); // Return 200 to show error message to user
    }
  } catch (error) {
    console.error("Unhandled error:", error);
    return NextResponse.json(
      {
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        id: Date.now().toString(),
      },
      { status: 200 }
    ); // Return 200 to show error message to user
  }
}
