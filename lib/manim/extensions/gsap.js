/**
 * GSAP integration for manim.js
 * Provides advanced animation capabilities
 */
const gsap = require('gsap');

/**
 * GSAP-powered animation class
 * Provides more complex easing and animation capabilities
 */
class GSAPAnimation {
  /**
   * @param {p5} p - The p5.js instance
   * @param {Object} options - Animation options
   */
  constructor(p, options = {}) {
    this.p = p;
    this.start = options.start || 0;
    this.duration = options.duration || 60;
    this.end = this.start + this.duration;
    this.isPlaying = false;
    this.targets = [];
    this.timeline = gsap.timeline({ paused: true });
  }
  
  /**
   * Add an animation target with properties to animate
   * @param {Object} target - The object to animate
   * @param {Object} properties - Properties to animate
   * @param {Object} options - Animation options
   * @param {string} options.ease - GSAP easing function
   * @param {number} options.delay - Delay in seconds
   * @param {number} options.duration - Duration in seconds
   * @returns {GSAPAnimation} This animation instance for chaining
   */
  add(target, properties, options = {}) {
    const ease = options.ease || 'power2.inOut';
    const delay = options.delay || 0;
    const duration = options.duration || 1;
    
    this.targets.push(target);
    this.timeline.to(target, {
      ...properties,
      ease,
      delay,
      duration
    });
    
    return this;
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
      this.timeline.progress(progress);
    } else if (progress >= 1) {
      this.isPlaying = false;
      this.timeline.progress(1);
    } else {
      this.timeline.progress(0);
    }
  }
  
  /**
   * Display the animation
   * This method should be overridden by subclasses
   */
  show() {
    this.update();
  }
}

/**
 * GSAP-powered shape animation
 * Animates shapes with advanced easing
 */
class GSAPShapeAnimation extends GSAPAnimation {
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
    this.color = options.color || [255, 255, 255];
    this.size = options.size || 50;
    this.opacity = 0;
    
    // Create a properties object for GSAP to animate
    this.props = {
      x: this.x,
      y: this.y,
      size: 0,
      opacity: 0
    };
    
    // Setup the animation timeline
    this.add(this.props, {
      size: this.size,
      opacity: 255
    }, {
      ease: 'elastic.out(1, 0.3)',
      duration: this.duration / 60 * 0.5
    });
    
    // Add a second animation to fade out
    this.timeline.to(this.props, {
      opacity: 0,
      delay: this.duration / 60 * 0.5,
      duration: this.duration / 60 * 0.2,
      ease: 'power2.in'
    });
  }
  
  /**
   * Display the shape animation
   */
  show() {
    super.show();
    
    if (this.getProgress() > 0) {
      this.p.push();
      this.p.fill(this.color[0], this.color[1], this.color[2], this.props.opacity);
      this.p.noStroke();
      
      if (this.type === 'circle') {
        this.p.ellipse(this.props.x, this.props.y, this.props.size);
      } else if (this.type === 'rect') {
        this.p.rectMode(this.p.CENTER);
        this.p.rect(this.props.x, this.props.y, this.props.size, this.props.size);
      } else if (this.type === 'triangle') {
        const halfSize = this.props.size / 2;
        this.p.triangle(
          this.props.x, this.props.y - halfSize,
          this.props.x - halfSize, this.props.y + halfSize,
          this.props.x + halfSize, this.props.y + halfSize
        );
      }
      
      this.p.pop();
    }
  }
}

/**
 * GSAP-powered text animation
 * Animates text with advanced easing
 */
class GSAPTextAnimation extends GSAPAnimation {
  /**
   * @param {p5} p - The p5.js instance
   * @param {Object} options - Text animation options
   * @param {string} options.text - The text to display
   * @param {number} options.x - X position
   * @param {number} options.y - Y position
   * @param {number[]} options.color - RGB color array
   * @param {number} options.size - Font size
   */
  constructor(p, options = {}) {
    super(p, options);
    
    this.text = options.text || "";
    this.x = options.x || p.width / 2;
    this.y = options.y || p.height / 2;
    this.color = options.color || [255, 255, 255];
    this.size = options.size || 32;
    this.font = options.font;
    
    // Create a properties object for GSAP to animate
    this.props = {
      x: this.x,
      y: this.y - 50, // Start above final position
      size: this.size * 0.5,
      opacity: 0
    };
    
    // Setup the animation timeline
    this.add(this.props, {
      y: this.y,
      size: this.size,
      opacity: 255
    }, {
      ease: 'back.out(1.7)',
      duration: this.duration / 60 * 0.3
    });
    
    // Hold for a while
    this.timeline.to(this.props, {
      delay: this.duration / 60 * 0.5,
      duration: 0
    });
    
    // Fade out and move up
    this.timeline.to(this.props, {
      y: this.y - 30,
      opacity: 0,
      duration: this.duration / 60 * 0.2,
      ease: 'power2.in'
    });
  }
  
  /**
   * Display the text animation
   */
  show() {
    super.show();
    
    if (this.getProgress() > 0) {
      this.p.push();
      if (this.font) this.p.textFont(this.font);
      this.p.textSize(this.props.size);
      this.p.textAlign(this.p.CENTER, this.p.CENTER);
      this.p.fill(this.color[0], this.color[1], this.color[2], this.props.opacity);
      this.p.text(this.text, this.props.x, this.props.y);
      this.p.pop();
    }
  }
}

module.exports = {
  GSAPAnimation,
  GSAPShapeAnimation,
  GSAPTextAnimation
};
