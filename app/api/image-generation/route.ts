import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

// Stability AI API key
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!STABILITY_API_KEY) {
      console.error("STABILITY_API_KEY environment variable not set");
      return NextResponse.json(
        { error: "Image generation service is not configured" },
        { status: 500 }
      );
    }

    console.log("Generating image for prompt:", prompt);

    // Call Stability AI API
    const response = await fetch(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${STABILITY_API_KEY}`,
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: `Educational visualization of ${prompt}. Clear, detailed, professional style suitable for educational content.`,
              weight: 1,
            },
          ],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 30,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Stability API error:", errorData);
      
      // Use a fallback image if the API fails
      return NextResponse.json({ 
        imageUrl: "/fallback-image.jpg",
        fallback: true
      });
    }

    const responseData = await response.json();
    
    // Create directory for storing images
    const imageDir = path.join(process.cwd(), 'public', 'generated', 'images');
    fs.mkdirSync(imageDir, { recursive: true });
    
    // Save the image
    const base64Image = responseData.artifacts[0].base64;
    const buffer = Buffer.from(base64Image, 'base64');
    const imageName = `image_${Date.now()}.png`;
    const imagePath = path.join(imageDir, imageName);
    fs.writeFileSync(imagePath, buffer);
    
    // Return the public URL
    const imageUrl = `/generated/images/${imageName}`;
    
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Failed to generate image", details: error.message },
      { status: 500 }
    );
  }
}
