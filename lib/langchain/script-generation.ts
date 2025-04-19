import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { z } from 'zod';

// Define the schema for structured output
const videoSectionSchema = z.object({
  title: z.string().describe('Title of this section'),
  content: z.string().describe('Educational content explaining the concept'),
  visualDescription: z.string().describe('Description of what should be visualized'),
  animationNotes: z.string().optional().describe('Notes for mathematical animations if needed'),
  timestamp: z.string().optional().describe('Timestamp in MM:SS format'),
});

const videoScriptSchema = z.object({
  title: z.string().describe('The title of the video'),
  introduction: z.string().describe('An engaging introduction to the topic'),
  sections: z.array(videoSectionSchema).describe('The main sections of the video'),
  conclusion: z.string().describe('Concluding remarks summarizing key points'),
});

// Create a parser based on the schema
const parser = StructuredOutputParser.fromZodSchema(videoScriptSchema);

// Create a prompt template
const scriptPromptTemplate = ChatPromptTemplate.fromTemplate(`
You are an expert educational content creator specializing in clear, engaging scripts.

Create a script for a 3-5 minute educational video about {topic}.

The script should:
1. Have a clear introduction to the topic
2. Be divided into 3-5 logical segments
3. Include specific notes about what should be visualized
4. Mention where mathematical animations would enhance understanding
5. End with a concise conclusion

{format_instructions}
`);

export async function generateVideoScript(topic: string) {
  try {
    // Initialize the Gemini 2.0 Pro model
    const model = new ChatGoogleGenerativeAI({
      modelName: 'gemini-2.0-pro',
      maxOutputTokens: 8192,
      temperature: 0.2,
    });

    // Create the prompt with format instructions
    const prompt = await scriptPromptTemplate.format({
      topic: topic,
      format_instructions: parser.getFormatInstructions(),
    });

    // Generate the script
    const response = await model.invoke(prompt);

    // Parse the response into structured format
    try {
      const structuredScript = await parser.parse(response.content);
      return structuredScript;
    } catch (parseError) {
      console.error('Error parsing script:', parseError);
      console.log('Raw response (first 500 chars):', String(response.content).substring(0, 500));

      // Extract JSON from the response (in case the model adds extra text)
      const jsonMatch = String(response.content).match(/```json\n([\s\S]*?)\n```/) ||
                        String(response.content).match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        try {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          const scriptData = JSON.parse(jsonStr);
          return scriptData;
        } catch (jsonError) {
          console.error('Error parsing extracted JSON:', jsonError);
        }
      }

      // Fallback to a basic structure
      return {
        title: `Video about ${topic}`,
        introduction: 'Introduction to the topic',
        sections: [
          {
            title: 'Key Concepts',
            content: String(response.content).substring(0, 500) + '...',
            visualDescription: `Visualization of ${topic}`,
            animationNotes: '',
            timestamp: '00:30'
          }
        ],
        conclusion: 'Thank you for watching'
      };
    }
  } catch (error) {
    console.error('Error generating video script:', error);
    throw new Error(`Failed to generate video script: ${error.message}`);
  }
}
