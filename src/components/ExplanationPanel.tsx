import { useState } from "react";
import type { QuestionExplanation } from "../api/claude";

interface Props {
  explanation: QuestionExplanation;
}

export function ExplanationPanel({ explanation }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="explanation-panel">
      <div
        className="explanation-header"
        onClick={() => setCollapsed(!collapsed)}
      >
        <h3>Why You Got This Wrong</h3>
        <button className="btn btn-ghost btn-sm">
          {collapsed ? "Show" : "Hide"}
        </button>
      </div>

      {!collapsed && (
        <div className="explanation-body">
          <div className="explanation-answer">
            <span className="explanation-label">Answer</span>
            <span className="explanation-answer-text">{explanation.answer}</span>
          </div>

          <div className="explanation-section">
            <span className="explanation-label">Reasoning</span>
            <p>{explanation.reasoning}</p>
          </div>

          <div className="explanation-section explanation-concept">
            <span className="explanation-label">Tested Concept</span>
            <p>{explanation.testedConcept}</p>
          </div>

          {explanation.trapAnswers.length > 0 && (
            <div className="explanation-section">
              <span className="explanation-label">Trap Answers</span>
              <div className="trap-list">
                {explanation.trapAnswers.map((trap, i) => (
                  <div key={i} className="trap-item">
                    <span className="trap-answer">{trap.answer}</span>
                    <span className="trap-why">{trap.whyWrong}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {explanation.highYield.length > 0 && (
            <div className="explanation-section">
              <span className="explanation-label">High-Yield Associations</span>
              <ul className="high-yield-list">
                {explanation.highYield.map((fact, i) => (
                  <li key={i}>{fact}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
