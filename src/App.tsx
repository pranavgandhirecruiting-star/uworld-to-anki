import { useState, useCallback, useEffect } from "react";
import { useAnkiConnection } from "./hooks/useAnkiConnection";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { QIDInput } from "./components/QIDInput";
import { SmartSearch, type SmartSearchResult } from "./components/SmartSearch";
import { Results } from "./components/Results";
import { SmartResults } from "./components/SmartResults";
import { ExplanationPanel } from "./components/ExplanationPanel";
import { SessionHistory } from "./components/SessionHistory";
import { Settings } from "./components/Settings";
import { AuthBar } from "./components/AuthBar";
import { UpgradePrompt } from "./components/UpgradePrompt";
import { StudyPlan } from "./components/StudyPlan";
import { lookupQIDs, type QIDResult } from "./api/ankiConnect";
import { type QuestionExplanation } from "./api/claude";
import {
  getToken,
  getProfile,
  logout,
  createCheckout,
  type UserProfile,
  type UsageInfo,
  type StudyPlanResponse,
  FREE_DAILY_LIMIT,
  getSmartSearchesUsedToday,
} from "./api/backend";
import { saveSession } from "./utils/sessionHistory";
import "./App.css";

type SearchMode = "qid" | "smart" | "plan";

function App() {
  const { connected, checking, retry } = useAnkiConnection();
  const [mode, setMode] = useState<SearchMode>("qid");
  const [results, setResults] = useState<QIDResult[] | null>(null);
  const [smartResults, setSmartResults] = useState<SmartSearchResult[] | null>(null);
  const [explanation, setExplanation] = useState<QuestionExplanation | null>(null);
  const [studyPlan, setStudyPlan] = useState<StudyPlanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQIDs, setLastQIDs] = useState<string[]>([]);
  const [historyKey, setHistoryKey] = useState(0);
  const [inputOverride, setInputOverride] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [atLimit, setAtLimit] = useState(false);

  // Auth state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);

  // Load user profile on mount if token exists
  useEffect(() => {
    const token = getToken();
    if (token) {
      getProfile()
        .then(({ user, usage }) => {
          setUser(user);
          setUsage(usage);
        })
        .catch(() => {
          // Token expired or invalid
          logout();
        });
    }
  }, []);

  const handleLogin = useCallback(() => {
    // Google OAuth will be triggered by the Google Sign-In button
    // For now, this opens settings where they can manage their account
    // In production, this would trigger the Google OAuth popup
    setSettingsOpen(true);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setUser(null);
    setUsage(null);
  }, []);

  const handleUpgrade = useCallback(async () => {
    try {
      const url = await createCheckout();
      window.open(url, "_blank");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start checkout"
      );
    }
  }, []);

  const handleQIDSubmit = useCallback(async (qids: string[]) => {
    setLoading(true);
    setError(null);
    setResults(null);
    setSmartResults(null);
    setExplanation(null);
    setAtLimit(false);
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

  const handleSmartResults = useCallback(
    (results: SmartSearchResult[], exp: QuestionExplanation | null) => {
      setSmartResults(results);
      setExplanation(exp);
      setResults(null);

      // Update usage count after a search
      if (user) {
        setUsage((prev) =>
          prev
            ? { ...prev, smartSearches: prev.smartSearches + 1 }
            : { smartSearches: 1, studyPlans: 0 }
        );
      }
    },
    [user]
  );

  const handleSmartError = useCallback(
    (msg: string) => {
      // Check if this is a rate limit error
      if (msg.includes("daily_limit") || msg.includes("free Smart Searches")) {
        setAtLimit(true);
        setError(null);
      } else {
        setError(msg || null);
        setAtLimit(false);
      }
    },
    []
  );

  const handleLoadQIDs = useCallback((qids: string[]) => {
    setMode("qid");
    setInputOverride(qids.join(", "));
    setResults(null);
    setSmartResults(null);
    setExplanation(null);
    setStudyPlan(null);
    setAtLimit(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleModeSwitch = (newMode: SearchMode) => {
    setMode(newMode);
    setResults(null);
    setSmartResults(null);
    setExplanation(null);
    setStudyPlan(null);
    setError(null);
    setAtLimit(false);
  };

  const handleGenerateStudyPlan = useCallback(async () => {
    // Study plan generation will be implemented when connected to backend
    // For now, show a placeholder
    setError("Study Plan requires a backend connection. Coming soon!");
  }, []);

  const isLoggedIn = !!user;
  const isPro = user?.plan === "pro";

  // Check if smart search should be blocked
  const smartSearchBlocked =
    !isPro &&
    (isLoggedIn
      ? (usage?.smartSearches ?? 0) >= FREE_DAILY_LIMIT
      : getSmartSearchesUsedToday() >= FREE_DAILY_LIMIT);

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

      <AuthBar
        user={user}
        usage={usage}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onUpgrade={handleUpgrade}
      />

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
        <button
          className={`mode-tab ${mode === "plan" ? "active" : ""}`}
          onClick={() => handleModeSwitch("plan")}
        >
          Study Plan {!isPro && "Pro"}
        </button>
      </div>

      <main className="app-main">
        {mode === "qid" && (
          <QIDInput
            key={inputOverride}
            onSubmit={handleQIDSubmit}
            loading={loading}
            disabled={!connected}
          />
        )}

        {mode === "smart" && !atLimit && (
          <SmartSearch
            onResults={handleSmartResults}
            loading={loading}
            setLoading={setLoading}
            disabled={!connected || smartSearchBlocked}
            onError={handleSmartError}
          />
        )}

        {mode === "smart" && atLimit && (
          <UpgradePrompt
            isLoggedIn={isLoggedIn}
            onLogin={handleLogin}
            onUpgrade={handleUpgrade}
          />
        )}

        {mode === "plan" && (
          <StudyPlan
            plan={studyPlan}
            loading={loading}
            onGenerate={handleGenerateStudyPlan}
            isPro={isPro}
            isLoggedIn={isLoggedIn}
            onUpgrade={handleUpgrade}
            onLogin={handleLogin}
            disabled={!connected}
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

        {explanation && <ExplanationPanel explanation={explanation} />}

        {smartResults && <SmartResults results={smartResults} />}

        {mode !== "plan" && (
          <SessionHistory
            refreshKey={historyKey}
            onLoadQIDs={handleLoadQIDs}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>
          QID Lookup talks directly to your local Anki. Smart Search and Study
          Plans use AI to match questions to cards. No UWorld content is stored
          or transmitted.
        </p>
      </footer>

      <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

export default App;
