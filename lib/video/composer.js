/**
 * Video composer utility
 * Combines manim.js animation with voice narration
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);
const unlinkAsync = promisify(fs.unlink);

// Path to ffmpeg binary
const FFMPEG_PATH = require('ffmpeg-static');

/**
 * Combine animation and audio into a video
 * @param {string} animationPath - Path to the animation file (HTML)
 * @param {string} audioPath - Path to the audio file
 * @param {string} outputPath - Path to save the output video
 * @param {Object} options - Video composition options
 * @returns {Promise<string>} Path to the output video
 */
async function composeVideo(animationPath, audioPath, outputPath, options = {}) {
  try {
    // Ensure the output directory exists
    const outputDir = path.dirname(outputPath);
    await mkdirAsync(outputDir, { recursive: true }).catch(() => {});
    
    // Create a temporary script to capture the animation frames
    const captureScriptPath = path.join(outputDir, 'capture.js');
    await createCaptureScript(captureScriptPath, animationPath, outputDir);
    
    // Run the capture script to generate frames
    await runCaptureScript(captureScriptPath);
    
    // Combine frames and audio using ffmpeg
    await combineFramesAndAudio(outputDir, audioPath, outputPath);
    
    // Clean up temporary files
    await cleanupTempFiles(outputDir, captureScriptPath);
    
    return outputPath;
  } catch (error) {
    console.error('Error composing video:', error);
    throw error;
  }
}

/**
 * Create a script to capture animation frames
 * @param {string} scriptPath - Path to save the capture script
 * @param {string} animationPath - Path to the animation file
 * @param {string} outputDir - Directory to save frames
 * @returns {Promise<void>}
 */
async function createCaptureScript(scriptPath, animationPath, outputDir) {
  const script = `
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set viewport size
  await page.setViewport({
    width: 1200,
    height: 675,
    deviceScaleFactor: 1
  });
  
  // Navigate to the animation file
  await page.goto('file://${animationPath.replace(/\\/g, '\\\\')}');
  
  // Wait for animation to load
  await page.waitForFunction('window.p5Instance && window.p5Instance.isLoaded', { timeout: 10000 });
  
  // Create output directory for frames
  const framesDir = path.join('${outputDir.replace(/\\/g, '\\\\')}', 'frames');
  if (!fs.existsSync(framesDir)) {
    fs.mkdirSync(framesDir, { recursive: true });
  }
  
  // Capture frames
  const totalFrames = 300; // Adjust based on animation duration
  
  for (let i = 0; i < totalFrames; i++) {
    // Set current frame
    await page.evaluate((frame) => {
      window.p5Instance.frameCount = frame;
      window.p5Instance.redraw();
    }, i);
    
    // Capture screenshot
    const framePath = path.join(framesDir, \`frame_\${String(i).padStart(5, '0')}.png\`);
    await page.screenshot({ path: framePath });
    
    console.log(\`Captured frame \${i + 1}/\${totalFrames}\`);
  }
  
  await browser.close();
  console.log('Frame capture complete');
})();
  `;
  
  await writeFileAsync(scriptPath, script);
}

/**
 * Run the capture script to generate frames
 * @param {string} scriptPath - Path to the capture script
 * @returns {Promise<void>}
 */
async function runCaptureScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const process = spawn('node', [scriptPath]);
    
    process.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    process.stderr.on('data', (data) => {
      console.error(data.toString());
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Capture script exited with code ${code}`));
      }
    });
  });
}

/**
 * Combine frames and audio using ffmpeg
 * @param {string} framesDir - Directory containing frames
 * @param {string} audioPath - Path to the audio file
 * @param {string} outputPath - Path to save the output video
 * @returns {Promise<void>}
 */
async function combineFramesAndAudio(framesDir, audioPath, outputPath) {
  return new Promise((resolve, reject) => {
    const ffmpegArgs = [
      '-framerate', '30',
      '-i', path.join(framesDir, 'frames', 'frame_%05d.png'),
      '-i', audioPath,
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-shortest',
      outputPath
    ];
    
    const process = spawn(FFMPEG_PATH, ffmpegArgs);
    
    process.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    process.stderr.on('data', (data) => {
      console.error(data.toString());
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
  });
}

/**
 * Clean up temporary files
 * @param {string} outputDir - Output directory
 * @param {string} captureScriptPath - Path to the capture script
 * @returns {Promise<void>}
 */
async function cleanupTempFiles(outputDir, captureScriptPath) {
  try {
    // Remove capture script
    await unlinkAsync(captureScriptPath);
    
    // Keep frames for debugging
    console.log('Temporary files cleaned up');
  } catch (error) {
    console.error('Error cleaning up temporary files:', error);
  }
}

module.exports = {
  composeVideo
};
