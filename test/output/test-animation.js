
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

    // 0:00 - 0:15: Introduction to Mathematical Animations This is a test of the enhanced manim.js library with various animation types.

    // Create a GSAP text animation
    const text_0_0 = createCachedAnimation('text_0_0', () => {
      return new GSAPTextAnimation(p, {
        text: "Introduction to Mathematical Animations This is a",
        x: p.width/2,
        y: p.height/2 + -60,
        color: WHITE,
        size: 32,
        start: 0, // Stagger the start times
        duration: 450
      });
    });

    text_0_0.show();

    // Create a GSAP text animation
    const text_0_1 = createCachedAnimation('text_0_1', () => {
      return new GSAPTextAnimation(p, {
        text: "test of the enhanced manim.js library with various",
        x: p.width/2,
        y: p.height/2 + -20,
        color: WHITE,
        size: 32,
        start: 5, // Stagger the start times
        duration: 445
      });
    });

    text_0_1.show();

    // Create a GSAP text animation
    const text_0_2 = createCachedAnimation('text_0_2', () => {
      return new GSAPTextAnimation(p, {
        text: "animation types.",
        x: p.width/2,
        y: p.height/2 + 20,
        color: WHITE,
        size: 32,
        start: 10, // Stagger the start times
        duration: 440
      });
    });

    text_0_2.show();

    // 0:15 - 0:30: Simple Text Animation Text animations use GSAP for smooth transitions and better easing functions.

    if (p.frameCount >= 450 && p.frameCount <= 900) {
      p.push();

      // Draw axes
      p.stroke(WHITE);
      p.line(p.width/4, p.height*3/4, p.width*3/4, p.height*3/4); // x-axis
      p.line(p.width/4, p.height/4, p.width/4, p.height*3/4);     // y-axis

      // Draw graph title
      p.fill(WHITE);
      p.textSize(32);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Simple Text Animation Text animations use GSAP for smooth transitions and better easing functions.", p.width/2, p.height/6);

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

    // 0:30 - 0:45: Mathematical Equation Rendering The Pythagorean theorem states that $a^2 + b^2 = c^2$ for right triangles.

    // Create a KaTeX equation animation
    const equation_900 = createCachedAnimation('equation_900', () => {
      return new EquationAnimation(p, {
        latex: "a^2 + b^2 = c^2",
        x: p.width/2,
        y: p.height/2,
        color: YELLOW,
        size: 40,
        start: 900,
        duration: 450,
        displayMode: true
      });
    });

    equation_900.show();

    // 0:45 - 1:00: Complex Equation with KaTeX $$\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$

    // Create a KaTeX equation animation
    const equation_1350 = createCachedAnimation('equation_1350', () => {
      return new EquationAnimation(p, {
        latex: "Complex Equation with KaTeX $$\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$",
        x: p.width/2,
        y: p.height/2,
        color: YELLOW,
        size: 40,
        start: 1350,
        duration: 450,
        displayMode: true
      });
    });

    equation_1350.show();

    // 1:00 - 1:15: Shape Animation A circle can be defined as the set of all points equidistant from a center point.

    // Create a GSAP shape animation
    const shape_1800 = createCachedAnimation('shape_1800', () => {
      return new GSAPShapeAnimation(p, {
        type: 'circle',
        x: p.width/2,
        y: p.height/2,
        color: BLUE,
        size: 200,
        start: 1800,
        duration: 315
      });
    });

    shape_1800.show();

    // Create a caption for the shape
    const caption_1800 = createCachedAnimation('caption_1800', () => {
      return new GSAPTextAnimation(p, {
        text: "Shape Animation A circle can be defined as the set of all points equidistant from a center point.",
        x: p.width/2,
        y: p.height*3/4,
        color: WHITE,
        size: 24,
        start: 1890,
        duration: 360
      });
    });

    caption_1800.show();

    // 1:15 - 1:30: 3D Visualization A sphere is a three-dimensional analog of a circle.

    // Create a GSAP shape animation
    const shape_2250 = createCachedAnimation('shape_2250', () => {
      return new GSAPShapeAnimation(p, {
        type: 'circle',
        x: p.width/2,
        y: p.height/2,
        color: BLUE,
        size: 200,
        start: 2250,
        duration: 315
      });
    });

    shape_2250.show();

    // Create a caption for the shape
    const caption_2250 = createCachedAnimation('caption_2250', () => {
      return new GSAPTextAnimation(p, {
        text: "3D Visualization A sphere is a three-dimensional analog of a circle.",
        x: p.width/2,
        y: p.height*3/4,
        color: WHITE,
        size: 24,
        start: 2340,
        duration: 360
      });
    });

    caption_2250.show();

    // 1:30 - 1:45: Graph Visualization The function f(x) = x^2 is a parabola that opens upward.

    // Create a KaTeX equation animation
    const equation_2700 = createCachedAnimation('equation_2700', () => {
      return new EquationAnimation(p, {
        latex: "Graph Visualization The function f(x) = x^2 is a parabola that opens upward.",
        x: p.width/2,
        y: p.height/2,
        color: YELLOW,
        size: 40,
        start: 2700,
        duration: 450,
        displayMode: true
      });
    });

    equation_2700.show();

  };
};

// Export the animation
module.exports = ManimAnimation;
