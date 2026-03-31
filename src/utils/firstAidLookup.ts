import { FIRST_AID_CONCEPTS, type FirstAidConcept } from "../data/firstAidConcepts";
import { getTextbookConcepts } from "./textbookDB";

/**
 * Find First Aid concepts relevant to a set of medical terms.
 * Merges static concept bank with user's uploaded textbook concepts.
 */
export async function findRelevantConcepts(terms: string[], maxResults = 5): Promise<FirstAidConcept[]> {
  // Get user's textbook concepts (if any)
  let textbookConcepts: FirstAidConcept[] = [];
  try {
    textbookConcepts = await getTextbookConcepts();
  } catch {
    // IndexedDB not available or empty — that's fine
  }

  const allConcepts = [...textbookConcepts, ...FIRST_AID_CONCEPTS];
  const normalizedTerms = terms.map(t => t.toLowerCase());

  const scored = allConcepts.map(concept => {
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

    // Boost textbook concepts slightly (user's actual textbook is more relevant)
    if (textbookConcepts.includes(concept)) {
      score *= 1.3;
    }

    return { concept, score };
  }).filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

  return scored.map(({ concept }) => concept);
}
