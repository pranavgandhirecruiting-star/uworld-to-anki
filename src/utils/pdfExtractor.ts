/**
 * Client-side PDF text extraction using pdf.js.
 * The PDF never leaves the user's machine.
 */

import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Use the local worker file bundled by Vite (no CDN dependency)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface PDFExtractionProgress {
  currentPage: number;
  totalPages: number;
  phase: "extracting" | "done";
}

/**
 * Extract text from a PDF file, page by page.
 * Returns an array of page texts.
 */
export async function extractPDFText(
  file: File,
  onProgress?: (progress: PDFExtractionProgress) => void
): Promise<{ pages: string[]; totalPages: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  const pages: string[] = [];

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pages.push(pageText);

    onProgress?.({
      currentPage: i,
      totalPages,
      phase: "extracting",
    });
  }

  return { pages, totalPages };
}

/**
 * Group pages into batches of roughly equal size for processing.
 * Target ~15-20 pages per batch to stay within Claude context limits.
 */
export function batchPages(pages: string[], batchSize = 15): string[][] {
  const batches: string[][] = [];
  for (let i = 0; i < pages.length; i += batchSize) {
    batches.push(pages.slice(i, i + batchSize));
  }
  return batches;
}
