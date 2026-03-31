import { useState } from "react";
import { searchCards, getCardInfo, type CardInfo } from "../api/ankiConnect";
import {
  extractMedicalConcepts,
  matchCardsToQuestion,
  explainQuestion,
  type QuestionExplanation,
} from "../api/claude";
import { getContextSummary, updateSessionContext } from "../utils/sessionContext";
import { findRelevantConcepts } from "../utils/firstAidLookup";
import { type FirstAidConcept } from "../data/firstAidConcepts";

export interface SmartSearchResult {
  cardId: number;
  card: CardInfo;
  relevance: "high" | "medium" | "low";
  reason: string;
}

interface Props {
  onResults: (results: SmartSearchResult[], explanation: QuestionExplanation | null, firstAidConcepts: FirstAidConcept[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  disabled: boolean;
  onError: (error: string) => void;
}

export function SmartSearch({
  onResults,
  loading,
  setLoading,
  disabled,
  onError,
}: Props) {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled || loading) return;

    setLoading(true);
    onError("");

    try {
      // Step 1: Ask Claude to extract key medical concepts
      setStatus("Analyzing question with Claude...");
      const concepts = await extractMedicalConcepts(input);
      console.log("[SmartSearch] Extracted concepts:", concepts);

      if (concepts.length === 0) {
        onError("Could not extract medical concepts from the question. Try adding more clinical detail.");
        setLoading(false);
        return;
      }

      // Find relevant First Aid concepts based on extracted terms
      const firstAidMatches = await findRelevantConcepts(concepts);

      setStatus(`Identified concepts: ${concepts.join(", ")}. Searching Anki...`);

      // Step 2: Search Anki with each concept, collecting unique candidates
      const candidateMap = new Map<number, { cardId: number; text: string; tags: string[]; deckName: string; queue: number }>();

      for (const concept of concepts) {
        try {
          const results = await searchCards(concept, 50);
          console.log(`[SmartSearch] "${concept}" → ${results.length} cards`);
          for (const card of results) {
            if (!candidateMap.has(card.cardId)) {
              candidateMap.set(card.cardId, card);
            }
          }
        } catch (err) {
          console.error(`[SmartSearch] Search failed for "${concept}":`, err);
        }
        // Stop if we have enough candidates
        if (candidateMap.size >= 200) break;
      }
      console.log("[SmartSearch] Total unique candidates:", candidateMap.size);

      const candidates = Array.from(candidateMap.values());

      if (candidates.length === 0) {
        onError(
          `No cards found for concepts: ${concepts.join(", ")}. Your deck may not cover this topic.`
        );
        setLoading(false);
        return;
      }

      // Step 3: Run card matching AND question explanation in parallel
      setStatus(
        `Found ${candidates.length} candidate cards. Analyzing with Claude...`
      );

      const sessionCtx = getContextSummary();

      const [matches, explanation] = await Promise.all([
        matchCardsToQuestion(
          input,
          candidates.map((c) => ({
            cardId: c.cardId,
            text: c.text,
            tags: c.tags,
          })),
          sessionCtx || undefined
        ),
        explainQuestion(input, sessionCtx || undefined).catch((err) => {
          console.error("Explanation failed:", err);
          return null;
        }),
      ]);

      if (matches.length === 0) {
        // Even if no cards matched, we might still have an explanation
        if (explanation) {
          onResults([], explanation, firstAidMatches);
        } else {
          onError(
            "Claude didn't find any strongly relevant cards among the candidates. The topic may not be well-covered in your deck."
          );
        }
        setLoading(false);
        return;
      }

      // Step 4: Get full card info for matched cards
      setStatus("Loading card details...");
      const matchedCardIds = matches.map((m) => m.cardId);
      const fullCards = await getCardInfo(matchedCardIds);

      const cardMap = new Map(fullCards.map((c) => [c.cardId, c]));
      const results: SmartSearchResult[] = matches
        .filter((m) => cardMap.has(m.cardId))
        .map((m) => ({
          cardId: m.cardId,
          card: cardMap.get(m.cardId)!,
          relevance: m.relevance,
          reason: m.reason,
        }));

      // Update session context with concepts and topic tags from matched cards
      const topicTags: string[] = [];
      for (const r of results) {
        for (const tag of r.card.tags) {
          if (tag.startsWith("#AK_Step") && tag.includes("::")) {
            const parts = tag.split("::");
            if (parts.length >= 2) {
              const topic = parts[1].replace(/_/g, " ");
              if (topic && !topicTags.includes(topic)) {
                topicTags.push(topic);
              }
            }
          }
        }
      }
      updateSessionContext(concepts, topicTags);

      setStatus("");
      onResults(results, explanation, firstAidMatches);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Smart search failed");
    }

    setLoading(false);
    setStatus("");
  };

  return (
    <form onSubmit={handleSubmit} className="qid-input">
      <label htmlFor="smart-textarea">
        Paste a question you missed (from any qbank)
      </label>
      <textarea
        id="smart-textarea"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={`Paste the full question text here, e.g.:\n\nA 45-year-old woman presents with periorbital edema and foamy urine. Labs show 4+ proteinuria and serum albumin of 2.1. Renal biopsy shows podocyte effacement on electron microscopy. What is the most likely diagnosis?`}
        rows={7}
        disabled={loading}
        autoFocus
      />
      <div className="qid-input-footer">
        <span className="qid-count">
          {status || (input.trim() ? `${input.trim().split(/\s+/).length} words` : "Paste a question...")}
        </span>
        <div className="qid-actions">
          {input && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setInput("")}
              disabled={loading}
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!input.trim() || disabled || loading}
          >
            {loading ? "Matching..." : "Find Matching Cards"}
          </button>
        </div>
      </div>
    </form>
  );
}
