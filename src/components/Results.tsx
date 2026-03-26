import { useState, useEffect } from "react";
import type { QIDResult } from "../api/ankiConnect";
import {
  unsuspendCards,
  suspendCards,
  getDecks,
  createDeck,
  changeDeck,
} from "../api/ankiConnect";

interface Props {
  results: QIDResult[];
  onUnsuspended: (qid: string, count: number) => void;
  onUnsuspendedAll: (total: number) => void;
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

function QIDResultCard({
  result,
  onUnsuspended,
}: {
  result: QIDResult;
  onUnsuspended: (qid: string, count: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [unsuspendedIds, setUnsuspendedIds] = useState<Set<number>>(new Set());
  const [suspendedIds, setSuspendedIds] = useState<Set<number>>(new Set());

  const isSuspended = (card: { cardId: number; queue: number }) =>
    (card.queue === -1 || suspendedIds.has(card.cardId)) &&
    !unsuspendedIds.has(card.cardId);

  const suspendedCards = result.cards.filter((c) => isSuspended(c));
  const activeCards = result.cards.filter((c) => !isSuspended(c));

  const handleUnsuspend = async () => {
    const ids = suspendedCards.map((c) => c.cardId);
    if (ids.length === 0) return;
    setBusy(true);
    try {
      await unsuspendCards(ids);
      setUnsuspendedIds((prev) => new Set([...prev, ...ids]));
      onUnsuspended(result.qid, ids.length);
    } catch (err) {
      console.error("Failed to unsuspend:", err);
    }
    setBusy(false);
  };

  const handleSuspend = async () => {
    const ids = activeCards.map((c) => c.cardId);
    if (ids.length === 0) return;
    setBusy(true);
    try {
      await suspendCards(ids);
      setSuspendedIds((prev) => new Set([...prev, ...ids]));
      // Remove from unsuspended tracking
      setUnsuspendedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    } catch (err) {
      console.error("Failed to suspend:", err);
    }
    setBusy(false);
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
        {suspendedCards.length > 0 && (
          <button
            className="btn btn-primary btn-sm"
            onClick={handleUnsuspend}
            disabled={busy}
          >
            {busy ? "..." : `Unsuspend ${suspendedCards.length}`}
          </button>
        )}
        {activeCards.length > 0 && (
          <button
            className="btn btn-danger btn-sm"
            onClick={handleSuspend}
            disabled={busy}
          >
            {busy ? "..." : `Suspend ${activeCards.length}`}
          </button>
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
              className={`card-preview ${isSuspended(card) ? "suspended" : "active"}`}
            >
              <div className="card-preview-status">
                {isSuspended(card) ? "Suspended" : "Active"}
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
  const [suspendingAll, setSuspendingAll] = useState(false);
  const [movingDeck, setMovingDeck] = useState(false);
  const [deckList, setDeckList] = useState<string[]>([]);
  const [showNewDeck, setShowNewDeck] = useState(false);
  const [showExistingDeck, setShowExistingDeck] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [selectedDeck, setSelectedDeck] = useState("");
  const [deckMessage, setDeckMessage] = useState<string | null>(null);

  const totalCards = results.reduce((sum, r) => sum + r.totalCount, 0);
  const totalSuspended = results.reduce((sum, r) => sum + r.suspendedCount, 0);
  const totalActive = totalCards - totalSuspended;
  const qidsWithCards = results.filter((r) => r.totalCount > 0).length;
  const qidsWithoutCards = results.filter((r) => r.totalCount === 0).length;

  const allCardIds = results.flatMap((r) => r.cardIds);

  // Load deck list when "Add to Existing Deck" is opened
  useEffect(() => {
    if (showExistingDeck) {
      getDecks().then(setDeckList).catch(() => setDeckList([]));
    }
  }, [showExistingDeck]);

  const handleUnsuspendAll = async () => {
    const ids = results.flatMap((r) =>
      r.cards.filter((c) => c.queue === -1).map((c) => c.cardId)
    );
    if (ids.length === 0) return;
    setUnsuspendingAll(true);
    try {
      await unsuspendCards(ids);
      onUnsuspendedAll(ids.length);
    } catch (err) {
      console.error("Failed to unsuspend all:", err);
    }
    setUnsuspendingAll(false);
  };

  const handleSuspendAll = async () => {
    const ids = results.flatMap((r) =>
      r.cards.filter((c) => c.queue !== -1).map((c) => c.cardId)
    );
    if (ids.length === 0) return;
    setSuspendingAll(true);
    try {
      await suspendCards(ids);
    } catch (err) {
      console.error("Failed to suspend all:", err);
    }
    setSuspendingAll(false);
  };

  const handleNewDeck = async () => {
    if (!newDeckName.trim()) return;
    setMovingDeck(true);
    setDeckMessage(null);
    try {
      await createDeck(newDeckName.trim());
      await changeDeck(allCardIds, newDeckName.trim());
      setDeckMessage(
        `Moved ${allCardIds.length} cards to "${newDeckName.trim()}"`
      );
      setShowNewDeck(false);
      setNewDeckName("");
    } catch (err) {
      setDeckMessage(
        `Error: ${err instanceof Error ? err.message : "Failed to move cards"}`
      );
    }
    setMovingDeck(false);
  };

  const handleExistingDeck = async () => {
    if (!selectedDeck) return;
    setMovingDeck(true);
    setDeckMessage(null);
    try {
      await changeDeck(allCardIds, selectedDeck);
      setDeckMessage(
        `Moved ${allCardIds.length} cards to "${selectedDeck}"`
      );
      setShowExistingDeck(false);
      setSelectedDeck("");
    } catch (err) {
      setDeckMessage(
        `Error: ${err instanceof Error ? err.message : "Failed to move cards"}`
      );
    }
    setMovingDeck(false);
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

        <div className="summary-actions">
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
          {totalActive > 0 && (
            <button
              className="btn btn-danger"
              onClick={handleSuspendAll}
              disabled={suspendingAll}
            >
              {suspendingAll
                ? "Suspending..."
                : `Suspend All ${totalActive} Cards`}
            </button>
          )}
        </div>

        <div className="deck-actions">
          <div className="deck-actions-buttons">
            <button
              className="btn btn-sm"
              onClick={() => {
                setShowNewDeck(!showNewDeck);
                setShowExistingDeck(false);
              }}
              disabled={allCardIds.length === 0}
            >
              Add to New Deck
            </button>
            <button
              className="btn btn-sm"
              onClick={() => {
                setShowExistingDeck(!showExistingDeck);
                setShowNewDeck(false);
              }}
              disabled={allCardIds.length === 0}
            >
              Add to Existing Deck
            </button>
          </div>

          {showNewDeck && (
            <div className="deck-input-row">
              <input
                type="text"
                className="deck-name-input"
                placeholder="Enter new deck name..."
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNewDeck()}
                autoFocus
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={handleNewDeck}
                disabled={!newDeckName.trim() || movingDeck}
              >
                {movingDeck ? "Moving..." : "Create & Move"}
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowNewDeck(false)}
              >
                Cancel
              </button>
            </div>
          )}

          {showExistingDeck && (
            <div className="deck-input-row">
              <select
                className="deck-select"
                value={selectedDeck}
                onChange={(e) => setSelectedDeck(e.target.value)}
              >
                <option value="">Select a deck...</option>
                {deckList.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleExistingDeck}
                disabled={!selectedDeck || movingDeck}
              >
                {movingDeck ? "Moving..." : "Move Cards"}
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowExistingDeck(false)}
              >
                Cancel
              </button>
            </div>
          )}

          {deckMessage && (
            <div
              className={`deck-message ${deckMessage.startsWith("Error") ? "error" : "success"}`}
            >
              {deckMessage}
            </div>
          )}
        </div>
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
