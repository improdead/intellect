/**
 * KaTeX integration for manim.js
 * Provides high-performance equation rendering
 */
const katex = require('katex');

/**
 * Equation animation class for rendering mathematical equations
 * Extends the base Animation class
 */
class EquationAnimation {
  /**
   * @param {p5} p - The p5.js instance
   * @param {Object} options - Equation animation options
   * @param {string} options.latex - LaTeX equation string
   * @param {number} options.x - X position
   * @param {number} options.y - Y position
   * @param {number[]} options.color - RGB color array
   * @param {number} options.size - Font size
   * @param {number} options.start - Start time in frames
   * @param {number} options.duration - Duration in frames
   * @param {boolean} options.displayMode - KaTeX display mode
   */
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
    this.isPlaying = false;
    this.opacity = 0;
    this.displayMode = options.displayMode !== undefined ? options.displayMode : true;
    
    // Render the LaTeX to HTML
    this.html = this.renderLatex();
    
    // Create an offscreen canvas for rendering
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = this.size * 10; // Approximate width
    this.offscreenCanvas.height = this.size * 3; // Approximate height
    this.offscreenCtx = this.offscreenCanvas.getContext('2d');
    
    // Render the equation to the offscreen canvas
    this.renderToCanvas();
  }
  
  /**
   * Render LaTeX to HTML using KaTeX
   * @returns {string} Rendered HTML
   */
  renderLatex() {
    try {
      return katex.renderToString(this.latex, {
        throwOnError: false,
        displayMode: this.displayMode,
        output: 'html'
      });
    } catch (error) {
      console.error('Error rendering LaTeX:', error);
      return `<span style="color: red;">Error: ${error.message}</span>`;
    }
  }
  
  /**
   * Render the equation to an offscreen canvas
   */
  renderToCanvas() {
    // Create a temporary div to hold the rendered equation
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.html;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.fontSize = `${this.size}px`;
    document.body.appendChild(tempDiv);
    
    // Use html2canvas or similar library to render the equation to canvas
    // For simplicity, we're using a basic approach here
    const katexElement = tempDiv.querySelector('.katex');
    if (katexElement) {
      // Adjust canvas size based on actual rendered size
      this.offscreenCanvas.width = katexElement.offsetWidth;
      this.offscreenCanvas.height = katexElement.offsetHeight;
      
      // In a real implementation, you would use html2canvas or similar
      // For now, we'll just draw a placeholder
      this.offscreenCtx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, 1)`;
      this.offscreenCtx.font = `${this.size}px serif`;
      this.offscreenCtx.textAlign = 'center';
      this.offscreenCtx.textBaseline = 'middle';
      this.offscreenCtx.fillText(this.latex, this.offscreenCanvas.width / 2, this.offscreenCanvas.height / 2);
    }
    
    // Clean up
    document.body.removeChild(tempDiv);
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
    
    if (progress > 0 && progress < 1) {
      this.isPlaying = true;
    } else if (progress >= 1) {
      this.isPlaying = false;
    }
  }
  
  /**
   * Display the equation animation
   */
  show() {
    this.update();
    
    if (this.getProgress() > 0) {
      this.p.push();
      this.p.tint(this.color[0], this.color[1], this.color[2], this.opacity);
      this.p.imageMode(this.p.CENTER);
      this.p.image(
        this.offscreenCanvas, 
        this.x, 
        this.y, 
        this.offscreenCanvas.width, 
        this.offscreenCanvas.height
      );
      this.p.pop();
    }
  }
}

module.exports = {
  EquationAnimation
};
