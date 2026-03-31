import { type FirstAidConcept } from "../data/firstAidConcepts";

interface Props {
  concepts: FirstAidConcept[];
}

export function FirstAidPanel({ concepts }: Props) {
  if (concepts.length === 0) return null;

  return (
    <div className="first-aid-panel">
      <div className="first-aid-header">
        <h3>High-Yield Review</h3>
      </div>
      <div className="first-aid-body">
        {concepts.map((concept, i) => (
          <div key={i} className="first-aid-card">
            <div className="first-aid-card-header">
              <span className="first-aid-concept">{concept.concept}</span>
              <span className="first-aid-system">{concept.system}</span>
            </div>
            <p className="first-aid-summary">{concept.summary}</p>
            <div className="first-aid-high-yield">
              <span className="first-aid-hy-label">Key Point</span>
              <p>{concept.highYield}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
