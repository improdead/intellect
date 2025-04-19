/**
 * Manim.js code generator
 * Converts script with timeline into manim.js animation code
 */

/**
 * Parse a timeline script and generate manim.js animation code
 * @param {string} script - The script with timeline (e.g., "0:00-0:30: Introduction to topic")
 * @returns {string} Generated manim.js code
 */
function generateManimCode(script) {
  // Parse the script into timeline segments
  const segments = parseScript(script);

  // Generate the animation code
  let code = generateBoilerplate();

  // Add animation segments
  segments.forEach(segment => {
    code += generateSegmentCode(segment);
  });

  // Close the animation code
  code += generateClosingCode();

  return code;
}

/**
 * Parse a script with timeline into segments
 * @param {string} script - The script with timeline
 * @returns {Array} Array of segment objects with start, end, and content
 */
function parseScript(script) {
  const segments = [];
  const lines = script.split('\n');

  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) continue;

    // Try to match timeline pattern (e.g., "0:00-0:30: Introduction to topic")
    const timelineMatch = line.match(/(\d+):(\d+)\s*-\s*(\d+):(\d+)\s*:\s*(.*)/);

    if (timelineMatch) {
      const startMin = parseInt(timelineMatch[1]);
      const startSec = parseInt(timelineMatch[2]);
      const endMin = parseInt(timelineMatch[3]);
      const endSec = parseInt(timelineMatch[4]);
      const content = timelineMatch[5].trim();

      // Convert to frame numbers (assuming 30fps)
      const startFrame = (startMin * 60 + startSec) * 30;
      const endFrame = (endMin * 60 + endSec) * 30;

      segments.push({
        startTime: `${startMin}:${startSec.toString().padStart(2, '0')}`,
        endTime: `${endMin}:${endSec.toString().padStart(2, '0')}`,
        startFrame,
        endFrame,
        duration: endFrame - startFrame,
        content
      });
    } else {
      // If no timeline pattern, add to the last segment's content if it exists
      if (segments.length > 0) {
        segments[segments.length - 1].content += ' ' + line.trim();
      }
    }
  }

  return segments;
}

/**
 * Generate boilerplate code for manim.js animation
 * @returns {string} Boilerplate code
 */
function generateBoilerplate() {
  return `
// Generated manim.js animation
const {
  setup2D,
  setupWebGL,
  BLACK,
  WHITE,
  RED,
  GREEN,
  BLUE,
  YELLOW,
  PURPLE,
  ORANGE,
  Animation,
  TextAnimation,
  ShapeAnimation,
  EquationAnimation,
  GSAPAnimation,
  GSAPShapeAnimation,
  GSAPTextAnimation,
  animationCache,
  createCachedAnimation,
  WebGLOptimizer
} = require('./lib/manim/core.js');

const ManimAnimation = function(p) {
  let font;
  let webglOptimizer;

  p.preload = function() {
    // Load font
    try {
      font = p.loadFont('https://cdn.jsdelivr.net/npm/p5/lib/addons/p5.Font.js');
    } catch (e) {
      console.warn('Could not load font:', e);
    }
  };

  p.setup = function() {
    // Determine if we need WebGL mode based on content
    const needsWebGL = false; // This will be set to true if 3D content is detected

    if (needsWebGL) {
      webglOptimizer = setupWebGL(p);
      p.isWebGL = true;
    } else {
      setup2D(p);
      p.isWebGL = false;
    }
  };

  p.draw = function() {
    p.background(0);

    // Animation timeline
`;
}

/**
 * Generate code for a specific timeline segment
 * @param {Object} segment - The segment object
 * @returns {string} Generated code for the segment
 */
function generateSegmentCode(segment) {
  const { startFrame, endFrame, content } = segment;

  // Analyze content to determine appropriate visualization
  const visualizationType = determineVisualization(content);

  let code = `
    // ${segment.startTime} - ${segment.endTime}: ${content}
`;

  // Generate different visualizations based on content
  switch (visualizationType) {
    case 'text':
      code += generateTextVisualization(startFrame, endFrame, content);
      break;
    case 'equation':
      code += generateEquationVisualization(startFrame, endFrame, content);
      break;
    case 'graph':
      code += generateGraphVisualization(startFrame, endFrame, content);
      break;
    case 'shape':
      code += generateShapeVisualization(startFrame, endFrame, content);
      break;
    case '3d':
      code += generate3DVisualization(startFrame, endFrame, content);
      break;
    default:
      code += generateTextVisualization(startFrame, endFrame, content);
  }

  return code;
}

/**
 * Determine the type of visualization based on content
 * @param {string} content - The segment content
 * @returns {string} Visualization type
 */
