# Enhanced Manim.js Library

This is an enhanced version of the manim.js library for creating mathematical animations. It includes several improvements and new features to make it more powerful and easier to use.

## Features

### 1. KaTeX Integration

The library now includes KaTeX for high-quality mathematical equation rendering:

```javascript
// Create an equation animation
const equation = new EquationAnimation(p, {
  latex: "\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}",
  x: p.width/2,
  y: p.height/2,
  color: YELLOW,
  size: 40,
  start: 30,
  duration: 60,
  displayMode: true
});

equation.show();
```

### 2. GSAP Animation

GSAP (GreenSock Animation Platform) is integrated for more complex and smoother animations:

```javascript
// Create a GSAP text animation
const text = new GSAPTextAnimation(p, {
  text: "Hello, World!",
  x: p.width/2,
  y: p.height/2,
  color: WHITE,
  size: 32,
  start: 0,
  duration: 60
});

text.show();
```

### 3. Animation Caching

Animations can now be cached for better performance:

```javascript
// Create a cached animation
const animation = createCachedAnimation('unique-id', () => {
  return new TextAnimation(p, {
    text: "Cached Animation",
    x: p.width/2,
    y: p.height/2,
    color: WHITE,
    size: 32,
    start: 0,
    duration: 60
  });
});

animation.show();
```

### 4. WebGL Optimizations

WebGL rendering is now optimized for better performance:

```javascript
// Setup WebGL with optimizations
const optimizer = setupWebGL(p);
```

### 5. 3D Visualizations

The library now supports 3D visualizations:

```javascript
// In WebGL mode
p.push();
p.ambientLight(60, 60, 60);
p.pointLight(255, 255, 255, 50, 50, 50);
p.rotateX(p.frameCount * 0.01);
p.rotateY(p.frameCount * 0.008);
p.specularMaterial(BLUE);
p.sphere(100);
p.pop();
```

## Usage

### Basic Setup

```javascript
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
  p.setup = function() {
    setup2D(p);
    // or for WebGL: setupWebGL(p);
  };
  
  p.draw = function() {
    p.background(0);
    
    // Your animations here
  };
};

new p5(ManimAnimation);
```

### Automatic Code Generation

You can also use the generator to automatically create animations from a script with timeline:

```javascript
const { generateManimCode } = require('./lib/manim/generator');

const script = `
0:00-0:15: Introduction to Mathematical Animations
This is a test of the enhanced manim.js library.

0:15-0:30: Mathematical Equation
The Pythagorean theorem states that $a^2 + b^2 = c^2$ for right triangles.
`;

const manimCode = generateManimCode(script);
```

## Dependencies

- p5.js: For canvas rendering
- KaTeX: For equation rendering
- GSAP: For advanced animations

## Testing

You can test the library using the provided test file:

```
node test/manim-test.js
```

This will generate a test animation and an HTML file to view it in a browser.

## License

MIT
