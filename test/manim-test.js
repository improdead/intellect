/**
 * Test file for manim.js enhancements
 * Run with: node test/manim-test.js
 */
const fs = require('fs');
const path = require('path');

// Import the manim.js generator
const { generateManimCode, parseScript } = require('../lib/manim/generator');

// Test script with different types of content
const testScript = `
0:00-0:15: Introduction to Mathematical Animations
This is a test of the enhanced manim.js library with various animation types.

0:15-0:30: Simple Text Animation
Text animations use GSAP for smooth transitions and better easing functions.

0:30-0:45: Mathematical Equation Rendering
The Pythagorean theorem states that $a^2 + b^2 = c^2$ for right triangles.

0:45-1:00: Complex Equation with KaTeX
$$\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$

1:00-1:15: Shape Animation
A circle can be defined as the set of all points equidistant from a center point.

1:15-1:30: 3D Visualization
A sphere is a three-dimensional analog of a circle.

1:30-1:45: Graph Visualization
The function f(x) = x^2 is a parabola that opens upward.
`;

// Generate manim.js code from the script
const manimCode = generateManimCode(testScript);

// Save the generated code to a file
const outputPath = path.join(__dirname, 'output', 'test-animation.js');

// Create the output directory if it doesn't exist
if (!fs.existsSync(path.dirname(outputPath))) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
}

// Write the code to the file
fs.writeFileSync(outputPath, manimCode);

