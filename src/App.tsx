import { useState, useCallback } from "react";
import { useAnkiConnection } from "./hooks/useAnkiConnection";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { QIDInput } from "./components/QIDInput";
import { SmartSearch, type SmartSearchResult } from "./components/SmartSearch";
import { Results } from "./components/Results";
import { SmartResults } from "./components/SmartResults";
import { SessionHistory } from "./components/SessionHistory";
import { Settings } from "./components/Settings";
import { lookupQIDs, type QIDResult } from "./api/ankiConnect";
import { saveSession } from "./utils/sessionHistory";
import "./App.css";

type SearchMode = "qid" | "smart";

function App() {
  const { connected, checking, retry } = useAnkiConnection();
  const [mode, setMode] = useState<SearchMode>("qid");
  const [results, setResults] = useState<QIDResult[] | null>(null);
  const [smartResults, setSmartResults] = useState<SmartSearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQIDs, setLastQIDs] = useState<string[]>([]);
  const [historyKey, setHistoryKey] = useState(0);
  const [inputOverride, setInputOverride] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleQIDSubmit = useCallback(async (qids: string[]) => {
    setLoading(true);
    setError(null);
    setResults(null);
    setSmartResults(null);
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

  const handleSmartResults = useCallback((results: SmartSearchResult[]) => {
    setSmartResults(results);
    setResults(null);
  }, []);

  const handleLoadQIDs = useCallback((qids: string[]) => {
    setMode("qid");
    setInputOverride(qids.join(", "));
    setResults(null);
    setSmartResults(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleModeSwitch = (newMode: SearchMode) => {
    setMode(newMode);
    setResults(null);
    setSmartResults(null);
    setError(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-row">
          <h1>
            UWorld <span className="arrow">&rarr;</span> Anki
          </h1>
          <button
            className="btn btn-ghost settings-btn"
            onClick={() => setSettingsOpen(true)}
            title="Settings"
          >
            Settings
          </button>
        </div>
        <p className="subtitle">
          Find the right Anki cards for any question you missed.
        </p>
      </header>

      <ConnectionStatus
        connected={connected}
        checking={checking}
        onRetry={retry}
      />

      <div className="mode-tabs">
        <button
          className={`mode-tab ${mode === "qid" ? "active" : ""}`}
          onClick={() => handleModeSwitch("qid")}
        >
          QID Lookup
        </button>
        <button
          className={`mode-tab ${mode === "smart" ? "active" : ""}`}
          onClick={() => handleModeSwitch("smart")}
        >
          Smart Search
        </button>
      </div>

      <main className="app-main">
        {mode === "qid" ? (
          <QIDInput
            key={inputOverride}
            onSubmit={handleQIDSubmit}
            loading={loading}
            disabled={!connected}
          />
        ) : (
          <SmartSearch
            onResults={handleSmartResults}
            loading={loading}
            setLoading={setLoading}
            disabled={!connected}
            onError={(msg) => setError(msg || null)}
          />
        )}

        {error && (
          <div className="error-banner">
            <strong>Error:</strong> {error}
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {loading && mode === "qid" && (
          <div className="loading">
            <div className="spinner" />
            <p>
              Searching Anki for {lastQIDs.length} QID
              {lastQIDs.length === 1 ? "" : "s"}...
            </p>
          </div>
        )}

        {loading && mode === "smart" && (
          <div className="loading">
            <div className="spinner" />
            <p>Analyzing with Claude...</p>
          </div>
        )}

        {results && (
          <Results
            results={results}
            onUnsuspended={() => {}}
            onUnsuspendedAll={() => {}}
          />
        )}

        {smartResults && <SmartResults results={smartResults} />}

        <SessionHistory refreshKey={historyKey} onLoadQIDs={handleLoadQIDs} />
      </main>

      <footer className="app-footer">
        <p>
          QID Lookup talks directly to your local Anki. Smart Search uses the
          Anthropic API to match questions to cards. No UWorld content is stored
          or transmitted.
        </p>
      </footer>

      <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

export default App;
