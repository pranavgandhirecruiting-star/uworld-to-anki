import { useState, useEffect, useCallback } from "react";
import { searchCards, unsuspendCards } from "../api/ankiConnect";
import { generateStudyPlan, type StudyPlanSection, type StudyPlanResponse } from "../api/backend";
import { getSessions } from "../utils/sessionHistory";
import { TextbookUpload } from "./TextbookUpload";

const EXAM_DATE_KEY = "ollopa-exam-date";

interface Props {
  isPro: boolean;
  isLoggedIn: boolean;
  onUpgrade: () => void;
  disabled: boolean;
  connected: boolean;
}

interface StudyStats {
  dueToday: number;
  totalCards: number;
  unsuspendedCards: number;
}

const priorityEmoji = {
  high: "\u{1F534}",
  medium: "\u{1F7E1}",
  low: "\u{1F7E2}",
};

function PlanSection({ section }: { section: StudyPlanSection }) {
  const [acting, setActing] = useState(false);
  const [done, setDone] = useState(false);

  const handleAction = async () => {
    setActing(true);
    try {
      const results = await searchCards(section.searchQuery, 100);
      if (results.length > 0) {
        const suspendedIds = results
          .filter((c) => c.queue === -1)
          .map((c) => c.cardId);
        if (suspendedIds.length > 0) {
          await unsuspendCards(suspendedIds);
        }
        setDone(true);
      }
    } catch (err) {
      console.error("Failed to execute study plan action:", err);
    }
    setActing(false);
  };

  return (
    <div className={`plan-section plan-${section.priority}`}>
      <div className="plan-section-header">
        <span className="plan-priority">
          {priorityEmoji[section.priority]}
        </span>
        <div className="plan-section-info">
          <span className="plan-topic">{section.topic}</span>
          <span className="plan-reason">{section.reason}</span>
        </div>
      </div>
      <div className="plan-section-action">
        <span className="plan-action-text">{section.action}</span>
        {!done ? (
          <button
            className="btn btn-primary btn-sm"
            onClick={handleAction}
            disabled={acting}
          >
            {acting ? "Activating..." : "Activate Cards"}
          </button>
        ) : (
          <span className="plan-done">Cards activated</span>
        )}
      </div>
    </div>
  );
}

function getDaysUntilExam(): number | null {
  const examDate = localStorage.getItem(EXAM_DATE_KEY);
  if (!examDate) return null;
  const diff = new Date(examDate).getTime() - Date.now();
  if (diff < 0) return null;
  return Math.ceil(diff / 86_400_000);
}

