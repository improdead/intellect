/**
 * Animation cache utility
 * Provides caching for animations to improve performance
 */

/**
 * Animation cache class
 * Uses an LRU (Least Recently Used) strategy to manage cached animations
 */
class AnimationCache {
  /**
   * @param {Object} options - Cache options
   * @param {number} options.maxSize - Maximum number of animations to cache
   */
  constructor(options = {}) {
    this.maxSize = options.maxSize || 50;
    this.cache = new Map();
    this.frames = new Map();
    this.lruOrder = [];
  }
  
  /**
   * Cache an animation
   * @param {string} id - Unique identifier for the animation
   * @param {Object} animation - Animation object to cache
   */
  cacheAnimation(id, animation) {
    if (this.cache.has(id)) {
      // Move to the front of LRU
      this.lruOrder = this.lruOrder.filter(cachedId => cachedId !== id);
      this.lruOrder.unshift(id);
      return;
    }
    
    // Check if cache is full
    if (this.lruOrder.length >= this.maxSize) {
      const oldestId = this.lruOrder.pop();
      this.cache.delete(oldestId);
      this.frames.delete(oldestId);
    }
    
    this.cache.set(id, animation);
    this.lruOrder.unshift(id);
  }
  
  /**
   * Get a cached animation
   * @param {string} id - Unique identifier for the animation
   * @returns {Object|null} The cached animation or null if not found
   */
  getAnimation(id) {
    if (!this.cache.has(id)) {
      return null;
    }
    
    // Move to the front of LRU
    this.lruOrder = this.lruOrder.filter(cachedId => cachedId !== id);
    this.lruOrder.unshift(id);
    
    return this.cache.get(id);
  }
  
  /**
   * Cache a frame for an animation
   * @param {string} animationId - Unique identifier for the animation
   * @param {number} frameIndex - Frame index
   * @param {Object} frameData - Frame data to cache
   */
  cacheFrame(animationId, frameIndex, frameData) {
    if (!this.frames.has(animationId)) {
      this.frames.set(animationId, new Map());
    }
    
    const animationFrames = this.frames.get(animationId);
    animationFrames.set(frameIndex, frameData);
  }
  
  /**
   * Get a cached frame
   * @param {string} animationId - Unique identifier for the animation
   * @param {number} frameIndex - Frame index
   * @returns {Object|null} The cached frame or null if not found
   */
  getFrame(animationId, frameIndex) {
    if (!this.frames.has(animationId)) {
      return null;
    }
    
    const animationFrames = this.frames.get(animationId);
    return animationFrames.get(frameIndex) || null;
  }
  
  /**
   * Check if an animation is cached
   * @param {string} id - Unique identifier for the animation
   * @returns {boolean} True if the animation is cached
   */
  hasAnimation(id) {
    return this.cache.has(id);
  }
  
  /**
   * Check if a frame is cached
   * @param {string} animationId - Unique identifier for the animation
   * @param {number} frameIndex - Frame index
   * @returns {boolean} True if the frame is cached
   */
  hasFrame(animationId, frameIndex) {
    if (!this.frames.has(animationId)) {
      return false;
    }
    
    const animationFrames = this.frames.get(animationId);
    return animationFrames.has(frameIndex);
  }
  
  /**
   * Clear the entire cache
   */
  clear() {
    this.cache.clear();
    this.frames.clear();
    this.lruOrder = [];
  }
  
  /**
   * Clear cached frames for an animation
   * @param {string} animationId - Unique identifier for the animation
   */
  clearFrames(animationId) {
    if (this.frames.has(animationId)) {
      this.frames.delete(animationId);
    }
  }
  
  /**
   * Get the number of cached animations
   * @returns {number} Number of cached animations
   */
  size() {
    return this.cache.size;
  }
  
  /**
   * Get the number of cached frames for an animation
   * @param {string} animationId - Unique identifier for the animation
   * @returns {number} Number of cached frames
   */
  frameCount(animationId) {
    if (!this.frames.has(animationId)) {
      return 0;
    }
    
    return this.frames.get(animationId).size;
  }
}

// Create a singleton instance
const animationCache = new AnimationCache();

module.exports = {
  AnimationCache,
  animationCache
};
