// Migrate from old localStorage keys
if (!localStorage.getItem("ollopa-api-key") && localStorage.getItem("uworld-to-anki-api-key")) {
  localStorage.setItem("ollopa-api-key", localStorage.getItem("uworld-to-anki-api-key")!);
  const oldModel = localStorage.getItem("uworld-to-anki-model");
  if (oldModel) localStorage.setItem("ollopa-model", oldModel);
}

const STORAGE_KEY_API = "ollopa-api-key";
const STORAGE_KEY_MODEL = "ollopa-model";

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

export async function extractMedicalConcepts(questionText: string): Promise<string[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Anthropic API key not set.");
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250514",
      max_tokens: 256,
      system: `You are a medical education expert. Given a clinical vignette or exam question, extract the key medical concepts that a student should study. Focus on:
- The diagnosis or condition being tested
- Key pathophysiology concepts
- Relevant anatomical structures
- Histological or lab findings
- Related diseases in the differential

Return ONLY a JSON array of 5-10 short search terms (1-3 words each) that would help find relevant flashcards in an Anki deck. Order by importance. Include both the specific answer AND the broader topic.

Example: ["fat necrosis", "acute pancreatitis", "saponification", "calcium deposition", "lipase", "pancreatic enzymes", "mesenteric fat", "chalky white deposits"]

IMPORTANT: Return ONLY the JSON array, no other text.`,
      messages: [{ role: "user", content: questionText }],
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || "[]";
  return parseJsonArray(text);
}

/**
 * Robustly extract a JSON array from LLM output that may contain
 * prose, markdown fences, or other wrapping text.
 */
function parseJsonArray(text: string): string[] {
  console.log("[parseJsonArray] input:", text.slice(0, 200));

  // Try 1: Direct parse
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      console.log("[parseJsonArray] direct parse succeeded:", parsed.length, "items");
      return parsed.filter((t) => typeof t === "string" && t.length > 0);
    }
  } catch { /* continue */ }

  // Try 2: Extract [...] using indexOf/lastIndexOf (most robust)
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start !== -1 && end > start) {
    const candidate = text.slice(start, end + 1);
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) {
        console.log("[parseJsonArray] bracket extraction succeeded:", parsed.length, "items");
        return parsed.filter((t) => typeof t === "string" && t.length > 0);
      }
    } catch { /* continue */ }
  }

  console.error("[parseJsonArray] FAILED to parse:", text);
  return [];
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface QuestionExplanation {
  answer: string;
  reasoning: string;
  testedConcept: string;
  trapAnswers: { answer: string; whyWrong: string }[];
  highYield: string[];
  glossary: GlossaryTerm[];
}

export async function explainQuestion(questionText: string, sessionContext?: string): Promise<QuestionExplanation> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Anthropic API key not set.");
  }

  const model = getModel();

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
      max_tokens: 2500,
      system: `You are a medical education expert tutoring a student who missed a board-style exam question. Analyze the question and provide a structured explanation.

Return ONLY a JSON object with these fields:
- "answer": the correct answer/diagnosis in one phrase (e.g., "Acute pancreatitis causing fat necrosis")
- "reasoning": 2-3 sentences explaining the clinical reasoning chain from the vignette to the answer
- "testedConcept": one sentence stating the core concept being tested and why it's high-yield
- "trapAnswers": array of 2-4 objects, each with "answer" (the wrong choice) and "whyWrong" (1 sentence why students pick it and why it's wrong)
- "highYield": array of 3-5 short strings with related facts the student should memorize
- "glossary": array of 8-15 objects, each with "term" (a medical term that appears in your reasoning, testedConcept, trapAnswers, or highYield text) and "definition" (a concise 1-2 sentence definition a medical student would need). Include terms for diseases, pathophysiology concepts, histological findings, lab values, anatomical structures, and clinical signs mentioned anywhere in your response.${sessionContext ? `\n\n## Student Session Context\n${sessionContext}\n\nIf the student has been missing related concepts, connect this explanation to those patterns.` : ""}

IMPORTANT: Return ONLY the JSON object, no markdown fences, no other text.`,
      messages: [{ role: "user", content: questionText }],
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
  const text = data.content?.[0]?.text || "{}";

  // Extract JSON object from response
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new Error("Could not parse explanation from Claude");
  }

  return JSON.parse(text.slice(start, end + 1));
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
  candidates: CardCandidate[],
  sessionContext?: string
): Promise<MatchResult[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Anthropic API key not set. Go to Settings to add your key.");
  }

  const model = getModel();

  // Build a compact representation of candidates using index numbers
  // Claude will return index numbers, which we map back to real card IDs
  const cardList = candidates
    .map((c, i) => {
      const tagStr = c.tags
        .filter((t) => !t.startsWith("#AK_"))
        .slice(0, 5)
        .join(", ");
      return `[${i}] ${c.text.slice(0, 200)}${tagStr ? ` | Tags: ${tagStr}` : ""}`;
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

Given the question text and a numbered list of candidate flashcards, identify the cards most relevant to the concepts tested in the question.

Respond with ONLY a JSON array. Each element must have:
- "index": the card's number from the list (the number in square brackets)
- "relevance": "high", "medium", or "low"
- "reason": a brief explanation (1 sentence) of why this card is relevant

Return only high and medium relevance cards. Order by relevance (high first). If no cards are relevant, return an empty array [].${sessionContext ? `\n\n## Student Session Context\n${sessionContext}\n\nUse this context to provide more targeted feedback. If you notice recurring weak topics, mention this in your reasons.` : ""}

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
  console.log("[matchCards] Raw response length:", text.length);
  console.log("[matchCards] Raw response preview:", text.slice(0, 500));

  // Robustly extract JSON array from response
  const jsonStr = extractJsonFromResponse(text);
  if (!jsonStr) {
    console.error("[matchCards] Failed to find JSON array in:", text);
    return [];
  }
  console.log("[matchCards] Extracted JSON length:", jsonStr.length);

  try {
    const parsed = JSON.parse(jsonStr);
    console.log("[matchCards] Parsed array length:", parsed.length);
    if (!Array.isArray(parsed)) return [];

    // Map index numbers back to real card IDs
    const results: MatchResult[] = [];
    for (const item of parsed) {
      const idx = item.index ?? item.cardId; // handle both "index" and "cardId" responses
      const relevance = item.relevance;
      const reason = item.reason;

      if (typeof idx !== "number" || !["high", "medium", "low"].includes(relevance) || typeof reason !== "string") {
        continue;
      }

      // Map index to real card ID
      if (idx >= 0 && idx < candidates.length) {
        results.push({
          cardId: candidates[idx].cardId,
          relevance,
          reason,
        });
      }
    }

    console.log("[matchCards] Mapped results:", results.length);
    return results;
  } catch (e) {
    console.error("[matchCards] JSON parse failed:", e, text.slice(0, 300));
    return [];
  }
}

/**
 * Extract the first JSON array from a response that may contain prose.
 */
function extractJsonFromResponse(text: string): string | null {
  // Try 1: Direct parse
  try { JSON.parse(text); return text; } catch { /* continue */ }

  // Try 2: Strip markdown fences
  const fenceStripped = text.replace(/^```json?\n?/m, "").replace(/\n?```$/m, "").trim();
  try { JSON.parse(fenceStripped); return fenceStripped; } catch { /* continue */ }

  // Try 3: Find the first [...] block (greedy to capture nested objects)
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start !== -1 && end > start) {
    const candidate = text.slice(start, end + 1);
    try { JSON.parse(candidate); return candidate; } catch { /* continue */ }
  }

  return null;
}
