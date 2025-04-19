/**
 * Script generator using Gemini AI models
 * Generates a script with timeline based on user prompt
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
let genAI;
let models = {};

/**
 * Initialize the Gemini API with the provided API key
 * @param {string} apiKey - Gemini API key
 */
function initialize(apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);

  // Initialize models
  models['gemini-2.0-flash'] = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Try to initialize Gemini 2.5 Flash if available
  try {
    models['gemini-2.5-flash'] = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log('Gemini 2.5 Flash model initialized successfully');
  } catch (error) {
    console.warn('Gemini 2.5 Flash model not available, falling back to 2.0:', error.message);
  }
}

/**
 * Generate a script with timeline based on user prompt
 * @param {string} prompt - User prompt
 * @param {Object} options - Generation options
 * @param {string} options.model - Model name to use ('gemini-2.0-flash' or 'gemini-2.5-flash')
 * @returns {Promise<string>} Generated script with timeline
 */
async function generateScript(prompt, options = {}) {
  // Determine which model to use
  const modelName = options.model || 'gemini-2.0-flash';
  const model = models[modelName] || models['gemini-2.0-flash'];

  if (!model) {
    throw new Error('Gemini API not initialized. Call initialize() first.');
  }

  try {
    // Create a system prompt that instructs Gemini to generate a script with timeline
    const systemPrompt = `
You are an expert scriptwriter for educational videos.
Create a detailed script with timeline for a short educational video (2-3 minutes) based on the user's prompt.
The script should include:
1. A clear timeline format with timestamps (e.g., "0:00-0:30: Introduction to topic")
2. Engaging and educational content
3. Clear explanations of concepts
4. Suggestions for visual elements where appropriate

Format the script with clear timestamp ranges for each section, like this:
0:00-0:15: Introduction to the topic
0:15-0:45: Explanation of first concept
0:45-1:15: Demonstration with examples
etc.

Make sure the script is educational, engaging, and suitable for visualization with animations.

The script should be detailed enough to be converted into animation code later.
For each section, include specific visual descriptions that can be animated.
`;

    console.log(`Generating script using ${modelName}...`);

    // Generate the script
    const result = await model.generateContent({
      contents: [
        { role: 'system', parts: [{ text: systemPrompt }] },
        { role: 'user', parts: [{ text: prompt }] }
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 4096,
      }
    });

    const response = result.response;
    return response.text();
  } catch (error) {
    console.error(`Error generating script with ${modelName}:`, error);

    // If using 2.5 and it fails, try falling back to 2.0
    if (modelName === 'gemini-2.5-flash' && models['gemini-2.0-flash']) {
      console.log('Falling back to gemini-2.0-flash...');
      return generateScript(prompt, { model: 'gemini-2.0-flash' });
    }

    throw error;
  }
}

/**
 * Generate manim.js code from a user prompt
 * @param {string} prompt - User prompt
 * @param {Object} options - Generation options
 * @param {string} options.scriptModel - Model name to use for script generation
 * @param {string} options.animationModel - Model name to use for animation code generation
 * @returns {Promise<Object>} Object containing script and generated code
 */
async function generateManimCodeFromPrompt(prompt, options = {}) {
  try {
    // First generate the script
    const script = await generateScript(prompt, { model: options.scriptModel });

    // Then generate manim.js code based on the script
    const manimCode = await generateManimCode(script, { model: options.animationModel });

    return {
      script,
      manimCode,
      scriptModel: options.scriptModel || 'gemini-2.0-flash',
      animationModel: options.animationModel || 'gemini-2.0-flash'
    };
  } catch (error) {
    console.error('Error generating manim code from prompt:', error);
    throw error;
  }
}

/**
 * Generate manim.js code based on a script
 * @param {string} script - Script with timeline
 * @param {Object} options - Generation options
 * @param {string} options.model - Model name to use ('gemini-2.0-flash' or 'gemini-2.5-flash')
 * @returns {Promise<string>} Generated manim.js code
 */
async function generateManimCode(script, options = {}) {
  // Determine which model to use
  const modelName = options.model || 'gemini-2.0-flash';
  const model = models[modelName] || models['gemini-2.0-flash'];

  if (!model) {
    throw new Error('Gemini API not initialized. Call initialize() first.');
  }

  try {
    // Create a system prompt that instructs Gemini to generate manim.js code
    const systemPrompt = `
You are an expert in manim.js animation programming.
Convert the following script with timeline into manim.js animation code.
The code should:
1. Create appropriate visualizations for each section of the script
2. Follow the timeline specified in the script
3. Use appropriate colors, shapes, and text animations
4. Be well-structured and organized

Use the following manim.js classes and functions:
- TextAnimation: For displaying and animating text
- ShapeAnimation: For basic geometric shapes
- EquationAnimation: For mathematical equations
- GSAPTextAnimation: For advanced text animations
- GSAPShapeAnimation: For advanced shape animations
- Animation: Base class for animations
- Colors: BLACK, WHITE, RED, GREEN, BLUE, YELLOW, PURPLE, ORANGE

The code should be structured as a complete, runnable manim.js animation.

Make sure to use the enhanced features of manim.js:
- Use KaTeX for rendering mathematical equations
- Use GSAP for complex animations
- Use WebGL for 3D visualizations when appropriate
- Use animation caching for better performance
`;

    console.log(`Generating manim.js code using ${modelName}...`);

    // Generate the manim.js code
    const result = await model.generateContent({
      contents: [
        { role: 'system', parts: [{ text: systemPrompt }] },
        { role: 'user', parts: [{ text: script }] }
      ],
      generationConfig: {
        temperature: 0.2, // Lower temperature for more deterministic code generation
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192, // Larger token limit for code generation
      }
    });

    const response = result.response;
    return response.text();
  } catch (error) {
    console.error(`Error generating manim code with ${modelName}:`, error);

    // If using 2.5 and it fails, try falling back to 2.0
    if (modelName === 'gemini-2.5-flash' && models['gemini-2.0-flash']) {
      console.log('Falling back to gemini-2.0-flash for code generation...');
      return generateManimCode(script, { model: 'gemini-2.0-flash' });
    }

    throw error;
  }
}

module.exports = {
  initialize,
  generateScript,
  generateManimCode,
  generateManimCodeFromPrompt
};