// Create an HTML file to test the animation
const htmlPath = path.join(__dirname, 'output', 'test-animation.html');
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Manim.js Test Animation</title>
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
    // Mock require function for browser
    function require(module) {
      if (module === './lib/manim/core.js') {
        return {
          setup2D: (p, width = 1200, height = 675, frameRate = 30) => {
            p.createCanvas(width, height);
            p.frameRate(frameRate);
          },
          setupWebGL: (p, width = 1200, height = 675, frameRate = 30) => {
            const renderer = p.createCanvas(width, height, p.WEBGL);
            p.frameRate(frameRate);
            return { enableOptimizations: () => {} };
          },
          BLACK: [0, 0, 0],
          WHITE: [255, 255, 255],
          RED: [255, 0, 0],
          GREEN: [0, 255, 0],
          BLUE: [0, 0, 255],
          YELLOW: [255, 255, 0],
          PURPLE: [128, 0, 128],
          ORANGE: [255, 165, 0],
          Animation: class {
            constructor(p, options = {}) {
              this.p = p;
              this.start = options.start || 0;
              this.duration = options.duration || 60;
              this.end = this.start + this.duration;
              this.isPlaying = false;
            }
            getProgress() {
              if (this.p.frameCount < this.start) return 0;
              if (this.p.frameCount > this.end) return 1;
              return (this.p.frameCount - this.start) / this.duration;
            }
            update() {
              const progress = this.getProgress();
              if (progress > 0 && progress < 1) {
                this.isPlaying = true;
              } else if (progress >= 1) {
                this.isPlaying = false;
              }
            }
            show() {
              this.update();
            }
          },
          TextAnimation: class {
            constructor(p, options = {}) {
              this.p = p;
              this.text = options.text || "";
              this.x = options.x || p.width / 2;
              this.y = options.y || p.height / 2;
              this.color = options.color || [255, 255, 255];
              this.size = options.size || 32;
              this.start = options.start || 0;
              this.duration = options.duration || 60;
              this.end = this.start + this.duration;
              this.opacity = 0;
            }
            getProgress() {
              if (this.p.frameCount < this.start) return 0;
              if (this.p.frameCount > this.end) return 1;
              return (this.p.frameCount - this.start) / this.duration;
            }
            update() {
              const progress = this.getProgress();
              if (progress < 0.2) {
                this.opacity = this.p.map(progress, 0, 0.2, 0, 255);
              } else if (progress < 0.8) {
                this.opacity = 255;
              } else {
                this.opacity = this.p.map(progress, 0.8, 1, 255, 0);
              }
            }
            show() {
              this.update();
              if (this.getProgress() > 0) {
                this.p.push();
                this.p.textSize(this.size);
                this.p.textAlign(this.p.CENTER, this.p.CENTER);
                this.p.fill(this.color[0], this.color[1], this.color[2], this.opacity);
                this.p.text(this.text, this.x, this.y);
                this.p.pop();
              }
            }
          },
          ShapeAnimation: class {
            constructor(p, options = {}) {
              this.p = p;
              this.type = options.type || 'circle';
              this.x = options.x || p.width / 2;
              this.y = options.y || p.height / 2;
              this.color = options.color || [255, 255, 255];
              this.size = options.size || 50;
              this.start = options.start || 0;
              this.duration = options.duration || 60;
              this.end = this.start + this.duration;
              this.opacity = 0;
              this.scale = 0;
            }
            getProgress() {
              if (this.p.frameCount < this.start) return 0;
              if (this.p.frameCount > this.end) return 1;
              return (this.p.frameCount - this.start) / this.duration;
            }
            update() {
              const progress = this.getProgress();
              if (progress < 0.2) {
                this.opacity = this.p.map(progress, 0, 0.2, 0, 255);
                this.scale = this.p.map(progress, 0, 0.2, 0, 1);
              } else if (progress < 0.8) {
                this.opacity = 255;
                this.scale = 1;
              } else {
                this.opacity = this.p.map(progress, 0.8, 1, 255, 0);
                this.scale = 1;
              }
            }
            show() {
              this.update();
              if (this.getProgress() > 0) {
                this.p.push();
                this.p.fill(this.color[0], this.color[1], this.color[2], this.opacity);
                this.p.noStroke();
                if (this.type === 'circle') {
                  this.p.ellipse(this.x, this.y, this.size * this.scale);
                } else if (this.type === 'rect') {
                  this.p.rectMode(this.p.CENTER);
                  this.p.rect(this.x, this.y, this.size * this.scale, this.size * this.scale);
                }
                this.p.pop();
              }
            }
          },
          EquationAnimation: class {
            constructor(p, options = {}) {
              this.p = p;
              this.latex = options.latex || '';
              this.x = options.x || p.width / 2;
              this.y = options.y || p.height / 2;
              this.color = options.color || [255, 255, 255];
              this.size = options.size || 32;
              this.start = options.start || 0;
              this.duration = options.duration || 60;
              this.end = this.start + this.duration;
              this.opacity = 0;
              
              // Create a div for KaTeX rendering
              this.div = document.createElement('div');
              this.div.style.position = 'absolute';
              this.div.style.left = '-9999px';
              this.div.style.top = '-9999px';
              document.body.appendChild(this.div);
              
              // Render LaTeX
              katex.render(this.latex, this.div, {
                throwOnError: false,
                displayMode: options.displayMode || true
              });
            }
            getProgress() {
              if (this.p.frameCount < this.start) return 0;
              if (this.p.frameCount > this.end) return 1;
              return (this.p.frameCount - this.start) / this.duration;
            }
            update() {
              const progress = this.getProgress();
              if (progress < 0.2) {
                this.opacity = this.p.map(progress, 0, 0.2, 0, 255);
              } else if (progress < 0.8) {
                this.opacity = 255;
              } else {
                this.opacity = this.p.map(progress, 0.8, 1, 255, 0);
              }
            }
            show() {
              this.update();
              if (this.getProgress() > 0) {
                this.p.push();
                this.p.fill(this.color[0], this.color[1], this.color[2], this.opacity);
                this.p.textSize(this.size);
                this.p.textAlign(this.p.CENTER, this.p.CENTER);
                this.p.text(this.latex, this.x, this.y);
                this.p.pop();
              }
            }
          },
          GSAPAnimation: class {
            constructor(p, options = {}) {
              this.p = p;
              this.start = options.start || 0;
              this.duration = options.duration || 60;
              this.end = this.start + this.duration;
              this.isPlaying = false;
              this.timeline = gsap.timeline({ paused: true });
            }
            getProgress() {
              if (this.p.frameCount < this.start) return 0;
              if (this.p.frameCount > this.end) return 1;
              return (this.p.frameCount - this.start) / this.duration;
            }
            update() {
              const progress = this.getProgress();
              if (progress > 0 && progress < 1) {
                this.isPlaying = true;
                this.timeline.progress(progress);
              } else if (progress >= 1) {
                this.isPlaying = false;
                this.timeline.progress(1);
              } else {
                this.timeline.progress(0);
              }
            }
            show() {
              this.update();
            }
          },
          GSAPShapeAnimation: class {
            constructor(p, options = {}) {
              this.p = p;
              this.type = options.type || 'circle';
              this.x = options.x || p.width / 2;
              this.y = options.y || p.height / 2;
              this.color = options.color || [255, 255, 255];
              this.size = options.size || 50;
              this.start = options.start || 0;
              this.duration = options.duration || 60;
              this.end = this.start + this.duration;
              this.props = { size: 0, opacity: 0 };
              this.timeline = gsap.timeline({ paused: true });
              this.timeline.to(this.props, { size: this.size, opacity: 255, duration: 0.5 });
              this.timeline.to(this.props, { opacity: 0, delay: 0.5, duration: 0.2 });
            }
            getProgress() {
              if (this.p.frameCount < this.start) return 0;
              if (this.p.frameCount > this.end) return 1;
              return (this.p.frameCount - this.start) / this.duration;
            }
            update() {
              const progress = this.getProgress();
              if (progress > 0 && progress < 1) {
                this.timeline.progress(progress);
              } else if (progress >= 1) {
                this.timeline.progress(1);
              } else {
                this.timeline.progress(0);
              }
            }
            show() {
              this.update();
              if (this.getProgress() > 0) {
                this.p.push();
                this.p.fill(this.color[0], this.color[1], this.color[2], this.props.opacity);
                this.p.noStroke();
                if (this.type === 'circle') {
                  this.p.ellipse(this.x, this.y, this.props.size);
                } else if (this.type === 'rect') {
                  this.p.rectMode(this.p.CENTER);
                  this.p.rect(this.x, this.y, this.props.size, this.props.size);
                }
                this.p.pop();
              }
            }
          },
          GSAPTextAnimation: class {
            constructor(p, options = {}) {
              this.p = p;
              this.text = options.text || "";
              this.x = options.x || p.width / 2;
              this.y = options.y || p.height / 2;
              this.color = options.color || [255, 255, 255];
              this.size = options.size || 32;
              this.start = options.start || 0;
              this.duration = options.duration || 60;
              this.end = this.start + this.duration;
              this.props = { y: this.y - 50, size: this.size * 0.5, opacity: 0 };
              this.timeline = gsap.timeline({ paused: true });
              this.timeline.to(this.props, { y: this.y, size: this.size, opacity: 255, duration: 0.3, ease: 'back.out' });
              this.timeline.to(this.props, { delay: 0.5, duration: 0 });
              this.timeline.to(this.props, { y: this.y - 30, opacity: 0, duration: 0.2 });
            }
            getProgress() {
              if (this.p.frameCount < this.start) return 0;
              if (this.p.frameCount > this.end) return 1;
              return (this.p.frameCount - this.start) / this.duration;
            }
            update() {
              const progress = this.getProgress();
              if (progress > 0 && progress < 1) {
                this.timeline.progress(progress);
              } else if (progress >= 1) {
                this.timeline.progress(1);
              } else {
                this.timeline.progress(0);
              }
            }
            show() {
              this.update();
              if (this.getProgress() > 0) {
                this.p.push();
                this.p.textSize(this.props.size);
                this.p.textAlign(this.p.CENTER, this.p.CENTER);
                this.p.fill(this.color[0], this.color[1], this.color[2], this.props.opacity);
                this.p.text(this.text, this.x, this.props.y);
                this.p.pop();
              }
            }
          },
          animationCache: {
            cache: new Map(),
            getAnimation: (id) => null,
            cacheAnimation: (id, animation) => {}
          },
          createCachedAnimation: (id, creatorFn) => creatorFn(),
          WebGLOptimizer: class {
            constructor(renderer) {
              this.renderer = renderer;
            }
            enableOptimizations(p) {}
          }
        };
      }
      return {};
    }
    
    // Include the generated animation code
    ${manimCode.replace(/module\.exports = ManimAnimation;/, '')}
    
    // Initialize the animation
    new p5(ManimAnimation);
  </script>
</body>
</html>
`;

// Write the HTML file
fs.writeFileSync(htmlPath, htmlContent);

console.log(`Generated animation code saved to: ${outputPath}`);
console.log(`Generated HTML test file saved to: ${htmlPath}`);
console.log('Open the HTML file in a browser to test the animation.');
