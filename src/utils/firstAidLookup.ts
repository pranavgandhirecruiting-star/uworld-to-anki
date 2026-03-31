import { FIRST_AID_CONCEPTS, type FirstAidConcept } from "../data/firstAidConcepts";

/**
 * Find First Aid concepts relevant to a set of medical terms.
 * Uses keyword matching -- no embeddings needed.
 */
export function findRelevantConcepts(terms: string[], maxResults = 3): FirstAidConcept[] {
  const normalizedTerms = terms.map(t => t.toLowerCase());

  const scored = FIRST_AID_CONCEPTS.map(concept => {
    let score = 0;
    const allKeywords = [
      concept.concept.toLowerCase(),
      ...concept.keywords.map(k => k.toLowerCase()),
    ];

    for (const term of normalizedTerms) {
      for (const keyword of allKeywords) {
        if (keyword.includes(term) || term.includes(keyword)) {
          score += 2;
        }
        // Partial word match
        const termWords = term.split(/\s+/);
        const keyWords = keyword.split(/\s+/);
        for (const tw of termWords) {
          for (const kw of keyWords) {
            if (tw.length > 3 && kw.length > 3 && (tw.includes(kw) || kw.includes(tw))) {
              score += 1;
            }
          }
        }
      }
    }

    return { concept, score };
  }).filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

  return scored.map(({ concept }) => concept);
}
