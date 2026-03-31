import { useState, useEffect, useRef } from "react";
import { extractPDFText, batchPages } from "../utils/pdfExtractor";
import { chunkTextbookBatch } from "../api/backend";
import {
  hasTextbook,
  getTextbookMeta,
  saveTextbookConcepts,
  saveTextbookMeta,
  clearTextbook,
} from "../utils/textbookDB";

interface Props {
  isPro: boolean;
  isLoggedIn: boolean;
  onUpgrade: () => void;
}

interface ProcessingState {
  phase: "idle" | "extracting" | "chunking" | "done" | "error";
  message: string;
  progress: number; // 0-100
  conceptCount: number;
}

export function TextbookUpload({ isPro, isLoggedIn, onUpgrade }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [connected, setConnected] = useState(false);
  const [meta, setMeta] = useState<{ name: string; processedAt: string; conceptCount: number } | null>(null);
  const [processing, setProcessing] = useState<ProcessingState>({
    phase: "idle",
    message: "",
    progress: 0,
    conceptCount: 0,
  });
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    hasTextbook().then(setConnected);
    getTextbookMeta().then(setMeta);
  }, []);

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setProcessing({ phase: "error", message: "Please upload a PDF file.", progress: 0, conceptCount: 0 });
      return;
    }

    try {
      // Phase 1: Extract text
      setProcessing({ phase: "extracting", message: "Extracting text from PDF...", progress: 5, conceptCount: 0 });

      const { pages, totalPages } = await extractPDFText(file, (p) => {
        const pct = Math.round((p.currentPage / p.totalPages) * 40);
        setProcessing({
          phase: "extracting",
          message: `Extracting page ${p.currentPage} of ${p.totalPages}...`,
          progress: pct,
          conceptCount: 0,
        });
      });

      // Phase 2: Batch and send to backend for chunking
      const batches = batchPages(pages, 15);
      const allConcepts: any[] = [];

      setProcessing({
        phase: "chunking",
        message: `Processing with AI (${batches.length} batches)...`,
        progress: 40,
        conceptCount: 0,
      });

      for (let i = 0; i < batches.length; i++) {
        const result = await chunkTextbookBatch(batches[i], i, batches.length);
        allConcepts.push(...result.concepts);

        const pct = 40 + Math.round(((i + 1) / batches.length) * 55);
        setProcessing({
          phase: "chunking",
          message: `Batch ${i + 1}/${batches.length} done — ${allConcepts.length} concepts found...`,
          progress: pct,
          conceptCount: allConcepts.length,
        });
      }

      // Phase 3: Save to IndexedDB
      await saveTextbookConcepts(allConcepts);
      const newMeta = {
        name: file.name,
        processedAt: new Date().toISOString(),
        conceptCount: allConcepts.length,
      };
      await saveTextbookMeta(newMeta);

      setMeta(newMeta);
      setConnected(true);
      setProcessing({
        phase: "done",
        message: `Done! ${allConcepts.length} concepts extracted from ${totalPages} pages.`,
        progress: 100,
        conceptCount: allConcepts.length,
      });
    } catch (err) {
      setProcessing({
        phase: "error",
        message: err instanceof Error ? err.message : "Processing failed. Please try again.",
        progress: 0,
        conceptCount: 0,
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDisconnect = async () => {
    await clearTextbook();
    setConnected(false);
    setMeta(null);
    setProcessing({ phase: "idle", message: "", progress: 0, conceptCount: 0 });
  };

  // Gate: requires Pro
  if (!isLoggedIn || !isPro) {
    return (
      <div className="textbook-section">
        <div className="textbook-header">
          <h4>Connect Your Textbook</h4>
        </div>
        <p className="textbook-hint">
          Upload your First Aid PDF to get personalized "First Aid says..." insights
          alongside every Smart Search. Your PDF never leaves your machine.
        </p>
        {!isLoggedIn ? (
          <p className="textbook-gate">Sign in above to access this feature.</p>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={onUpgrade}>
            Upgrade to Pro
          </button>
        )}
      </div>
    );
  }

  // Connected state
  if (connected && meta && processing.phase !== "extracting" && processing.phase !== "chunking") {
    return (
      <div className="textbook-section">
        <div className="textbook-header">
          <h4>Textbook Connected</h4>
        </div>
        <div className="textbook-connected">
          <div className="textbook-info">
            <span className="textbook-name">{meta.name}</span>
            <span className="textbook-stats">
              {meta.conceptCount} concepts extracted
            </span>
            <span className="textbook-date">
              Processed {new Date(meta.processedAt).toLocaleDateString()}
            </span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleDisconnect}>
            Remove
          </button>
        </div>
        <p className="textbook-hint">
          Concepts from your textbook will appear in the "High-Yield Review" panel during Smart Search.
        </p>
      </div>
    );
  }

  // Upload/processing state
  return (
    <div className="textbook-section">
      <div className="textbook-header">
        <h4>Connect Your Textbook</h4>
      </div>
      <p className="textbook-hint">
        Upload your First Aid PDF to get personalized "First Aid says..." insights
        alongside every Smart Search. Your PDF is processed locally — it never leaves your machine.
      </p>

      {processing.phase === "idle" || processing.phase === "error" || processing.phase === "done" ? (
        <>
          <div
            className={`textbook-dropzone ${dragOver ? "active" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <div className="dropzone-icon">{"📕"}</div>
            <div className="dropzone-text">
              Drop your PDF here or click to browse
            </div>
            <div className="dropzone-hint">Supports First Aid and similar medical textbooks</div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />
          </div>

          {processing.phase === "error" && (
            <div className="textbook-error">{processing.message}</div>
          )}

          {processing.phase === "done" && (
            <div className="textbook-success">{processing.message}</div>
          )}
        </>
      ) : (
        <div className="textbook-processing">
          <div className="textbook-progress-bar">
            <div
              className="textbook-progress-fill"
              style={{ width: `${processing.progress}%` }}
            />
          </div>
          <p className="textbook-progress-text">{processing.message}</p>
          {processing.conceptCount > 0 && (
            <p className="textbook-concept-count">
              {processing.conceptCount} concepts found so far
            </p>
          )}
        </div>
      )}
    </div>
  );
}
