import { useState, useCallback } from "react";
import { useAnkiConnection } from "./hooks/useAnkiConnection";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { QIDInput } from "./components/QIDInput";
import { Results } from "./components/Results";
import { SessionHistory } from "./components/SessionHistory";
import { lookupQIDs, type QIDResult } from "./api/ankiConnect";
import { saveSession } from "./utils/sessionHistory";
import "./App.css";

function App() {
  const { connected, checking, retry } = useAnkiConnection();
  const [results, setResults] = useState<QIDResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQIDs, setLastQIDs] = useState<string[]>([]);
  const [historyKey, setHistoryKey] = useState(0);
  const [inputOverride, setInputOverride] = useState<string | null>(null);

  const handleSubmit = useCallback(async (qids: string[]) => {
    setLoading(true);
    setError(null);
    setResults(null);
    setLastQIDs(qids);

    try {
      const res = await lookupQIDs(qids);
      setResults(res);

      saveSession({
        timestamp: Date.now(),
        qids,
        totalCardsFound: res.reduce((s, r) => s + r.totalCount, 0),
        cardsUnsuspended: 0,
      });
      setHistoryKey((k) => k + 1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect to Anki"
      );
    }

    setLoading(false);
  }, []);

  const handleLoadQIDs = useCallback((qids: string[]) => {
    setInputOverride(qids.join(", "));
    setResults(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          UWorld <span className="arrow">&rarr;</span> Anki
        </h1>
        <p className="subtitle">
          Paste your missed QIDs. Find the cards. Unsuspend. Study.
        </p>
      </header>

      <ConnectionStatus
        connected={connected}
        checking={checking}
        onRetry={retry}
      />

      <main className="app-main">
        <QIDInput
          key={inputOverride}
          onSubmit={handleSubmit}
          loading={loading}
          disabled={!connected}
        />

        {error && (
          <div className="error-banner">
            <strong>Error:</strong> {error}
            <button className="btn btn-ghost btn-sm" onClick={() => setError(null)}>
              Dismiss
            </button>
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner" />
            <p>
              Searching Anki for {lastQIDs.length} QID
              {lastQIDs.length === 1 ? "" : "s"}...
            </p>
          </div>
        )}

        {results && (
          <Results
            results={results}
            onUnsuspended={() => {}}
            onUnsuspendedAll={() => {}}
          />
        )}

        <SessionHistory refreshKey={historyKey} onLoadQIDs={handleLoadQIDs} />
      </main>

      <footer className="app-footer">
        <p>
          This tool reads QIDs from your clipboard and talks to your local Anki
          via{" "}
          <a
            href="https://foosoft.net/projects/anki-connect/"
            target="_blank"
            rel="noopener noreferrer"
          >
            AnkiConnect
          </a>
          . No UWorld content is scraped, stored, or transmitted.
        </p>
      </footer>
    </div>
  );
}

export default App;
