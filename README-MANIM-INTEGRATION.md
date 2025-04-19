# Manim.js Integration for Video Generation

This document explains how Manim.js is integrated into the video generation system to create mathematical animations.

## Overview

The enhanced video generation system now includes Manim.js for creating mathematical animations. This integration allows the system to generate visually appealing animations for educational content, especially for mathematical concepts.

## Components

### 1. Animation Generator

The `animation-generator.ts` module converts script sections into Manim.js animations:

- Parses the script to identify mathematical content
- Formats the script with timestamps for Manim.js
- Generates Manim.js code for each section
- Creates HTML files with the animations
- Simulates rendering the animations to video files

### 2. Video Composer

The `composer.ts` module combines animations and narrations into a final video:

- Takes animation URLs and narration URLs as input
- Uses FFmpeg to combine animations and narrations for each section
- Concatenates all section videos into a final video
- Adds intro/outro and transitions
- Uploads the final video to Supabase

### 3. Workflow Integration

The LangGraph workflow has been updated to include animation generation:

- Added a new `generateAnimations` node after narration generation
- Updated the `finalizeVideo` node to use the video composer
- Added animations to the state interface and channels

## Manim.js Features

The Manim.js implementation includes several features:

### 1. Mathematical Equation Rendering

Uses KaTeX for high-quality mathematical equation rendering:

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
```

### 2. Advanced Animations with GSAP

Uses GSAP for smooth, professional animations:

```javascript
// Create a GSAP text animation
const title = new GSAPTextAnimation(p, {
  text: "Introduction to Calculus",
  x: p.width/2,
  y: p.height/2,
  color: WHITE,
  size: 48,
  start: 0,
  duration: 60
});

// Add a fade-in animation
title.add({
  opacity: 0
}, {
  opacity: 1,
  ease: 'power2.inOut',
  duration: 1
});
```

### 3. 3D Visualizations

Supports 3D mathematical visualizations:

```javascript
// Create a 3D scene
p.push();
p.ambientLight(60, 60, 60);
p.pointLight(255, 255, 255, 50, 50, 50);
p.rotateX(p.frameCount * 0.01);
p.rotateY(p.frameCount * 0.008);
p.sphere(100);
p.pop();
```

## Implementation Details

### Script to Animation Conversion

The system converts script sections into animations:

1. Parses the script to identify sections with mathematical content
2. Formats the script with timestamps (e.g., "0:00-0:15: Introduction")
3. Generates Manim.js code for each section
4. Creates HTML files with the animations
5. Uses Puppeteer to render the animations to video files

### Animation to Video Conversion

The system combines animations and narrations into a final video:

1. Uses FFmpeg to combine animations and narrations for each section
2. Concatenates all section videos into a final video
3. Adds intro/outro and transitions
4. Uploads the final video to Supabase

## Future Enhancements

1. **Real-time Preview**: Add a real-time preview of animations during generation
2. **Custom Templates**: Allow users to select from different animation templates
3. **Interactive Elements**: Add interactive elements to the animations
4. **WebGL Optimizations**: Implement WebGL optimizations for better performance
5. **Worker-based Rendering**: Use web workers for parallel rendering

## Usage

The Manim.js integration is automatically used as part of the video generation process:

1. Generate a script with mathematical content
2. The system will automatically identify mathematical expressions and create animations
3. The animations will be combined with narrations into a final video

No additional configuration is needed to use this feature.
