import { useState, useEffect, useRef } from "react";
import {
  subscribe,
  processTextbook,
  type ProcessingState,
} from "../utils/textbookProcessor";

interface Props {
  isPro: boolean;
  isLoggedIn: boolean;
  onUpgrade: () => void;
  onComplete?: () => void;
}

export function TextbookUpload({ isPro, isLoggedIn, onUpgrade, onComplete }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState<ProcessingState>({
    phase: "idle",
    message: "",
    detail: "",
    progress: 0,
    conceptCount: 0,
  });
  const [dragOver, setDragOver] = useState(false);

  // Subscribe to module-level processing state (survives tab switches)
  useEffect(() => {
    const unsub = subscribe((state) => {
      setProcessing(state);
      if (state.phase === "done" && onComplete) {
        onComplete();
      }
    });
    return unsub;
  }, [onComplete]);

  const handleFile = (file: File) => {
    processTextbook(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // Gate: requires Pro
  if (!isLoggedIn || !isPro) {
    return (
      <div className="textbook-gate-msg">
        {!isLoggedIn ? (
          <p>Sign in above to upload textbooks.</p>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={onUpgrade}>
            Upgrade to Pro
          </button>
        )}
      </div>
    );
  }

  const isActive =
    processing.phase === "reading" ||
    processing.phase === "extracting" ||
    processing.phase === "chunking" ||
    processing.phase === "saving";

  // Show processing state
  if (isActive) {
    return (
      <div className="textbook-processing">
        <div className="textbook-phase-label">
          {processing.phase === "reading" && "Step 1/4 — Reading file"}
          {processing.phase === "extracting" && "Step 2/4 — Extracting text"}
          {processing.phase === "chunking" && "Step 3/4 — AI analysis"}
          {processing.phase === "saving" && "Step 4/4 — Saving"}
        </div>
        <div className="textbook-progress-bar">
          <div
            className="textbook-progress-fill"
            style={{ width: `${processing.progress}%` }}
          />
        </div>
        <p className="textbook-progress-message">{processing.message}</p>
        <p className="textbook-progress-detail">{processing.detail}</p>
        {processing.conceptCount > 0 && (
          <p className="textbook-concept-count">
            {processing.conceptCount} concepts found so far
          </p>
        )}
      </div>
    );
  }

  // Upload zone — always shown (allows uploading or replacing)
  return (
    <>
      <div
        className={`textbook-dropzone ${dragOver ? "active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <div className="dropzone-icon">{"📕"}</div>
        <div className="dropzone-text">
          Drop your PDF here or click to browse
        </div>
        <div className="dropzone-hint">
          Supports any medical textbook PDF
        </div>
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
  );
}
