/**
 * Custom wrapper for pdf-parse to avoid the problematic code in index.js
 */
import { default as pdfParseLib } from 'pdf-parse/lib/pdf-parse';

/**
 * Render a PDF page to text
 * @param pageData The PDF page data
 * @returns Promise<string> The extracted text
 */
function renderPage(pageData: any): Promise<string> {
  return new Promise((resolve) => {
    pageData.getTextContent({
      // Normalize whitespace
      normalizeWhitespace: true,
      // Don't combine text items
      disableCombineTextItems: false
    }).then((textContent: any) => {
      let lastY: number | null = null;
      let text = '';
      
      // Process text items with proper line breaks
      for (const item of textContent.items) {
        if (lastY === item.transform[5] || lastY === null) {
          text += item.str;
        } else {
          text += '\n' + item.str;
        }
        lastY = item.transform[5];
      }
      
      resolve(text);
    });
  });
}

/**
 * Parse a PDF buffer and extract text
 * @param dataBuffer The PDF buffer
 * @returns Promise<string> The extracted text
 */
export default async function pdfParse(dataBuffer: Buffer): Promise<string> {
  try {
    // Options for pdf-parse
    const options = {
      // Use our custom page renderer
      pagerender: renderPage,
      // Parse all pages (0 = all)
      max: 0,
      // Use the latest version
      version: 'v1.10.100'
    };
    
    // Call the pdf-parse library directly (bypassing the problematic index.js)
    const result = await pdfParseLib(dataBuffer, options);
    
    return result.text || '';
  } catch (error) {
    console.error('Error in pdf-parse-wrapper:', error);
    throw error;
  }
}
