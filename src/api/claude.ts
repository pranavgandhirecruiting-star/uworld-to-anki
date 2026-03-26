const STORAGE_KEY_API = "uworld-to-anki-api-key";
const STORAGE_KEY_MODEL = "uworld-to-anki-model";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

export type ModelChoice = "claude-haiku-4-5-20251001" | "claude-sonnet-4-5-20250514";

export function getApiKey(): string {
  return localStorage.getItem(STORAGE_KEY_API) || "";
}

export function setApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY_API, key.trim());
}

export function getModel(): ModelChoice {
  return (localStorage.getItem(STORAGE_KEY_MODEL) as ModelChoice) || "claude-haiku-4-5-20251001";
}

export function setModel(model: ModelChoice): void {
  localStorage.setItem(STORAGE_KEY_MODEL, model);
}

export async function testApiKey(key: string): Promise<boolean> {
  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 10,
        messages: [{ role: "user", content: "Say ok" }],
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export interface CardCandidate {
  cardId: number;
  text: string;
  tags: string[];
}

export interface MatchResult {
  cardId: number;
  relevance: "high" | "medium" | "low";
  reason: string;
}

export async function matchCardsToQuestion(
  questionText: string,
  candidates: CardCandidate[]
): Promise<MatchResult[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Anthropic API key not set. Go to Settings to add your key.");
  }

  const model = getModel();

  // Build a compact representation of candidates
  const cardList = candidates
    .map((c, i) => {
      const tagStr = c.tags
        .filter((t) => !t.startsWith("#AK_")) // skip verbose AnKing hierarchy prefixes
        .slice(0, 5)
        .join(", ");
      return `[${i}] ID:${c.cardId} | ${c.text.slice(0, 200)}${tagStr ? ` | Tags: ${tagStr}` : ""}`;
    })
    .join("\n");

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: `You are a medical education expert helping a student find relevant Anki flashcards for a question they missed on a practice exam.

Given the question text and a list of candidate flashcards, identify the cards most relevant to the concepts tested in the question.

Respond with ONLY a JSON array. Each element must have:
- "cardId": the card's ID number
- "relevance": "high", "medium", or "low"
- "reason": a brief explanation (1 sentence) of why this card is relevant

Return only high and medium relevance cards. Order by relevance (high first). If no cards are relevant, return an empty array [].

IMPORTANT: Respond with ONLY the JSON array, no markdown fences, no other text.`,
      messages: [
        {
          role: "user",
          content: `## Question the student missed:
${questionText}

## Candidate flashcards (${candidates.length} cards):
${cardList}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { error?: { message?: string } })?.error?.message ||
        `API error: ${response.status}`
    );
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || "[]";

  // Parse the JSON response, handling potential markdown fences
  const jsonStr = text.replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim();

  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m: MatchResult) =>
        typeof m.cardId === "number" &&
        ["high", "medium", "low"].includes(m.relevance) &&
        typeof m.reason === "string"
    );
  } catch {
    console.error("Failed to parse Claude response:", text);
    return [];
  }
}
