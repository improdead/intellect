/**
 * WebGL optimizer for manim.js
 * Provides optimizations for WebGL rendering
 */

/**
 * WebGL optimizer class
 * Detects and utilizes WebGL extensions for better performance
 */
class WebGLOptimizer {
  /**
   * @param {p5.Renderer} renderer - The p5.js WebGL renderer
   */
  constructor(renderer) {
    this.renderer = renderer;
    this.gl = this.getWebGLContext();
    this.extensions = {};
    this.initExtensions();
  }
  
  /**
   * Get the WebGL context from the p5.js renderer
   * @returns {WebGLRenderingContext} The WebGL context
   */
  getWebGLContext() {
    if (!this.renderer) {
      console.warn('No renderer provided to WebGLOptimizer');
      return null;
    }
    
    // Access the WebGL context from the p5.js renderer
    return this.renderer.GL || this.renderer._renderer.GL || null;
  }
  
  /**
   * Initialize WebGL extensions
   */
  initExtensions() {
    if (!this.gl) {
      console.warn('No WebGL context available');
      return;
    }
    
    // Check for available extensions
    this.extensions.instancedArrays = this.gl.getExtension('ANGLE_instanced_arrays');
    this.extensions.vao = this.gl.getExtension('OES_vertex_array_object');
    this.extensions.textureFloat = this.gl.getExtension('OES_texture_float');
    this.extensions.textureHalfFloat = this.gl.getExtension('OES_texture_half_float');
    this.extensions.textureHalfFloatLinear = this.gl.getExtension('OES_texture_half_float_linear');
    this.extensions.depthTexture = this.gl.getExtension('WEBGL_depth_texture');
    this.extensions.loseContext = this.gl.getExtension('WEBGL_lose_context');
    this.extensions.drawBuffers = this.gl.getExtension('WEBGL_draw_buffers');
    
    console.log('WebGL extensions initialized:', Object.keys(this.extensions).filter(key => this.extensions[key]));
  }
  
  /**
   * Check if half-float textures are supported
   * @returns {boolean} True if half-float textures are supported
   */
  useHalfFloatTextures() {
    return !!this.extensions.textureHalfFloat && !!this.extensions.textureHalfFloatLinear;
  }
  
  /**
   * Check if instanced drawing is supported
   * @returns {boolean} True if instanced drawing is supported
   */
  useInstancedDrawing() {
    return !!this.extensions.instancedArrays;
  }
  
  /**
   * Check if vertex array objects are supported
   * @returns {boolean} True if vertex array objects are supported
   */
  useVertexArrayObjects() {
    return !!this.extensions.vao;
  }
  
  /**
   * Create an optimized texture
   * @param {number} width - Texture width
   * @param {number} height - Texture height
   * @param {TypedArray} data - Texture data
   * @returns {WebGLTexture} The created texture
   */
  createOptimizedTexture(width, height, data) {
    if (!this.gl) {
      console.warn('No WebGL context available');
      return null;
    }
    
    const gl = this.gl;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    // Use half float if available
    if (this.useHalfFloatTextures() && data) {
      gl.texImage2D(
        gl.TEXTURE_2D, 
        0, 
        gl.RGBA, 
        width, 
        height, 
        0, 
        gl.RGBA, 
        this.extensions.textureHalfFloat.HALF_FLOAT_OES, 
        data
      );
    } else {
      gl.texImage2D(
        gl.TEXTURE_2D, 
        0, 
        gl.RGBA, 
        width, 
        height, 
        0, 
        gl.RGBA, 
        gl.UNSIGNED_BYTE, 
        data
      );
    }
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    return texture;
  }
  
  /**
   * Create a framebuffer for offscreen rendering
   * @param {number} width - Framebuffer width
   * @param {number} height - Framebuffer height
   * @returns {Object} Framebuffer object with texture and framebuffer
   */
  createFramebuffer(width, height) {
    if (!this.gl) {
      console.warn('No WebGL context available');
      return null;
    }
    
    const gl = this.gl;
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    
    // Create a texture to render to
    const texture = this.createOptimizedTexture(width, height, null);
    
    // Attach the texture to the framebuffer
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER, 
      gl.COLOR_ATTACHMENT0, 
      gl.TEXTURE_2D, 
      texture, 
      0
    );
    
    // Create a renderbuffer for depth
    const renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
    
    // Check if framebuffer is complete
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      console.error('Framebuffer not complete:', status);
    }
    
    // Unbind
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    
    return {
      framebuffer,
      texture,
      renderbuffer,
      width,
      height
    };
  }
  
  /**
   * Enable WebGL optimizations
   * @param {p5} p - The p5.js instance
   */
  enableOptimizations(p) {
    if (!p || !this.gl) {
      console.warn('Cannot enable optimizations without p5 instance and WebGL context');
      return;
    }
    
    // Set WebGL parameters for better performance
    this.gl.disable(this.gl.DEPTH_TEST); // Disable depth testing for 2D rendering
    this.gl.enable(this.gl.BLEND); // Enable blending for transparency
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA); // Standard alpha blending
    
    // Set p5.js parameters
    p.setAttributes('antialias', true);
    p.setAttributes('alpha', true);
    
    console.log('WebGL optimizations enabled');
  }
}

module.exports = {
  WebGLOptimizer
};
