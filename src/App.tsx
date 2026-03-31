import { useState, useCallback, useEffect } from "react";
import { useAnkiConnection } from "./hooks/useAnkiConnection";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { QIDInput } from "./components/QIDInput";
import { SmartSearch, type SmartSearchResult } from "./components/SmartSearch";
import { Results } from "./components/Results";
import { SmartResults } from "./components/SmartResults";
import { ExplanationPanel } from "./components/ExplanationPanel";
import { FirstAidPanel } from "./components/FirstAidPanel";
import { type FirstAidConcept } from "./data/firstAidConcepts";
import { SessionHistory } from "./components/SessionHistory";
import { AuthBar } from "./components/AuthBar";
import { UpgradePrompt } from "./components/UpgradePrompt";
import { StudyPlan } from "./components/StudyPlan";
import { KnowledgeBase } from "./components/KnowledgeBase";
import { Logo } from "./components/Logo";
import { FetchAnimation } from "./components/FetchAnimation";
import { lookupQIDs, type QIDResult } from "./api/ankiConnect";
import { type QuestionExplanation } from "./api/claude";
import {
  getToken,
  getProfile,
  logout,
  createCheckout,
  type UserProfile,
  type UsageInfo,
  FREE_DAILY_LIMIT,
} from "./api/backend";
import { saveSession, type Session } from "./utils/sessionHistory";
import "./App.css";

type SearchMode = "qid" | "smart" | "plan" | "knowledge";

function App() {
  const { connected, checking, retry } = useAnkiConnection();
  const [mode, setMode] = useState<SearchMode>("qid");
  const [results, setResults] = useState<QIDResult[] | null>(null);
  const [smartResults, setSmartResults] = useState<SmartSearchResult[] | null>(null);
  const [explanation, setExplanation] = useState<QuestionExplanation | null>(null);
  const [firstAidConcepts, setFirstAidConcepts] = useState<FirstAidConcept[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQIDs, setLastQIDs] = useState<string[]>([]);
  const [historyKey, setHistoryKey] = useState(0);
  const [inputOverride, setInputOverride] = useState<string | null>(null);
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

  const handleLogin = useCallback((user: UserProfile, usage: UsageInfo) => {
    setUser(user);
    setUsage(usage);
    setError(null);
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

      // Extract topic tags from matched cards
      const topics: string[] = [];
      for (const qidResult of res) {
        for (const card of qidResult.cards || []) {
          for (const tag of card.tags || []) {
            if (tag.startsWith("#AK_Step") && tag.includes("::")) {
              const parts = tag.split("::");
              if (parts.length >= 2) {
                const topic = parts[1].replace(/_/g, " ");
                if (topic && !topics.includes(topic) &&
                    !["UWorld", "AMBOSS", "Pathoma", "Boards and Beyond", "SketchyMedical"].includes(topic)) {
                  topics.push(topic);
                }
              }
            }
          }
        }
      }

      saveSession({
        timestamp: Date.now(),
        mode: "qid",
        qids,
        topics,
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
    (results: SmartSearchResult[], exp: QuestionExplanation | null, faConcepts: FirstAidConcept[]) => {
      setSmartResults(results);
      setExplanation(exp);
      setFirstAidConcepts(faConcepts);
      setResults(null);
      setHistoryKey((k) => k + 1);

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

  const handleLoadSession = useCallback((session: Session) => {
    if (session.mode === "smart" && session.questionText) {
      // For smart search sessions, switch to smart mode
      // The user can re-paste or we could pre-fill, but for now just switch mode
      setMode("smart");
    } else {
      // QID session — load QIDs into input
      setMode("qid");
      setInputOverride(session.qids.join(", "));
    }
    setResults(null);
    setSmartResults(null);
    setExplanation(null);
    setAtLimit(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleModeSwitch = (newMode: SearchMode) => {
    setMode(newMode);
    setError(null);
    setAtLimit(false);
  };

  const isLoggedIn = !!user;
  const isPro = user?.plan === "pro";

  // Smart search blocked: logged-in free user over limit
  const smartSearchBlocked =
    !isPro && isLoggedIn && (usage?.smartSearches ?? 0) >= FREE_DAILY_LIMIT;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-row">
          <div className="brand">
            <Logo size={36} />
            <h1>O<span className="brand-ll">ll</span>opa</h1>
          </div>
          <AuthBar
            user={user}
            usage={usage}
            connected={!!connected}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onUpgrade={handleUpgrade}
            onError={(msg) => setError(msg)}
          />
        </div>
        <p className="subtitle">A Learner's Best Friend</p>
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
        <button
          className={`mode-tab ${mode === "plan" ? "active" : ""}`}
          onClick={() => handleModeSwitch("plan")}
        >
          Study Co-Pilot {!isPro && <span className="tab-badge-pro">Pro</span>}
        </button>
        <button
          className={`mode-tab ${mode === "knowledge" ? "active" : ""}`}
          onClick={() => handleModeSwitch("knowledge")}
        >
          Knowledge Base
        </button>
      </div>

      <main className="app-main">
        {mode === "qid" && (
          <QIDInput
            key={inputOverride}
            onSubmit={handleQIDSubmit}
            loading={loading}
            disabled={!connected}
            initialValue={inputOverride || undefined}
          />
        )}

        {mode === "smart" && !isLoggedIn && (
          <div className="smart-signin-prompt">
            <h3>Smart Search</h3>
            <p>
              Paste any practice question and AI will find the matching Anki cards in your deck.
            </p>
            <p className="smart-signin-hint">Sign in above to get started — 3 free searches daily.</p>
          </div>
        )}

        {mode === "smart" && isLoggedIn && !atLimit && (
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
            onUpgrade={handleUpgrade}
          />
        )}

        {mode === "plan" && (
          <StudyPlan
            isPro={isPro}
            isLoggedIn={isLoggedIn}
            onUpgrade={handleUpgrade}
            disabled={!connected}
            connected={!!connected}
          />
        )}

        {mode === "knowledge" && (
          <KnowledgeBase
            isPro={isPro}
            isLoggedIn={isLoggedIn}
            onUpgrade={handleUpgrade}
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
          <FetchAnimation
            message={`Fetching ${lastQIDs.length} QID${lastQIDs.length === 1 ? "" : "s"}...`}
          />
        )}

        {loading && mode === "smart" && (
          <FetchAnimation message="Sniffing out the best cards..." />
        )}

        {mode === "qid" && results && (
          <Results
            results={results}
            onUnsuspended={() => {}}
            onUnsuspendedAll={() => {}}
          />
        )}

        {mode === "smart" && explanation && <ExplanationPanel explanation={explanation} />}

        {mode === "smart" && firstAidConcepts.length > 0 && <FirstAidPanel concepts={firstAidConcepts} />}

        {mode === "smart" && smartResults && <SmartResults results={smartResults} />}

        {(mode === "qid" || mode === "smart") && (
          <SessionHistory
            refreshKey={historyKey}
            onLoadSession={handleLoadSession}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>
          Ollopa talks directly to your local Anki. Smart Search and Study
          Plans use AI to match questions to cards. No question bank content
          is stored or transmitted.
        </p>
      </footer>
    </div>
  );
}

export default App;
