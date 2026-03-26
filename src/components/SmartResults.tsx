import { useState, useEffect } from "react";
import type { SmartSearchResult } from "./SmartSearch";
import {
  unsuspendCards,
  suspendCards,
  getDecks,
  createDeck,
  changeDeck,
} from "../api/ankiConnect";

interface Props {
  results: SmartSearchResult[];
}

function getFieldPreview(
  fields: Record<string, { value: string; order: number }>
): string {
  const candidates = ["Text", "Extra", "Cloze", "Front", "Back"];
  for (const name of candidates) {
    if (fields[name]?.value) {
      const text = fields[name].value.replace(/<[^>]*>/g, "").trim();
      if (text) return text.slice(0, 150) + (text.length > 150 ? "..." : "");
    }
  }
  const sorted = Object.values(fields).sort((a, b) => a.order - b.order);
  for (const f of sorted) {
    const text = f.value.replace(/<[^>]*>/g, "").trim();
    if (text) return text.slice(0, 150) + (text.length > 150 ? "..." : "");
  }
  return "(no preview available)";
}

function RelevanceBadge({ level }: { level: "high" | "medium" | "low" }) {
  return <span className={`relevance-badge relevance-${level}`}>{level}</span>;
}

export function SmartResults({ results }: Props) {
  const [busy, setBusy] = useState(false);
  const [actionedIds, setActionedIds] = useState<Map<number, "suspended" | "unsuspended">>(new Map());
  const [deckList, setDeckList] = useState<string[]>([]);
  const [showNewDeck, setShowNewDeck] = useState(false);
  const [showExistingDeck, setShowExistingDeck] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [selectedDeck, setSelectedDeck] = useState("");
  const [movingDeck, setMovingDeck] = useState(false);
  const [deckMessage, setDeckMessage] = useState<string | null>(null);

  const allCardIds = results.map((r) => r.cardId);

  const isSuspended = (r: SmartSearchResult) => {
    const action = actionedIds.get(r.cardId);
    if (action === "suspended") return true;
    if (action === "unsuspended") return false;
    return r.card.queue === -1;
  };

  const suspendedResults = results.filter((r) => isSuspended(r));
  const activeResults = results.filter((r) => !isSuspended(r));

  useEffect(() => {
    if (showExistingDeck) {
      getDecks().then(setDeckList).catch(() => setDeckList([]));
    }
  }, [showExistingDeck]);

  const handleUnsuspendAll = async () => {
    const ids = suspendedResults.map((r) => r.cardId);
    if (ids.length === 0) return;
    setBusy(true);
    try {
      await unsuspendCards(ids);
      setActionedIds((prev) => {
        const next = new Map(prev);
        ids.forEach((id) => next.set(id, "unsuspended"));
        return next;
      });
    } catch (err) {
      console.error("Failed to unsuspend:", err);
    }
    setBusy(false);
  };

  const handleSuspendAll = async () => {
    const ids = activeResults.map((r) => r.cardId);
    if (ids.length === 0) return;
    setBusy(true);
    try {
      await suspendCards(ids);
      setActionedIds((prev) => {
        const next = new Map(prev);
        ids.forEach((id) => next.set(id, "suspended"));
        return next;
      });
    } catch (err) {
      console.error("Failed to suspend:", err);
    }
    setBusy(false);
  };

  const handleNewDeck = async () => {
    if (!newDeckName.trim()) return;
    setMovingDeck(true);
    setDeckMessage(null);
    try {
      await createDeck(newDeckName.trim());
      await changeDeck(allCardIds, newDeckName.trim());
      setDeckMessage(`Moved ${allCardIds.length} cards to "${newDeckName.trim()}"`);
      setShowNewDeck(false);
      setNewDeckName("");
    } catch (err) {
      setDeckMessage(`Error: ${err instanceof Error ? err.message : "Failed"}`);
    }
    setMovingDeck(false);
  };

  const handleExistingDeck = async () => {
    if (!selectedDeck) return;
    setMovingDeck(true);
    setDeckMessage(null);
    try {
      await changeDeck(allCardIds, selectedDeck);
      setDeckMessage(`Moved ${allCardIds.length} cards to "${selectedDeck}"`);
      setShowExistingDeck(false);
      setSelectedDeck("");
    } catch (err) {
      setDeckMessage(`Error: ${err instanceof Error ? err.message : "Failed"}`);
    }
    setMovingDeck(false);
  };

  const highCount = results.filter((r) => r.relevance === "high").length;
  const medCount = results.filter((r) => r.relevance === "medium").length;

  return (
    <div className="results">
      <div className="results-summary">
        <h2>Smart Search Results</h2>
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-value">{results.length}</span>
            <span className="stat-label">cards matched</span>
          </div>
          <div className="stat">
            <span className="stat-value">{highCount}</span>
            <span className="stat-label">high relevance</span>
          </div>
          {medCount > 0 && (
            <div className="stat">
              <span className="stat-value">{medCount}</span>
              <span className="stat-label">medium relevance</span>
            </div>
          )}
          <div className="stat">
            <span className="stat-value">{suspendedResults.length}</span>
            <span className="stat-label">suspended</span>
          </div>
        </div>

        <div className="summary-actions">
          {suspendedResults.length > 0 && (
            <button className="btn btn-primary" onClick={handleUnsuspendAll} disabled={busy}>
              {busy ? "..." : `Activate ${suspendedResults.length} Suspended Cards for Review`}
            </button>
          )}
          {activeResults.length > 0 && (
            <button className="btn btn-danger" onClick={handleSuspendAll} disabled={busy}>
              {busy ? "..." : `Re-suspend ${activeResults.length} Already Active Cards`}
            </button>
          )}
        </div>

        <div className="deck-actions">
          <div className="deck-actions-buttons">
            <button className="btn btn-sm" onClick={() => { setShowNewDeck(!showNewDeck); setShowExistingDeck(false); }}>
              Add to New Deck
            </button>
            <button className="btn btn-sm" onClick={() => { setShowExistingDeck(!showExistingDeck); setShowNewDeck(false); }}>
              Add to Existing Deck
            </button>
          </div>

          {showNewDeck && (
            <div className="deck-input-row">
              <input type="text" className="deck-name-input" placeholder="Enter new deck name..." value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleNewDeck()} autoFocus />
              <button className="btn btn-primary btn-sm" onClick={handleNewDeck} disabled={!newDeckName.trim() || movingDeck}>
                {movingDeck ? "Moving..." : "Create & Move"}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowNewDeck(false)}>Cancel</button>
            </div>
          )}

          {showExistingDeck && (
            <div className="deck-input-row">
              <select className="deck-select" value={selectedDeck} onChange={(e) => setSelectedDeck(e.target.value)}>
                <option value="">Select a deck...</option>
                {deckList.map((name) => (<option key={name} value={name}>{name}</option>))}
              </select>
              <button className="btn btn-primary btn-sm" onClick={handleExistingDeck} disabled={!selectedDeck || movingDeck}>
                {movingDeck ? "Moving..." : "Move Cards"}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowExistingDeck(false)}>Cancel</button>
            </div>
          )}

          {deckMessage && (
            <div className={`deck-message ${deckMessage.startsWith("Error") ? "error" : "success"}`}>
              {deckMessage}
            </div>
          )}
        </div>
      </div>

      <div className="results-list">
        {results.map((result) => (
          <div key={result.cardId} className="result-card">
            <div className="result-header">
              <RelevanceBadge level={result.relevance} />
              <span className="result-count">
                {isSuspended(result) ? (
                  <span className="suspended-badge">Suspended</span>
                ) : (
                  <span className="all-active">Active</span>
                )}
              </span>
            </div>
            <div className="smart-reason">{result.reason}</div>
            <div className="card-preview-text">
              {getFieldPreview(result.card.fields)}
            </div>
            <div className="card-preview-deck">{result.card.deckName}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
