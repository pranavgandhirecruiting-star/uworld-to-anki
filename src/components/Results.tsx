import { useState } from "react";
import type { QIDResult } from "../api/ankiConnect";
import { unsuspendCards } from "../api/ankiConnect";

interface Props {
  results: QIDResult[];
  onUnsuspended: (qid: string, count: number) => void;
  onUnsuspendedAll: (total: number) => void;
}

function getFieldPreview(fields: Record<string, { value: string; order: number }>): string {
  // Try common AnKing field names
  const candidates = ["Text", "Extra", "Cloze", "Front", "Back"];
  for (const name of candidates) {
    if (fields[name]?.value) {
      // Strip HTML tags for preview
      const text = fields[name].value.replace(/<[^>]*>/g, "").trim();
      if (text) return text.slice(0, 150) + (text.length > 150 ? "..." : "");
    }
  }
  // Fallback: first non-empty field
  const sorted = Object.values(fields).sort((a, b) => a.order - b.order);
  for (const f of sorted) {
    const text = f.value.replace(/<[^>]*>/g, "").trim();
    if (text) return text.slice(0, 150) + (text.length > 150 ? "..." : "");
  }
  return "(no preview available)";
}

function QIDResultCard({ result, onUnsuspended }: {
  result: QIDResult;
  onUnsuspended: (qid: string, count: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [unsuspending, setUnsuspending] = useState(false);
  const [unsuspendedIds, setUnsuspendedIds] = useState<Set<number>>(new Set());

  const suspendedCards = result.cards.filter(
    (c) => c.queue === -1 && !unsuspendedIds.has(c.cardId)
  );

  const handleUnsuspend = async () => {
    const ids = suspendedCards.map((c) => c.cardId);
    if (ids.length === 0) return;
    setUnsuspending(true);
    try {
      await unsuspendCards(ids);
      setUnsuspendedIds((prev) => new Set([...prev, ...ids]));
      onUnsuspended(result.qid, ids.length);
    } catch (err) {
      console.error("Failed to unsuspend:", err);
    }
    setUnsuspending(false);
  };

  if (result.totalCount === 0) {
    return (
      <div className="result-card no-results">
        <div className="result-header">
          <span className="qid-badge">QID {result.qid}</span>
          <span className="result-count warning">No cards found</span>
        </div>
        <p className="result-hint">
          This QID may not be tagged in your AnKing deck, or you may be using an
          older version without this QID mapping.
        </p>
      </div>
    );
  }

  return (
    <div className="result-card">
      <div className="result-header">
        <span className="qid-badge">QID {result.qid}</span>
        <span className="result-count">
          {result.totalCount} card{result.totalCount === 1 ? "" : "s"}
          {suspendedCards.length > 0 && (
            <span className="suspended-badge">
              {suspendedCards.length} suspended
            </span>
          )}
        </span>
      </div>

      <div className="result-actions">
        {suspendedCards.length > 0 ? (
          <button
            className="btn btn-primary btn-sm"
            onClick={handleUnsuspend}
            disabled={unsuspending}
          >
            {unsuspending
              ? "Unsuspending..."
              : `Unsuspend ${suspendedCards.length} card${suspendedCards.length === 1 ? "" : "s"}`}
          </button>
        ) : (
          <span className="all-active">All cards active</span>
        )}
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Hide" : "Preview"} cards
        </button>
      </div>

      {expanded && (
        <div className="card-previews">
          {result.cards.map((card) => (
            <div
              key={card.cardId}
              className={`card-preview ${card.queue === -1 && !unsuspendedIds.has(card.cardId) ? "suspended" : "active"}`}
            >
              <div className="card-preview-status">
                {card.queue === -1 && !unsuspendedIds.has(card.cardId)
                  ? "Suspended"
                  : "Active"}
              </div>
              <div className="card-preview-text">
                {getFieldPreview(card.fields)}
              </div>
              <div className="card-preview-deck">{card.deckName}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Results({ results, onUnsuspended, onUnsuspendedAll }: Props) {
  const [unsuspendingAll, setUnsuspendingAll] = useState(false);

  const totalCards = results.reduce((sum, r) => sum + r.totalCount, 0);
  const totalSuspended = results.reduce((sum, r) => sum + r.suspendedCount, 0);
  const qidsWithCards = results.filter((r) => r.totalCount > 0).length;
  const qidsWithoutCards = results.filter((r) => r.totalCount === 0).length;

  const handleUnsuspendAll = async () => {
    const allSuspendedIds = results.flatMap((r) =>
      r.cards.filter((c) => c.queue === -1).map((c) => c.cardId)
    );
    if (allSuspendedIds.length === 0) return;
    setUnsuspendingAll(true);
    try {
      await unsuspendCards(allSuspendedIds);
      onUnsuspendedAll(allSuspendedIds.length);
    } catch (err) {
      console.error("Failed to unsuspend all:", err);
    }
    setUnsuspendingAll(false);
  };

  return (
    <div className="results">
      <div className="results-summary">
        <h2>Results</h2>
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-value">{totalCards}</span>
            <span className="stat-label">cards found</span>
          </div>
          <div className="stat">
            <span className="stat-value">{totalSuspended}</span>
            <span className="stat-label">suspended</span>
          </div>
          <div className="stat">
            <span className="stat-value">{qidsWithCards}</span>
            <span className="stat-label">QIDs matched</span>
          </div>
          {qidsWithoutCards > 0 && (
            <div className="stat warning">
              <span className="stat-value">{qidsWithoutCards}</span>
              <span className="stat-label">QIDs not found</span>
            </div>
          )}
        </div>
        {totalSuspended > 0 && (
          <button
            className="btn btn-primary"
            onClick={handleUnsuspendAll}
            disabled={unsuspendingAll}
          >
            {unsuspendingAll
              ? "Unsuspending..."
              : `Unsuspend All ${totalSuspended} Cards`}
          </button>
        )}
      </div>

      <div className="results-list">
        {results.map((result) => (
          <QIDResultCard
            key={result.qid}
            result={result}
            onUnsuspended={onUnsuspended}
          />
        ))}
      </div>
    </div>
  );
}
