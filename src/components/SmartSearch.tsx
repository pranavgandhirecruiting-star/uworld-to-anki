import { useState } from "react";
import { searchCards, getCardInfo, type CardInfo } from "../api/ankiConnect";
import {
  matchCardsToQuestion,
  getApiKey,
  type MatchResult,
} from "../api/claude";

// Medical stopwords to filter out when building search queries
const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "need", "dare", "ought",
  "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
  "as", "into", "through", "during", "before", "after", "above", "below",
  "between", "out", "off", "over", "under", "again", "further", "then",
  "once", "here", "there", "when", "where", "why", "how", "all", "each",
  "every", "both", "few", "more", "most", "other", "some", "such", "no",
  "nor", "not", "only", "own", "same", "so", "than", "too", "very",
  "just", "because", "but", "and", "or", "if", "while", "that", "this",
  "these", "those", "what", "which", "who", "whom", "its", "his", "her",
  "their", "my", "your", "our", "he", "she", "it", "they", "we", "you",
  "me", "him", "them", "us", "i", "patient", "presents", "year", "old",
  "man", "woman", "history", "following", "most", "likely", "diagnosis",
  "examination", "shows", "reveals", "reports", "brought", "given",
]);

function extractSearchTerms(text: string): string {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));

  // Deduplicate and take top 8 most "medical-looking" terms
  const unique = [...new Set(words)];
  // Prefer longer words (more likely to be medical terms)
  unique.sort((a, b) => b.length - a.length);
  return unique.slice(0, 8).join(" ");
}

export interface SmartSearchResult {
  cardId: number;
  card: CardInfo;
  relevance: "high" | "medium" | "low";
  reason: string;
}

interface Props {
  onResults: (results: SmartSearchResult[]) => void;
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

  const hasApiKey = !!getApiKey();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled || loading) return;

    if (!hasApiKey) {
      onError("No API key set. Open Settings (gear icon) to add your Anthropic API key.");
      return;
    }

    setLoading(true);
    onError("");

    try {
      // Step 1: Extract keywords and search Anki
      setStatus("Searching your Anki deck for candidate cards...");
      const searchTerms = extractSearchTerms(input);

      if (!searchTerms) {
        onError("Could not extract meaningful search terms from the question.");
        setLoading(false);
        return;
      }

      const candidates = await searchCards(searchTerms, 200);

      if (candidates.length === 0) {
        onError(
          `No candidate cards found for: "${searchTerms}". Try pasting a more detailed question or specific medical terms.`
        );
        setLoading(false);
        return;
      }

      // Step 2: Send candidates to Claude for semantic matching
      setStatus(
        `Found ${candidates.length} candidates. Asking Claude to find the best matches...`
      );

      const matches: MatchResult[] = await matchCardsToQuestion(
        input,
        candidates.map((c) => ({
          cardId: c.cardId,
          text: c.text,
          tags: c.tags,
        }))
      );

      if (matches.length === 0) {
        onError(
          "Claude didn't find any strongly relevant cards. Try rephrasing or adding more detail about the medical concepts."
        );
        setLoading(false);
        return;
      }

      // Step 3: Get full card info for matched cards
      setStatus("Loading card details...");
      const matchedCardIds = matches.map((m) => m.cardId);
      const fullCards = await getCardInfo(matchedCardIds);

      // Build results with card info + relevance
      const cardMap = new Map(fullCards.map((c) => [c.cardId, c]));
      const results: SmartSearchResult[] = matches
        .filter((m) => cardMap.has(m.cardId))
        .map((m) => ({
          cardId: m.cardId,
          card: cardMap.get(m.cardId)!,
          relevance: m.relevance,
          reason: m.reason,
        }));

      setStatus("");
      onResults(results);
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
      {!hasApiKey && (
        <div className="smart-search-warning">
          Requires an Anthropic API key. Click the gear icon above to add one.
        </div>
      )}
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
            disabled={!input.trim() || disabled || loading || !hasApiKey}
          >
            {loading ? "Matching..." : "Find Matching Cards"}
          </button>
        </div>
      </div>
    </form>
  );
}
