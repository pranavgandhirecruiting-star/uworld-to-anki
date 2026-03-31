import { useState } from "react";
import { type FirstAidConcept } from "../data/firstAidConcepts";

interface Props {
  concepts: FirstAidConcept[];
}

export function FirstAidPanel({ concepts }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  if (concepts.length === 0) return null;

  return (
    <div className="first-aid-panel">
      <div className="first-aid-header" onClick={() => setCollapsed(!collapsed)}>
        <h3>
          High-Yield Review
          <span className="first-aid-count">{concepts.length} concept{concepts.length === 1 ? "" : "s"}</span>
        </h3>
        <span className="first-aid-toggle">
          {collapsed ? "Show" : "Hide"}
        </span>
      </div>
      {!collapsed && (
        <div className="first-aid-body">
          {concepts.map((concept, i) => (
            <div key={i} className="first-aid-card">
              <div className="first-aid-card-header">
                <span className="first-aid-concept">{concept.concept}</span>
                <div className="first-aid-badges">
                  <span className="first-aid-system">{concept.system}</span>
                  {concept.pageRef && (
                    <span className="first-aid-page-ref">p. {concept.pageRef}</span>
                  )}
                </div>
              </div>
              <p className="first-aid-summary">{concept.summary}</p>
              <div className="first-aid-high-yield">
                <span className="first-aid-hy-label">Key Point</span>
                <p>{concept.highYield}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
