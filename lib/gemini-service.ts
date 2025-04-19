import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Gemini API client
const API_KEY = process.env.GOOGLE_API_KEY;

// Safety settings
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Generation configuration
const generationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8192,
};

/**
 * Generate quiz questions from document text using Gemini API
 * @param documentText The text content of the document
 * @param questionCount The number of questions to generate
 * @returns An array of quiz questions
 */
export async function generateQuizFromText(
  documentText: string,
  questionCount: number = 10
): Promise<any[]> {
  try {
    if (!API_KEY) {
      throw new Error('GOOGLE_API_KEY environment variable not set');
    }

    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Get the model
    const modelName = process.env.GOOGLE_AI_MODEL || 'gemini-2.0-flash';
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig,
      safetySettings,
    });

    // Create prompt for quiz generation
    const prompt = `Based on the following document text, generate a multiple-choice quiz with exactly ${questionCount} questions. Each question should have 4 options (A, B, C, D) and only one correct answer.

You MUST format the output as a valid JSON array of objects, where each object has the following structure:
{ "question": "The question text", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "correctAnswer": "A", "explanation": "Brief explanation of why this is the correct answer" }

IMPORTANT RULES:
1. The output MUST be valid JSON that can be parsed with JSON.parse()
2. Do NOT include any introductory text, explanations, or markdown formatting
3. Do NOT wrap the JSON in code blocks or backticks
4. The response should start with '[' and end with ']'
5. Make sure all quotes are properly escaped in the JSON
6. Each question must have exactly 4 options labeled A, B, C, D
7. The correctAnswer must be one of: "A", "B", "C", or "D"
8. Questions should be diverse and cover different aspects of the document
9. Questions should be clear, concise, and directly based on the document content
10. Avoid questions that are too obvious or too obscure
11. Include a brief explanation for each correct answer

Here is the document text:

${documentText}`;

    // Generate quiz
    console.log('Sending prompt to Gemini API');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Parse the response as JSON
    try {
      // Try to parse the response as JSON
      const quizData = JSON.parse(responseText);
      
      // Validate the structure
      if (!Array.isArray(quizData) || quizData.length === 0 || !quizData[0].question || !quizData[0].options || !quizData[0].correctAnswer) {
        console.error('ERROR: Invalid quiz data structure received');
        throw new Error('AI generated data has an invalid structure.');
      }
      
      console.log('Quiz generated and parsed successfully');
      return quizData;
    } catch (parseError) {
      console.error('ERROR parsing JSON response:', parseError);
      
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        try {
          const extractedJson = JSON.parse(jsonMatch[0]);
          console.log('Successfully extracted JSON from response');
          return extractedJson;
        } catch (extractError) {
          console.error('ERROR extracting JSON from response:', extractError);
          throw new Error('Failed to parse quiz data from AI response');
        }
      } else {
        throw new Error('Failed to extract valid JSON from AI response');
      }
    }
  } catch (error) {
    console.error('Error generating quiz questions:', error);
    throw error;
  }
}
