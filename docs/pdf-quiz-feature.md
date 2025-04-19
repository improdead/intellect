# PDF Quiz Generator Feature

This feature allows users to upload PDF documents and generate quiz questions based on the content using Google's Gemini AI model.

## Features

- Upload PDF documents (up to 10MB)
- Extract text content from PDFs
- Generate multiple-choice quiz questions using Gemini AI
- Interactive quiz interface with explanations
- Score tracking and results summary

## Implementation Details

### Components

1. **PDF Uploader (`components/pdf-uploader.tsx`)**
   - Handles file selection and validation
   - Supports drag-and-drop functionality
   - Validates file type and size

2. **Quiz Display (`components/quiz-display.tsx`)**
   - Displays generated quiz questions
   - Handles user interactions and scoring
   - Provides feedback and explanations

3. **PDF Quiz Page (`app/dashboard/pdf-quiz/page.tsx`)**
   - Main page component that integrates the uploader and quiz display
   - Manages the quiz generation process

### API Endpoints

1. **Quiz Generation API (`app/api/quiz/generate/route.ts`)**
   - Processes PDF uploads
   - Extracts text from PDFs
   - Calls Gemini API to generate quiz questions
   - Returns formatted quiz data

### Utilities

1. **PDF Utilities (`lib/pdf-utils.ts`)**
   - Extracts text content from PDF files

2. **Gemini Service (`lib/gemini-service.ts`)**
   - Handles communication with Google's Gemini AI
   - Formats prompts and processes responses

## Configuration

### Environment Variables

The following environment variables should be added to your `.env.local` file:

- `GOOGLE_API_KEY`: Your Google API key for accessing Gemini AI
- `GOOGLE_AI_MODEL`: The Gemini model to use (defaults to 'gemini-2.0-flash')

### System Requirements

The PDF text extraction feature has no special system requirements:

- Uses pure JavaScript libraries for text extraction
- No external dependencies or command-line tools needed
- Works on all platforms (Windows, macOS, Linux) without additional setup

## Usage

1. Navigate to the PDF Quiz page
2. Upload a PDF document (must be less than 10MB)
3. Wait for the quiz to be generated
4. Answer the questions and check your answers
5. View your final score and explanations

## Technical Notes

- The feature uses a combination of `pdf-lib` and a custom `pdf-parse` wrapper for PDF text extraction
  - `pdf-lib` is used to validate and analyze the PDF structure
  - A custom wrapper around `pdf-parse` is used to extract text while avoiding problematic code
  - This approach provides robust text extraction without file system dependencies
- The text extraction process is streamlined and efficient:
  1. First validates the PDF structure using `pdf-lib`
  2. Then extracts text using our custom PDF parsing implementation
- Quiz generation is done using Google's Gemini AI model with the 'gemini-2.0-flash' model
- The quiz questions are multiple-choice with 4 options (A, B, C, D) and include explanations
- The implementation includes proper error handling, validation, and loading states
- For best results, use PDFs with actual text content rather than scanned images