export function StudyPlan({
  isPro,
  isLoggedIn,
  onUpgrade,
  disabled,
  connected,
}: Props) {
  const [plan, setPlan] = useState<StudyPlanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StudyStats | null>(null);

  // Load Anki stats on mount when connected
  useEffect(() => {
    if (!connected || !isPro) return;

    async function loadStats() {
      try {
        // Get total/unsuspended card counts via a broad search
        const allCards = await searchCards("deck:*", 1);
        void allCards; // We just need the count mechanism
        // Use a simpler approach: search for due cards
        const dueCards = await searchCards("is:due", 200);
        const totalSearch = await searchCards("*", 1);
        void totalSearch;

        setStats({
          dueToday: dueCards.length,
          totalCards: 0, // Will be approximated
          unsuspendedCards: 0,
        });
      } catch {
        // Stats are optional — don't block the UI
      }
    }

    loadStats();
  }, [connected, isPro]);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Gather recent topics from session history
      const sessions = getSessions();
      const recentTopics = sessions
        .filter(s => s.mode === "smart" && s.questionText)
        .slice(0, 5)
        .map(s => s.questionText!)
        .filter(Boolean);

      const examDate = localStorage.getItem(EXAM_DATE_KEY) || undefined;

      // Get some Anki stats to send to backend
      const ankiStats: { topic: string; total: number; suspended: number; due: number; highLapse: number }[] = [];
      try {
        const dueCards = await searchCards("is:due", 100);
        if (dueCards.length > 0) {
          // Group by deck
          const deckMap = new Map<string, { total: number; suspended: number; due: number }>();
          for (const card of dueCards) {
            const deck = card.deckName.split("::").slice(0, 2).join("::");
            const entry = deckMap.get(deck) || { total: 0, suspended: 0, due: 0 };
            entry.total++;
            entry.due++;
            if (card.queue === -1) entry.suspended++;
            deckMap.set(deck, entry);
          }
          for (const [topic, data] of deckMap) {
            ankiStats.push({ topic, ...data, highLapse: 0 });
          }
        }
      } catch {
        // If Anki stats fail, still try to generate with what we have
      }

      if (ankiStats.length === 0) {
        // Provide at least a placeholder so the backend doesn't reject
        ankiStats.push({ topic: "General Review", total: 0, suspended: 0, due: 0, highLapse: 0 });
      }

      const result = await generateStudyPlan(ankiStats, recentTopics, examDate);
      setPlan(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate study plan");
    }
    setLoading(false);
  }, []);

  // Not logged in
  if (!isLoggedIn) {
    return (
      <div className="study-plan-gate">
        <h3>Study Co-Pilot</h3>
        <p>
          AI analyzes your Anki stats and missed questions to build a
          prioritized study session — so you spend time on what matters most.
        </p>
        <div className="study-plan-features">
          <div>Unlimited Smart Searches</div>
          <div>Daily personalized study plans</div>
          <div>Topic weakness tracking</div>
        </div>
        <p className="study-plan-cta">Sign in above to get started</p>
      </div>
    );
  }

  // Free tier
  if (!isPro) {
    return (
      <div className="study-plan-gate">
        <h3>Study Co-Pilot</h3>
        <p>
          AI analyzes your Anki stats and missed questions to build a
          prioritized study session — so you spend time on what matters most.
        </p>
        <div className="study-plan-features">
          <div>Unlimited Smart Searches</div>
          <div>Daily personalized study plans</div>
          <div>Topic weakness tracking</div>
        </div>
        <p className="study-plan-price">$6/month — cancel anytime</p>
        <button className="btn btn-primary" onClick={onUpgrade}>
          Upgrade to Pro
        </button>
      </div>
    );
  }

  const daysUntil = getDaysUntilExam();

  // Pro user — show stats bar, generate button, and plan
  return (
    <div className="study-plan">
      {/* Quick Stats Bar */}
      <div className="copilot-stats-bar">
        {daysUntil !== null && (
          <div className="copilot-stat">
            <span className="copilot-stat-value">{daysUntil}</span>
            <span className="copilot-stat-label">days to exam</span>
          </div>
        )}
        {stats && (
          <div className="copilot-stat">
            <span className="copilot-stat-value">{stats.dueToday}</span>
            <span className="copilot-stat-label">cards due</span>
          </div>
        )}
        {daysUntil === null && !stats && (
          <div className="copilot-stat-hint">
            Set your exam date in the account menu for a countdown
          </div>
        )}
      </div>

      {!plan && !loading && (
        <div className="study-plan-empty">
          <h3>What Should I Study Tonight?</h3>
          <p>
            Generates a prioritized 45-minute plan based on your Anki card stats
            and recently missed questions.
          </p>
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={disabled || !connected}
          >
            Generate Study Plan
          </button>
        </div>
      )}

      {loading && (
        <div className="loading">
          <div className="spinner" />
          <p>Analyzing your Anki stats and generating a plan...</p>
        </div>
      )}

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
          <button className="btn btn-ghost btn-sm" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      {plan && (
        <div className="study-plan-results">
          <h3>Tonight's Study Plan</h3>
          {plan.summary && (
            <p className="plan-summary">{plan.summary}</p>
          )}
          <div className="plan-sections">
            {plan.sections.map((section, i) => (
              <PlanSection key={i} section={section} />
            ))}
          </div>
          <button
            className="btn btn-ghost"
            onClick={handleGenerate}
            disabled={disabled || loading || !connected}
          >
            Regenerate Plan
          </button>
        </div>
      )}

      <div className="copilot-section-divider" />
      <TextbookUpload isPro={isPro} isLoggedIn={isLoggedIn} onUpgrade={onUpgrade} />
    </div>
  );
}
