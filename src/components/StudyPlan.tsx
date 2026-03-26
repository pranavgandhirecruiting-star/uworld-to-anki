import { useState } from "react";
import { searchCards, unsuspendCards } from "../api/ankiConnect";
import type { StudyPlanSection, StudyPlanResponse } from "../api/backend";

interface Props {
  plan: StudyPlanResponse | null;
  loading: boolean;
  onGenerate: () => void;
  isPro: boolean;
  isLoggedIn: boolean;
  onUpgrade: () => void;
  onLogin: () => void;
  disabled: boolean;
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
      // Search for cards matching this section's query
      const results = await searchCards(section.searchQuery, 100);
      if (results.length > 0) {
        // Unsuspend any suspended cards
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

export function StudyPlan({
  plan,
  loading,
  onGenerate,
  isPro,
  isLoggedIn,
  onUpgrade,
  onLogin,
  disabled,
}: Props) {
  // Not logged in
  if (!isLoggedIn) {
    return (
      <div className="study-plan-gate">
        <h3>What Should I Study Tonight?</h3>
        <p>
          AI analyzes your Anki stats and missed questions to build a
          prioritized study session — so you spend time on what matters most.
        </p>
        <div className="study-plan-features">
          <div>Unlimited Smart Searches</div>
          <div>Daily personalized study plans</div>
          <div>Topic weakness tracking</div>
        </div>
        <button className="btn btn-primary" onClick={onLogin}>
          Sign in with Google
        </button>
      </div>
    );
  }

  // Free tier
  if (!isPro) {
    return (
      <div className="study-plan-gate">
        <h3>What Should I Study Tonight?</h3>
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

  // Pro user — show generate button or plan
  return (
    <div className="study-plan">
      {!plan && !loading && (
        <div className="study-plan-empty">
          <h3>What Should I Study Tonight?</h3>
          <p>
            Generates a prioritized 45-minute plan based on your Anki card stats
            and recently missed questions.
          </p>
          <button
            className="btn btn-primary"
            onClick={onGenerate}
            disabled={disabled}
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
            onClick={onGenerate}
            disabled={disabled || loading}
          >
            Regenerate Plan
          </button>
        </div>
      )}
    </div>
  );
}
