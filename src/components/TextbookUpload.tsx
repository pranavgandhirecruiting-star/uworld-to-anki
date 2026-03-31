import { useState, useEffect, useRef } from "react";
import {
  subscribe,
  processTextbook,
  type ProcessingState,
} from "../utils/textbookProcessor";
import {
  hasTextbook,
  getTextbookMeta,
  clearTextbook,
} from "../utils/textbookDB";

interface Props {
  isPro: boolean;
  isLoggedIn: boolean;
  onUpgrade: () => void;
}

export function TextbookUpload({ isPro, isLoggedIn, onUpgrade }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [connected, setConnected] = useState(false);
  const [meta, setMeta] = useState<{
    name: string;
    processedAt: string;
    conceptCount: number;
  } | null>(null);
  const [processing, setProcessing] = useState<ProcessingState>({
    phase: "idle",
    message: "",
    detail: "",
    progress: 0,
    conceptCount: 0,
  });
  const [dragOver, setDragOver] = useState(false);

  // Load initial state
  useEffect(() => {
    hasTextbook().then(setConnected);
    getTextbookMeta().then(setMeta);
  }, []);

  // Subscribe to module-level processing state (survives tab switches)
  useEffect(() => {
    const unsub = subscribe((state) => {
      setProcessing(state);
      // When done, refresh connection status
      if (state.phase === "done") {
        hasTextbook().then(setConnected);
        getTextbookMeta().then(setMeta);
      }
    });
    return unsub;
  }, []);

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

  const handleDisconnect = async () => {
    await clearTextbook();
    setConnected(false);
    setMeta(null);
  };

  // Gate: requires Pro
  if (!isLoggedIn || !isPro) {
    return (
      <div className="textbook-section">
        <div className="textbook-header">
          <h4>Connect Your Textbook</h4>
        </div>
        <p className="textbook-hint">
          Upload your First Aid PDF to get personalized "First Aid says..."
          insights alongside every Smart Search. Your PDF never leaves your
          machine.
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

  const isActive =
    processing.phase === "reading" ||
    processing.phase === "extracting" ||
    processing.phase === "chunking" ||
    processing.phase === "saving";

  // Connected state (not actively processing)
  if (connected && meta && !isActive) {
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
          Concepts from your textbook will appear in the "High-Yield Review"
          panel during Smart Search.
        </p>
      </div>
    );
  }

  // Upload / processing state
  return (
    <div className="textbook-section">
      <div className="textbook-header">
        <h4>Connect Your Textbook</h4>
      </div>
      <p className="textbook-hint">
        Upload your First Aid PDF to get personalized "First Aid says..." insights
        alongside every Smart Search. Your PDF is processed locally — it never
        leaves your machine.
      </p>

      {!isActive ? (
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
              Supports First Aid and similar medical textbooks
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
            <div className="textbook-success">
              {processing.message}
            </div>
          )}
        </>
      ) : (
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
      )}
    </div>
  );
}
