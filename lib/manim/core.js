/**
 * Manim.js core utilities for animation generation
 * Based on JazonJiao's Manim.js project
 * Enhanced with KaTeX, GSAP, and performance optimizations
 */

// Import extensions
const { EquationAnimation } = require('./extensions/katex');
const { GSAPAnimation, GSAPShapeAnimation, GSAPTextAnimation } = require('./extensions/gsap');

// Import optimizations
const { animationCache } = require('./optimization/animation-cache');
const { WebGLOptimizer } = require('./optimization/webgl-optimizer');

// Global constants for colors and settings
const BLACK = [0, 0, 0];
const WHITE = [255, 255, 255];
const RED = [255, 0, 0];
const GREEN = [0, 255, 0];
const BLUE = [0, 0, 255];
const YELLOW = [255, 255, 0];
const PURPLE = [128, 0, 128];
const ORANGE = [255, 165, 0];

// Default canvas settings
const DEFAULT_WIDTH = 1200;
const DEFAULT_HEIGHT = 675;
const DEFAULT_FRAME_RATE = 30;

/**
 * Setup a 2D canvas with default settings
 * @param {p5} p - The p5.js instance
 * @param {number} width - Canvas width (default: 1200)
 * @param {number} height - Canvas height (default: 675)
 * @param {number} frameRate - Animation frame rate (default: 30)
 */
function setup2D(p, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, frameRate = DEFAULT_FRAME_RATE) {
  p.createCanvas(width, height);
  p.frameRate(frameRate);
}

/**
 * Basic animation class for creating animated objects
 */
class Animation {
  /**
   * @param {p5} p - The p5.js instance
   * @param {Object} options - Animation options
   * @param {number} options.start - Start time in frames
   * @param {number} options.duration - Duration in frames
   */
  constructor(p, options = {}) {
    this.p = p;
    this.start = options.start || 0;
    this.duration = options.duration || 60;
    this.end = this.start + this.duration;
    this.isPlaying = false;
  }

  /**
   * Calculate animation progress (0 to 1)
   * @returns {number} Progress value between 0 and 1
   */
  getProgress() {
    if (this.p.frameCount < this.start) return 0;
    if (this.p.frameCount > this.end) return 1;

    return (this.p.frameCount - this.start) / this.duration;
  }

  /**
   * Update animation state
   */
  update() {
    const progress = this.getProgress();
    if (progress > 0 && progress < 1) {
      this.isPlaying = true;
    } else if (progress >= 1) {
      this.isPlaying = false;
    }
  }

  /**
   * Display the animation
   */
  show() {
    this.update();
  }
}

/**
 * Text animation class for displaying and animating text
 */
class TextAnimation extends Animation {
  /**
   * @param {p5} p - The p5.js instance
   * @param {Object} options - Text animation options
   * @param {string} options.text - The text to display
   * @param {number} options.x - X position
   * @param {number} options.y - Y position
   * @param {number[]} options.color - RGB color array
   * @param {number} options.size - Font size
   * @param {p5.Font} options.font - Font to use
   */
  constructor(p, options = {}) {
    super(p, options);
    this.text = options.text || "";
    this.x = options.x || p.width / 2;
    this.y = options.y || p.height / 2;
    this.color = options.color || WHITE;
    this.size = options.size || 32;
    this.font = options.font;
    this.opacity = 0;
  }

  update() {
    super.update();
    const progress = this.getProgress();

    // Fade in during first 20% of animation
    if (progress < 0.2) {
      this.opacity = this.p.map(progress, 0, 0.2, 0, 255);
    }
    // Maintain full opacity for middle 60%
    else if (progress < 0.8) {
      this.opacity = 255;
    }
    // Fade out during last 20%
    else {
      this.opacity = this.p.map(progress, 0.8, 1, 255, 0);
    }
  }

  show() {
    super.show();
    if (this.getProgress() > 0) {
      this.p.push();
      if (this.font) this.p.textFont(this.font);
      this.p.textSize(this.size);
      this.p.textAlign(this.p.CENTER, this.p.CENTER);
      this.p.fill(this.color[0], this.color[1], this.color[2], this.opacity);
      this.p.text(this.text, this.x, this.y);
      this.p.pop();
    }
  }
}

/**
 * Shape animation class for basic geometric shapes
 */
class ShapeAnimation extends Animation {
  /**
   * @param {p5} p - The p5.js instance
   * @param {Object} options - Shape animation options
   * @param {string} options.type - Shape type ('circle', 'rect', etc.)
   * @param {number} options.x - X position
   * @param {number} options.y - Y position
   * @param {number[]} options.color - RGB color array
   * @param {number} options.size - Shape size
   */
  constructor(p, options = {}) {
    super(p, options);
    this.type = options.type || 'circle';
    this.x = options.x || p.width / 2;
    this.y = options.y || p.height / 2;
    this.color = options.color || WHITE;
    this.size = options.size || 50;
    this.opacity = 0;
    this.scale = 0;
  }

  update() {
    super.update();
    const progress = this.getProgress();

    // Scale and fade in during first 20% of animation
    if (progress < 0.2) {
      this.opacity = this.p.map(progress, 0, 0.2, 0, 255);
      this.scale = this.p.map(progress, 0, 0.2, 0, 1);
    }
    // Maintain full opacity for middle 60%
    else if (progress < 0.8) {
      this.opacity = 255;
      this.scale = 1;
    }
    // Fade out during last 20%
    else {
      this.opacity = this.p.map(progress, 0.8, 1, 255, 0);
      this.scale = 1;
    }
  }

  show() {
    super.show();
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
}

/**
 * Setup a WebGL canvas with optimizations
 * @param {p5} p - The p5.js instance
 * @param {number} width - Canvas width (default: 1200)
 * @param {number} height - Canvas height (default: 675)
 * @param {number} frameRate - Animation frame rate (default: 30)
 * @returns {WebGLOptimizer} The WebGL optimizer instance
 */
function setupWebGL(p, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, frameRate = DEFAULT_FRAME_RATE) {
  const renderer = p.createCanvas(width, height, p.WEBGL);
  p.frameRate(frameRate);

  // Create and initialize the WebGL optimizer
  const optimizer = new WebGLOptimizer(renderer);
  optimizer.enableOptimizations(p);

  return optimizer;
}

/**
 * Create a cached animation
 * @param {string} id - Unique identifier for the animation
 * @param {Function} creatorFn - Function that creates the animation
 * @returns {Object} The animation object
 */
function createCachedAnimation(id, creatorFn) {
  // Check if the animation is already cached
  let animation = animationCache.getAnimation(id);

  if (!animation) {
    // Create the animation and cache it
    animation = creatorFn();
    animationCache.cacheAnimation(id, animation);
  }

  return animation;
}

// Export the classes and functions
module.exports = {
  // Colors
  BLACK,
  WHITE,
  RED,
  GREEN,
  BLUE,
  YELLOW,
  PURPLE,
  ORANGE,

  // Functions
  setup2D,
  setupWebGL,
  createCachedAnimation,

  // Classes
  Animation,
  TextAnimation,
  ShapeAnimation,

  // Extensions
  EquationAnimation,
  GSAPAnimation,
  GSAPShapeAnimation,
  GSAPTextAnimation,

  // Optimizations
  animationCache,
  WebGLOptimizer
};