function determineVisualization(content) {
  const lowerContent = content.toLowerCase();

  // Check for mathematical content
  if (lowerContent.includes('equation') || lowerContent.includes('formula') || content.includes('=') ||
      content.includes('\\frac') || content.includes('\\sum') || content.includes('\\int')) {
    return 'equation';
  }
  // Check for graph content
  else if (lowerContent.includes('graph') || lowerContent.includes('plot') || lowerContent.includes('chart') ||
           lowerContent.includes('function') || lowerContent.includes('coordinate')) {
    return 'graph';
  }
  // Check for shape content
  else if (lowerContent.includes('circle') || lowerContent.includes('square') || lowerContent.includes('triangle') ||
           lowerContent.includes('rectangle') || lowerContent.includes('polygon') || lowerContent.includes('shape')) {
    return 'shape';
  }
  // Check for 3D content
  else if (lowerContent.includes('3d') || lowerContent.includes('three dimensional') ||
           lowerContent.includes('cube') || lowerContent.includes('sphere')) {
    return '3d';
  }
  // Default to text
  else {
    return 'text';
  }
}

/**
 * Generate code for text visualization using GSAP
 * @param {number} startFrame - Start frame
 * @param {number} endFrame - End frame
 * @param {string} content - Text content
 * @returns {string} Generated code
 */
function generateTextVisualization(startFrame, endFrame, content) {
  // Split content into lines if it's too long
  const lines = splitIntoLines(content);
  let code = '';

  lines.forEach((line, index) => {
    const yOffset = (index - lines.length / 2) * 40;
    code += `
    // Create a GSAP text animation
    const text_${startFrame}_${index} = createCachedAnimation('text_${startFrame}_${index}', () => {
      return new GSAPTextAnimation(p, {
        text: "${escapeString(line)}",
        x: p.width/2,
        y: p.height/2 + ${yOffset},
        color: WHITE,
        size: 32,
        start: ${startFrame + index * 5}, // Stagger the start times
        duration: ${endFrame - startFrame - index * 5}
      });
    });

    text_${startFrame}_${index}.show();
`;
  });

  return code;
}

/**
 * Generate code for equation visualization using KaTeX
 * @param {number} startFrame - Start frame
 * @param {number} endFrame - End frame
 * @param {string} content - Equation content
 * @returns {string} Generated code
 */
function generateEquationVisualization(startFrame, endFrame, content) {
  // Extract LaTeX from the content if it exists
  let latex = content;

  // Look for LaTeX delimiters
  const latexMatch = content.match(/\$(.*?)\$|\\\((.*?)\\\)|\\\[(.*?)\\\]|\\begin\{(.*?)\}(.*?)\\end\{\4\}/s);
  if (latexMatch) {
    // Use the first matched group that contains content
    latex = latexMatch.slice(1).find(group => group) || content;
  }

  // Clean up the LaTeX
  latex = latex.trim();

  // If no LaTeX delimiters were found, add them
  if (!latex.startsWith('\\') && !latex.includes('=') && !latex.includes('+') && !latex.includes('-')) {
    latex = content; // Just use the original content
  }

  return `
    // Create a KaTeX equation animation
    const equation_${startFrame} = createCachedAnimation('equation_${startFrame}', () => {
      return new EquationAnimation(p, {
        latex: "${escapeString(latex)}",
        x: p.width/2,
        y: p.height/2,
        color: YELLOW,
        size: 40,
        start: ${startFrame},
        duration: ${endFrame - startFrame},
        displayMode: true
      });
    });

    equation_${startFrame}.show();
`;
}

/**
 * Generate code for graph visualization
 * @param {number} startFrame - Start frame
 * @param {number} endFrame - End frame
 * @param {string} content - Graph content
 * @returns {string} Generated code
 */
function generateGraphVisualization(startFrame, endFrame, content) {
  return `
    if (p.frameCount >= ${startFrame} && p.frameCount <= ${endFrame}) {
      p.push();

      // Draw axes
      p.stroke(WHITE);
      p.line(p.width/4, p.height*3/4, p.width*3/4, p.height*3/4); // x-axis
      p.line(p.width/4, p.height/4, p.width/4, p.height*3/4);     // y-axis

      // Draw graph title
      p.fill(WHITE);
      p.textSize(32);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("${escapeString(content)}", p.width/2, p.height/6);

      // Draw sample data points
      p.fill(RED);
      p.noStroke();
      for (let i = 0; i < 5; i++) {
        const x = p.width/4 + (i+1) * p.width/10;
        const y = p.height*3/4 - p.random(50, 200);
        p.ellipse(x, y, 10, 10);
      }

      p.pop();
    }
`;
}

/**
 * Generate code for shape visualization using GSAP
 * @param {number} startFrame - Start frame
 * @param {number} endFrame - End frame
 * @param {string} content - Shape content
 * @returns {string} Generated code
 */
