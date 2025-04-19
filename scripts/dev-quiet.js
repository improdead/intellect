#!/usr/bin/env node

/**
 * A script to run Next.js dev server with minimal console output
 * This script filters out webpack module resolution logs and other verbose output
 */

const { spawn } = require('child_process');
const path = require('path');

// Set environment variables to reduce output
process.env.NEXT_WEBPACK_LOGGING = 'none';
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NEXT_DISABLE_SOURCEMAPS = '1';

// Start Next.js dev server
const nextDev = spawn('next', ['dev'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  env: {
    ...process.env,
    NODE_ENV: 'development',
  },
});

// Filter stdout
nextDev.stdout.on('data', (data) => {
  const output = data.toString();
  
  // Skip webpack module resolution logs (the yellow text)
  if (output.includes('=|next/dist/compiled') || 
      output.includes('webpack.') ||
      output.includes('LOG from webpack') ||
      output.includes('assets by path') ||
      output.includes('asset ') ||
      output.includes('compiled successfully') ||
      output.includes('hidden lines')) {
    return;
  }
  
  // Print other output
  process.stdout.write(output);
});

// Pass through stderr
nextDev.stderr.on('data', (data) => {
  process.stderr.write(data);
});

// Handle process exit
nextDev.on('close', (code) => {
  process.exit(code);
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  nextDev.kill('SIGINT');
});
