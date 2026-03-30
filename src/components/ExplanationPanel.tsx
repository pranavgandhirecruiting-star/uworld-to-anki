import { useState, useCallback, useEffect, useRef } from "react";
import type { QuestionExplanation, GlossaryTerm } from "../api/claude";

interface Props {
  explanation: QuestionExplanation;
}

/**
 * Replace glossary terms in text with hoverable spans.
 * Uses case-insensitive matching, longest-match-first to avoid
 * partial matches (e.g., "fat necrosis" before "necrosis").
 */
function HighlightedText({
  text,
  glossary,
  onHover,
}: {
  text: string;
  glossary: GlossaryTerm[];
  onHover: (term: GlossaryTerm | null, rect: DOMRect | null) => void;
}) {
  if (!glossary.length) return <>{text}</>;

  // Sort by length descending so longer terms match first
  const sorted = [...glossary].sort((a, b) => b.term.length - a.term.length);

  // Build regex that matches any glossary term (case-insensitive, word boundary)
  const pattern = sorted
    .map((g) => g.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const regex = new RegExp(`(${pattern})`, "gi");

  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        const match = sorted.find(
          (g) => g.term.toLowerCase() === part.toLowerCase()
        );
        if (match) {
          return (
            <span
              key={i}
              className="glossary-term"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                onHover(match, rect);
              }}
              onMouseLeave={() => onHover(null, null)}
            >
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function Tooltip({
  term,
  rect,
}: {
  term: GlossaryTerm;
  rect: DOMRect;
}) {
  const style: React.CSSProperties = {
    position: "fixed",
    left: Math.min(rect.left, window.innerWidth - 320),
    top: rect.bottom + 6,
    zIndex: 1000,
  };

  if (rect.bottom + 120 > window.innerHeight) {
    style.top = rect.top - 6;
    style.transform = "translateY(-100%)";
  }

  return (
    <div className="glossary-tooltip" style={style}>
      <div className="glossary-tooltip-term">{term.term}</div>
      <div className="glossary-tooltip-def">{term.definition}</div>
    </div>
  );
}

export function ExplanationPanel({ explanation }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredTerm, setHoveredTerm] = useState<GlossaryTerm | null>(null);
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const glossary = explanation.glossary || [];

  // Dismiss tooltip on any click
  useEffect(() => {
    const handleClick = () => {
      setHoveredTerm(null);
      setHoveredRect(null);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Dismiss tooltip on scroll
  useEffect(() => {
    const handleScroll = () => {
      setHoveredTerm(null);
      setHoveredRect(null);
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  const handleHover = useCallback(
    (term: GlossaryTerm | null, rect: DOMRect | null) => {
      // Clear any pending dismiss
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
        dismissTimer.current = null;
      }

      if (term && rect) {
        // Show immediately
        setHoveredTerm(term);
        setHoveredRect(rect);
      } else {
        // Dismiss quickly — 80ms prevents flicker between adjacent terms
        // but is short enough that the tooltip reliably disappears
        dismissTimer.current = setTimeout(() => {
          setHoveredTerm(null);
          setHoveredRect(null);
          dismissTimer.current = null;
        }, 80);
      }
    },
    []
  );

  // Also dismiss on mouse leaving the entire explanation panel
  const handlePanelMouseLeave = useCallback(() => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
    }
    // Immediate dismiss when leaving the panel entirely
    setHoveredTerm(null);
    setHoveredRect(null);
  }, []);

  const H = ({ text }: { text: string }) => (
    <HighlightedText text={text} glossary={glossary} onHover={handleHover} />
  );

  return (
    <div className="explanation-panel" onMouseLeave={handlePanelMouseLeave}>
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
            <span className="explanation-answer-text">
              <H text={explanation.answer} />
            </span>
          </div>

          <div className="explanation-section">
            <span className="explanation-label">Reasoning</span>
            <p>
              <H text={explanation.reasoning} />
            </p>
          </div>

          <div className="explanation-section explanation-concept">
            <span className="explanation-label">Tested Concept</span>
            <p>
              <H text={explanation.testedConcept} />
            </p>
          </div>

          {explanation.trapAnswers.length > 0 && (
            <div className="explanation-section">
              <span className="explanation-label">Trap Answers</span>
              <div className="trap-list">
                {explanation.trapAnswers.map((trap, i) => (
                  <div key={i} className="trap-item">
                    <span className="trap-answer">
                      <H text={trap.answer} />
                    </span>
                    <span className="trap-why">
                      <H text={trap.whyWrong} />
                    </span>
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
                  <li key={i}>
                    <H text={fact} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {glossary.length > 0 && (
            <div className="glossary-hint">
              Hover over <span className="glossary-term-example">highlighted terms</span> for definitions
            </div>
          )}
        </div>
      )}

      {hoveredTerm && hoveredRect && (
        <Tooltip term={hoveredTerm} rect={hoveredRect} />
      )}
    </div>
  );
}
