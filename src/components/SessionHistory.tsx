import { getSessions, clearSessions, type Session } from "../utils/sessionHistory";
import { useState } from "react";

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "...";
}

interface Props {
  refreshKey: number;
  onLoadSession: (session: Session) => void;
}

export function SessionHistory({ refreshKey, onLoadSession }: Props) {
  const [showAll, setShowAll] = useState(false);
  // refreshKey forces re-read from localStorage
  void refreshKey;
  const sessions = getSessions();
  const [cleared, setCleared] = useState(false);

  if (sessions.length === 0 || cleared) {
    return null;
  }

  const displayed = showAll ? sessions : sessions.slice(0, 5);

  const handleClear = () => {
    clearSessions();
    setCleared(true);
  };

  return (
    <div className="session-history">
      <div className="history-header">
        <h3>Recent Sessions</h3>
        <button className="btn btn-ghost btn-sm" onClick={handleClear}>
          Clear History
        </button>
      </div>
      <div className="history-list">
        {displayed.map((session: Session) => (
          <div key={session.id} className="history-item">
            <div className="history-item-main">
              <span className="history-time">{formatDate(session.timestamp)}</span>
              {session.mode === "smart" && session.questionText ? (
                <span className="history-qids history-smart-label">
                  Smart: {truncate(session.questionText, 40)}
                </span>
              ) : (
                <span className="history-qids">
                  {session.qids.length} QID{session.qids.length === 1 ? "" : "s"}
                </span>
              )}
              <span className="history-cards">
                {session.totalCardsFound} found
              </span>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onLoadSession(session)}
              title={
                session.mode === "smart"
                  ? "Reuse this smart search"
                  : `Load QIDs: ${session.qids.join(", ")}`
              }
            >
              Reuse
            </button>
          </div>
        ))}
      </div>
      {sessions.length > 5 && (
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show less" : `Show all ${sessions.length} sessions`}
        </button>
      )}
    </div>
  );
}
