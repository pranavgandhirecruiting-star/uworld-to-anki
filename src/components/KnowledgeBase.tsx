import { useState, useEffect } from "react";
import { TextbookUpload } from "./TextbookUpload";
import { hasTextbook, getTextbookMeta } from "../utils/textbookDB";
import { FIRST_AID_CONCEPTS } from "../data/firstAidConcepts";

interface Props {
  isPro: boolean;
  isLoggedIn: boolean;
  onUpgrade: () => void;
}

export function KnowledgeBase({ isPro, isLoggedIn, onUpgrade }: Props) {
  const [textbookConnected, setTextbookConnected] = useState(false);
  const [textbookMeta, setTextbookMeta] = useState<{
    name: string;
    processedAt: string;
    conceptCount: number;
  } | null>(null);

  useEffect(() => {
    hasTextbook().then(setTextbookConnected);
    getTextbookMeta().then(setTextbookMeta);
  }, []);

  return (
    <div className="knowledge-base">
      <div className="kb-header">
        <h3>Knowledge Base</h3>
        <p>
          Ollopa uses a medical knowledge base to enrich every Smart Search with
          high-yield teaching points, key differentiators, and common exam traps.
          This context is injected into the AI analysis alongside your Anki cards.
        </p>
      </div>

      {/* Built-in First Aid bank */}
      <div className="kb-source">
        <div className="kb-source-header">
          <div className="kb-source-info">
            <span className="kb-source-name">First Aid for USMLE Step 1 (2026)</span>
            <span className="kb-source-badge built-in">Built-in</span>
          </div>
          <span className="kb-source-count">{FIRST_AID_CONCEPTS.length} concepts</span>
        </div>
        <p className="kb-source-desc">
          Pre-loaded concept bank covering all major organ systems — Pharmacology,
          Pathology, Physiology, Biochemistry, Immunology, and more. Automatically
          matched to every Smart Search query.
        </p>
      </div>

      {/* User-uploaded textbook */}
      {textbookConnected && textbookMeta && (
        <div className="kb-source">
          <div className="kb-source-header">
            <div className="kb-source-info">
              <span className="kb-source-name">{textbookMeta.name}</span>
              <span className="kb-source-badge uploaded">Uploaded</span>
            </div>
            <span className="kb-source-count">{textbookMeta.conceptCount} concepts</span>
          </div>
          <p className="kb-source-desc">
            Your uploaded textbook concepts are merged with the built-in bank and
            given a slight relevance boost in search results.
            Processed {new Date(textbookMeta.processedAt).toLocaleDateString()}.
          </p>
        </div>
      )}

      {/* How it works */}
      <div className="kb-how-it-works">
        <h4>How It Works</h4>
        <div className="kb-steps">
          <div className="kb-step">
            <span className="kb-step-num">1</span>
            <div>
              <strong>You paste a question</strong>
              <p>AI extracts the key medical concepts being tested.</p>
            </div>
          </div>
          <div className="kb-step">
            <span className="kb-step-num">2</span>
            <div>
              <strong>Knowledge base is searched</strong>
              <p>Concepts are matched against {FIRST_AID_CONCEPTS.length}+ entries to find relevant high-yield facts.</p>
            </div>
          </div>
          <div className="kb-step">
            <span className="kb-step-num">3</span>
            <div>
              <strong>AI generates insights</strong>
              <p>The matched knowledge is injected into the AI prompt, producing
              richer explanations and more targeted card recommendations.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload section */}
      <div className="kb-upload-section">
        <h4>Add Another Textbook</h4>
        <p className="kb-upload-desc">
          Upload a PDF of any medical textbook (Pathoma, Costanzo, Sketchy notes, etc.)
          to expand your knowledge base. Your PDF is processed locally and never leaves your machine.
        </p>
        <TextbookUpload isPro={isPro} isLoggedIn={isLoggedIn} onUpgrade={onUpgrade} />
      </div>
    </div>
  );
}