function generateShapeVisualization(startFrame, endFrame, content) {
  const lowerContent = content.toLowerCase();
  let shapeType = 'circle';
  let shapeColorName = 'BLUE';

  if (lowerContent.includes('circle')) {
    shapeType = 'circle';
    shapeColorName = 'BLUE';
  } else if (lowerContent.includes('square') || lowerContent.includes('rectangle')) {
    shapeType = 'rect';
    shapeColorName = 'GREEN';
  } else if (lowerContent.includes('triangle')) {
    shapeType = 'triangle';
    shapeColorName = 'PURPLE';
  } else {
    shapeType = 'circle';
    shapeColorName = 'ORANGE';
  }

  return `
    // Create a GSAP shape animation
    const shape_${startFrame} = createCachedAnimation('shape_${startFrame}', () => {
      return new GSAPShapeAnimation(p, {
        type: '${shapeType}',
        x: p.width/2,
        y: p.height/2,
        color: ${shapeColorName},
        size: 200,
        start: ${startFrame},
        duration: ${Math.floor((endFrame - startFrame) * 0.7)}
      });
    });

    shape_${startFrame}.show();

    // Create a caption for the shape
    const caption_${startFrame} = createCachedAnimation('caption_${startFrame}', () => {
      return new GSAPTextAnimation(p, {
        text: "${escapeString(content)}",
        x: p.width/2,
        y: p.height*3/4,
        color: WHITE,
        size: 24,
        start: ${startFrame + Math.floor((endFrame - startFrame) * 0.2)},
        duration: ${Math.floor((endFrame - startFrame) * 0.8)}
      });
    });

    caption_${startFrame}.show();
`;
}

/**
 * Generate code for 3D visualization
 * @param {number} startFrame - Start frame
 * @param {number} endFrame - End frame
 * @param {string} content - 3D content description
 * @returns {string} Generated code
 */
function generate3DVisualization(startFrame, endFrame, content) {
  const lowerContent = content.toLowerCase();
  let shape3D = 'box';
  let shapeColorName = 'BLUE';

  if (lowerContent.includes('sphere') || lowerContent.includes('ball')) {
    shape3D = 'sphere';
    shapeColorName = 'RED';
  } else if (lowerContent.includes('torus') || lowerContent.includes('donut')) {
    shape3D = 'torus';
    shapeColorName = 'PURPLE';
  } else if (lowerContent.includes('cylinder') || lowerContent.includes('tube')) {
    shape3D = 'cylinder';
    shapeColorName = 'GREEN';
  } else {
    shape3D = 'box';
    shapeColorName = 'BLUE';
  }

  return `
    // Setup WebGL mode if not already set
    if (!p.isWebGL) {
      console.warn('3D visualization requires WebGL mode');
    }

    if (p.frameCount >= ${startFrame} && p.frameCount <= ${endFrame}) {
      p.push();

      // Setup lighting
      p.ambientLight(60, 60, 60);
      p.pointLight(255, 255, 255, 50, 50, 50);

      // Calculate animation progress
      const progress = (p.frameCount - ${startFrame}) / (${endFrame} - ${startFrame});

      // Animate rotation
      const rotationSpeed = 0.01;
      p.rotateX(p.frameCount * rotationSpeed);
      p.rotateY(p.frameCount * rotationSpeed * 0.8);

      // Animate scale
      let scale = 1;
      if (progress < 0.2) {
        scale = p.map(progress, 0, 0.2, 0, 1);
      } else if (progress > 0.8) {
        scale = p.map(progress, 0.8, 1, 1, 0);
      }
      p.scale(scale);

      // Set material properties
      p.specularMaterial(${shapeColorName});
      p.shininess(50);

      // Draw the 3D shape
      if ('${shape3D}' === 'sphere') {
        p.sphere(100);
      } else if ('${shape3D}' === 'torus') {
        p.torus(100, 40);
      } else if ('${shape3D}' === 'cylinder') {
        p.cylinder(50, 150);
      } else {
        p.box(150);
      }

      p.pop();

      // Draw caption
      p.push();
      p.fill(255);
      p.textSize(24);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("${escapeString(content)}", p.width/2, p.height*3/4);
      p.pop();
    }
`;
}

/**
 * Generate closing code for the animation
 * @returns {string} Closing code
 */
function generateClosingCode() {
  return `
  };
};

// Export the animation
module.exports = ManimAnimation;
`;
}

/**
 * Split text into lines of appropriate length
 * @param {string} text - The text to split
 * @param {number} maxLength - Maximum line length
 * @returns {Array} Array of lines
 */
function splitIntoLines(text, maxLength = 50) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxLength) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Escape special characters in a string for JavaScript
 * @param {string} str - The string to escape
 * @returns {string} Escaped string
 */
function escapeString(str) {
  return str.replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

module.exports = {
  generateManimCode,
  parseScript
};
