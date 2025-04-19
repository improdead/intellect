import { NextResponse, type NextRequest } from 'next/server';
import { extractTextFromPdf } from '@/lib/pdf-utils';
import { generateQuizFromText } from '@/lib/gemini-service';

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Accepted file types
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/x-pdf'
];

export async function POST(request: NextRequest) {
  try {
    console.log('Starting quiz generation process');

    // Get form data from request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const questionCount = parseInt(formData.get('questionCount') as string || '10', 10);

    console.log(`Received file upload: ${file?.name}, Size: ${file?.size} bytes, Type: ${file?.type}`);

    // Validate that we actually received a file
    if (!file || !(file instanceof File)) {
      console.error('No valid file received in the request');
      return NextResponse.json({ error: 'No valid file provided' }, { status: 400 });
    }

    // Validate file
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Get file extension
    const fileExt = file.name.split('.').pop()?.toLowerCase();

    // Validate file type
    if (!ACCEPTED_FILE_TYPES.includes(file.type) &&
        (!fileExt || fileExt !== 'pdf')) {
      return NextResponse.json({ error: 'Invalid file type. Only PDF files are accepted.' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds the maximum limit of 10MB.' }, { status: 400 });
    }

    // Validate question count
    if (isNaN(questionCount) || questionCount < 1 || questionCount > 20) {
      return NextResponse.json({ error: 'Question count must be between 1 and 20.' }, { status: 400 });
    }

    console.log(`Processing PDF file: ${file.name}, Size: ${file.size} bytes`);

    // Extract text from PDF
    let documentText = '';
    try {
      console.log('Starting PDF text extraction...');

      // Get the file buffer
      let fileBuffer: ArrayBuffer;
      try {
        fileBuffer = await file.arrayBuffer();
        console.log(`Successfully read file buffer, size: ${fileBuffer.byteLength} bytes`);
      } catch (bufferError) {
        console.error('Error reading file buffer:', bufferError);
        return NextResponse.json({
          error: 'Failed to read the uploaded file. The file may be corrupted.'
        }, { status: 400 });
      }

      // Extract text from the PDF
      documentText = await extractTextFromPdf(fileBuffer);

      console.log(`Text extracted successfully. Length: ${documentText.length} characters`);

      // If text is too short, return error
      if (documentText.length < 100) {
        return NextResponse.json({
          error: 'The PDF contains too little text to generate a quiz. Please try a different PDF with more textual content.'
        }, { status: 400 });
      }

      // Log a sample of the extracted text for debugging
      const textSample = documentText.substring(0, 200).replace(/\n/g, ' ');
      console.log(`Text sample: ${textSample}...`);

    } catch (extractionError: any) {
      console.error('ERROR during text extraction:', extractionError);

      // Provide specific error messages based on the error
      let errorMessage = extractionError.message || 'Unknown error';
      let helpText = 'Please ensure the PDF contains selectable text and is not just scanned images.';
      let statusCode = 500;

      console.log('Full error details:', JSON.stringify(extractionError));

      if (errorMessage.includes('scanned images') || errorMessage.includes('protected')) {
        helpText = 'This appears to be a scanned document or protected PDF. Try using a PDF with actual text content that is not password-protected.';
        statusCode = 400; // Bad request is more appropriate for unsupported content
      } else if (errorMessage.includes('Failed to save') || errorMessage.includes('Failed to parse')) {
        helpText = 'There was an issue processing your PDF. Please try again with a different file.';
        statusCode = 400;
      } else if (errorMessage.includes('Invalid PDF')) {
        helpText = 'The uploaded file appears to be invalid or corrupted. Please try a different PDF file.';
        statusCode = 400;
      } else if (errorMessage.includes('ENOENT') || errorMessage.includes('no such file')) {
        // This should not happen with our new implementation, but just in case
        helpText = 'There was an internal error processing your PDF. Please try again with a different file.';
        statusCode = 500;
      }

      return NextResponse.json({
        error: `Failed to extract text from PDF: ${errorMessage}. ${helpText}`
      }, { status: statusCode });
    }

    // Generate quiz questions using Gemini API
    try {
      console.log(`Generating ${questionCount} quiz questions`);
      const quizData = await generateQuizFromText(documentText, questionCount);

      console.log('Quiz generated successfully');

      // Return the generated quiz data
      return NextResponse.json({
        quiz: quizData,
        message: 'Quiz generated successfully',
      }, { headers: { 'Content-Type': 'application/json' } });
    } catch (aiError: any) {
      console.error('ERROR during AI quiz generation:', aiError);
      return NextResponse.json({
        error: `Failed to generate quiz: ${aiError.message || 'Unknown error'}`
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('FATAL ERROR in quiz generation API:', error);
    return NextResponse.json({
      error: `An unexpected error occurred: ${error.message || 'Unknown error'}`
    }, { status: 500 });
  }
}
