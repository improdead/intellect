# AI-Powered Educational Video Generator

This project is an AI-powered educational video generator that creates animated videos with voice narration based on user prompts. It uses manim.js for animations, Eleven Labs for voice generation, and Gemini 2.0 Flash for script generation.

## Features

- Generate educational videos from natural language prompts
- Create animated visualizations using manim.js
- Generate high-quality voice narration with Eleven Labs
- Store and serve videos using Supabase

## Technology Stack

- **Frontend**: Next.js, Chakra UI
- **Animation**: manim.js, p5.js
- **Voice Generation**: Eleven Labs
- **Script Generation**: Gemini 2.0 Flash
- **Video Processing**: FFmpeg
- **Storage**: Supabase

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- FFmpeg installed on your system
- Gemini API key
- Eleven Labs API key
- Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables in `.env.local`:
   ```
   ELEVEN_LABS_API_KEY=your_eleven_labs_api_key
   GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```
4. Run the development server:
   ```
   npm run dev
   ```

## How It Works

1. User enters a prompt for an educational video
2. Gemini 2.0 Flash generates a script with timeline
3. The script is used to generate manim.js animation code
4. Eleven Labs generates voice narration for the script
5. The animation and voice are combined into a video
6. The video is stored in Supabase and returned to the user

## Project Structure

- `app/` - Next.js application files
  - `api/` - API routes
  - `components/` - React components
- `lib/` - Utility libraries
  - `ai/` - AI script generation utilities
  - `manim/` - manim.js animation utilities
  - `video/` - Video composition utilities
  - `voice/` - Voice generation utilities

## License

This project is licensed under the MIT License.
