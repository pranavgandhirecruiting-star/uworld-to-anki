/**
 * Module-level textbook processor that runs independently of React lifecycle.
 * Processing survives tab switches because it's not tied to a component.
 */

import { extractPDFText, batchPages } from "./pdfExtractor";
import { chunkTextbookBatch } from "../api/backend";
import {
  saveTextbookConcepts,
  saveTextbookMeta,
} from "./textbookDB";

export interface ProcessingState {
  phase: "idle" | "reading" | "extracting" | "chunking" | "saving" | "done" | "error";
  message: string;
  detail: string;
  progress: number; // 0-100
  conceptCount: number;
}

type Listener = (state: ProcessingState) => void;

// Module-level state — persists across component mounts/unmounts
let currentState: ProcessingState = {
  phase: "idle",
  message: "",
  detail: "",
  progress: 0,
  conceptCount: 0,
};
let listeners: Set<Listener> = new Set();
let isRunning = false;

function setState(update: Partial<ProcessingState>) {
  currentState = { ...currentState, ...update };
  listeners.forEach((fn) => fn(currentState));
}

/** Subscribe to processing state changes. Returns unsubscribe function. */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  // Immediately send current state
  listener(currentState);
  return () => listeners.delete(listener);
}

/** Get current processing state without subscribing. */
export function getProcessingState(): ProcessingState {
  return currentState;
}

/** Returns true if processing is currently in progress. */
export function isProcessing(): boolean {
  return isRunning;
}

/** Start processing a PDF file. Safe to call while already processing (will be ignored). */
export async function processTextbook(file: File): Promise<void> {
  if (isRunning) return;
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    setState({ phase: "error", message: "Please upload a PDF file.", detail: "", progress: 0, conceptCount: 0 });
    return;
  }

  isRunning = true;

  try {
    // Phase 1: Read file into memory
    setState({
      phase: "reading",
      message: "Reading PDF file...",
      detail: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      progress: 2,
      conceptCount: 0,
    });

    // Phase 2: Extract text page by page
    setState({
      phase: "extracting",
      message: "Extracting text from PDF...",
      detail: "Initializing PDF parser...",
      progress: 5,
      conceptCount: 0,
    });

    const { pages, totalPages } = await extractPDFText(file, (p) => {
      const pct = 5 + Math.round((p.currentPage / p.totalPages) * 30);
      const speed = p.currentPage > 5 ? ` (~${Math.round((p.totalPages - p.currentPage) * 0.05)}s remaining)` : "";
      setState({
        phase: "extracting",
        message: `Extracting text — page ${p.currentPage} of ${p.totalPages}`,
        detail: `${Math.round((p.currentPage / p.totalPages) * 100)}% complete${speed}`,
        progress: pct,
        conceptCount: 0,
      });
    });

    // Phase 3: Batch and send to Claude
    const batches = batchPages(pages, 15);
    const allConcepts: any[] = [];
    const CONCURRENCY = 4; // ~37k tokens/round, well within Haiku's ~150k/min limit
    const DELAY_MS = 5000; // 5s pause between rounds (~27 RPM, under 50 RPM limit)
    let completed = 0;

    setState({
      phase: "chunking",
      message: `Analyzing content with AI...`,
      detail: `0/${batches.length} batches`,
      progress: 35,
      conceptCount: 0,
    });

    for (let start = 0; start < batches.length; start += CONCURRENCY) {
      const chunk = batches.slice(start, start + CONCURRENCY);
      const promises = chunk.map((batch, offset) =>
        chunkTextbookBatch(batch, start + offset, batches.length)
      );
      const results = await Promise.all(promises);
      for (const result of results) {
        allConcepts.push(...result.concepts);
      }
      completed += chunk.length;

      const pct = 35 + Math.round((completed / batches.length) * 55);
      const batchesLeft = batches.length - completed;
      const estMinutes = Math.ceil((batchesLeft / CONCURRENCY) * (DELAY_MS / 1000 + 8) / 60);
      setState({
        phase: "chunking",
        message: `Analyzing content with AI...`,
        detail: `${completed}/${batches.length} batches — ${allConcepts.length} concepts found${batchesLeft > 0 ? ` (~${estMinutes} min left)` : ""}`,
        progress: pct,
        conceptCount: allConcepts.length,
      });

      // Rate limit pause between rounds (skip after last round)
      if (start + CONCURRENCY < batches.length) {
        await new Promise((r) => setTimeout(r, DELAY_MS));
      }
    }

    // Phase 4: Save to IndexedDB
    setState({
      phase: "saving",
      message: "Saving concepts to local database...",
      detail: `${allConcepts.length} concepts`,
      progress: 95,
      conceptCount: allConcepts.length,
    });

    await saveTextbookConcepts(allConcepts);
    await saveTextbookMeta({
      name: file.name,
      processedAt: new Date().toISOString(),
      conceptCount: allConcepts.length,
    });

    setState({
      phase: "done",
      message: "Textbook processed successfully!",
      detail: `${allConcepts.length} concepts from ${totalPages} pages`,
      progress: 100,
      conceptCount: allConcepts.length,
    });
  } catch (err) {
    setState({
      phase: "error",
      message: err instanceof Error ? err.message : "Processing failed.",
      detail: "Please try again.",
      progress: 0,
      conceptCount: 0,
    });
  } finally {
    isRunning = false;
  }
}

/** Reset state back to idle. */
export function resetProcessing(): void {
  if (isRunning) return;
  currentState = {
    phase: "idle",
    message: "",
    detail: "",
    progress: 0,
    conceptCount: 0,
  };
}
