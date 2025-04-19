/**
 * Utility functions for handling PDF files
 */
import { PDFDocument } from 'pdf-lib';

/**
 * Extract text from a PDF file
 * @param pdfBuffer The PDF file buffer
 * @returns The extracted text
 */
export async function extractTextFromPdf(pdfBuffer: ArrayBuffer): Promise<string> {
  try {
    // Validate input
    if (!pdfBuffer || pdfBuffer.byteLength === 0) {
      throw new Error('Invalid PDF buffer: Buffer is empty or undefined');
    }

    console.log(`Processing PDF buffer of size: ${pdfBuffer.byteLength} bytes`);

    try {
      // Load the PDF document using pdf-lib
      const pdfDoc = await PDFDocument.load(pdfBuffer, {
        // Ignore encryption to handle more PDFs
        ignoreEncryption: true,
      });

      // Get document information
      const pageCount = pdfDoc.getPageCount();
      console.log(`PDF has ${pageCount} pages`);

      // Since pdf-lib doesn't have direct text extraction capabilities,
      // we'll use a fallback to pdf-parse but with a custom approach

      // Import pdf-parse dynamically but avoid the problematic index.js
      const pdfParse = (await import('./pdf-parse-wrapper')).default;

      // Convert ArrayBuffer to Buffer for pdf-parse
      const buffer = Buffer.from(pdfBuffer);

      // Extract text using our custom wrapper
      const text = await pdfParse(buffer);

      console.log(`Successfully extracted ${text.length} characters from PDF`);

      if (text.length < 100) {
        console.warn('Extracted text is very short, PDF may be scanned images or protected');
      }

      return text;
    } catch (parseError: any) {
      console.error('Error parsing PDF:', parseError);
      throw new Error(`Failed to parse PDF: ${parseError.message}`);
    }
  } catch (error: any) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}
