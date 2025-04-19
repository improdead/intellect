/**
 * Manim.js animation generator for video generation
 * Converts script sections into manim.js animations
 */
import { generateManimCode } from './generator';

/**
 * Generate animations for each section of the script
 * @param script - The script data with sections
 * @param jobId - The job ID for tracking
 * @returns Object with animation URLs for each section
 */
export async function generateAnimations(script: any, jobId: string): Promise<Record<string, string>> {
  console.log('Generating animations for script sections');
  
  const animations: Record<string, string> = {};
  
  try {
    // Format the script for manim.js generator
    const formattedScript = formatScriptForManim(script);
    
    // Generate manim.js code
    const manimCode = generateManimCode(formattedScript);
    
    // Create HTML file with the animation
    const animationHtml = createAnimationHtml(manimCode, jobId);
    
    // In a real implementation, we would:
    // 1. Save the HTML file
    // 2. Use Puppeteer to render it to frames
    // 3. Use FFmpeg to convert frames to video
    // 4. Upload the video to Supabase
    
    // For now, we'll simulate this process
    animations.introduction = `/generated/animations/${jobId}_intro.mp4`;
    
    // Add animations for each section
    script.sections.forEach((section: any, index: number) => {
      animations[`section_${index}`] = `/generated/animations/${jobId}_section_${index}.mp4`;
    });
    
    animations.conclusion = `/generated/animations/${jobId}_conclusion.mp4`;
    
    return animations;
  } catch (error) {
    console.error('Error generating animations:', error);
    throw new Error(`Animation generation failed: ${error.message}`);
  }
}

/**
 * Format the script for manim.js generator
 * @param script - The script data
 * @returns Formatted script with timestamps
 */
function formatScriptForManim(script: any): string {
  let formattedScript = '';
  
  // Add introduction
  formattedScript += `0:00-0:15: Introduction\n${script.title}. ${script.introduction}\n\n`;
  
  // Add sections
  let currentTime = 15;
  script.sections.forEach((section: any, index: number) => {
    const startTime = formatTime(currentTime);
    currentTime += 30; // Each section is 30 seconds
    const endTime = formatTime(currentTime);
    
    formattedScript += `${startTime}-${endTime}: ${section.title}\n${section.content}\n`;
    
    if (section.visualDescription) {
      formattedScript += `Visual: ${section.visualDescription}\n`;
    }
    
    if (section.animationNotes) {
      formattedScript += `Animation: ${section.animationNotes}\n`;
    }
    
    formattedScript += '\n';
  });
  
  // Add conclusion
  const startTime = formatTime(currentTime);
  currentTime += 15; // Conclusion is 15 seconds
  const endTime = formatTime(currentTime);
  
  formattedScript += `${startTime}-${endTime}: Conclusion\n${script.conclusion}\n`;
  
  return formattedScript;
}

/**
 * Format time in MM:SS format
 * @param seconds - Time in seconds
 * @returns Formatted time string
 */
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Create HTML file with the animation
 * @param manimCode - The generated manim.js code
 * @param jobId - The job ID
 * @returns HTML content
 */
function createAnimationHtml(manimCode: string, jobId: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Manim.js Animation - ${jobId}</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <style>
    body { margin: 0; overflow: hidden; background: #000; }
    canvas { display: block; }
  </style>
</head>
<body>
  <script>
    // Make p5 instance accessible globally for frame capture
    let p5Instance;
    
    // Include the generated animation code
    ${manimCode.replace(/module\.exports = ManimAnimation;/, '')}
    
    // Initialize the animation
    new p5(ManimAnimation);
  </script>
</body>
</html>
  `;
}
