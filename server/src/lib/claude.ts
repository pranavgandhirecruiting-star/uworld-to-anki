import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

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

export async function extractMedicalConcepts(
  questionText: string
): Promise<string[]> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 256,
    system: `You are a medical education expert. Given a clinical vignette or exam question, extract the key medical concepts that a student should study. Focus on:
- The diagnosis or condition being tested
- Key pathophysiology concepts
- Relevant anatomical structures
- Histological or lab findings
- Related diseases in the differential

Return ONLY a JSON array of 5-10 short search terms (1-3 words each) that would help find relevant flashcards in an Anki deck. Order by importance. Include both the specific answer AND the broader topic.

IMPORTANT: Return ONLY the JSON array, no other text.`,
    messages: [{ role: "user", content: questionText }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "[]";
  return parseJsonArray(text);
}

export async function matchCardsToQuestion(
  questionText: string,
  candidates: CardCandidate[],
  sessionContext?: string
): Promise<MatchResult[]> {
  const cardList = candidates
    .map((c, i) => {
      const tagStr = c.tags
        .filter((t) => !t.startsWith("#AK_"))
        .slice(0, 5)
        .join(", ");
      return `[${i}] ${c.text.slice(0, 200)}${tagStr ? ` | Tags: ${tagStr}` : ""}`;
    })
    .join("\n");

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
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
        content: `## Question the student missed:\n${questionText}\n\n## Candidate flashcards (${candidates.length} cards):\n${cardList}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "[]";

  const jsonStr = extractJsonFromResponse(text);
  if (!jsonStr) return [];

  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) return [];

    const results: MatchResult[] = [];
    for (const item of parsed) {
      const idx = item.index ?? item.cardId;
      if (
        typeof idx !== "number" ||
        !["high", "medium", "low"].includes(item.relevance) ||
        typeof item.reason !== "string"
      )
        continue;
      if (idx >= 0 && idx < candidates.length) {
        results.push({
          cardId: candidates[idx].cardId,
          relevance: item.relevance,
          reason: item.reason,
        });
      }
    }
    return results;
  } catch {
    return [];
  }
}

export async function explainQuestion(
  questionText: string,
  sessionContext?: string
): Promise<QuestionExplanation> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2500,
    system: `You are a medical education expert tutoring a student who missed a board-style exam question. Analyze the question and provide a structured explanation.

Return ONLY a JSON object with these fields:
- "answer": the correct answer/diagnosis in one phrase
- "reasoning": 2-3 sentences explaining the clinical reasoning chain from the vignette to the answer
- "testedConcept": one sentence stating the core concept being tested and why it's high-yield
- "trapAnswers": array of 2-4 objects, each with "answer" and "whyWrong" (1 sentence)
- "highYield": array of 3-5 short strings with related facts the student should memorize
- "glossary": array of 8-15 objects, each with "term" (a medical term from your response) and "definition" (concise 1-2 sentence definition)${sessionContext ? `\n\n## Student Session Context\n${sessionContext}\n\nIf the student has been missing related concepts, connect this explanation to those patterns.` : ""}

IMPORTANT: Return ONLY the JSON object, no markdown fences, no other text.`,
    messages: [{ role: "user", content: questionText }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "{}";
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new Error("Could not parse explanation");
  }
  return JSON.parse(text.slice(start, end + 1));
}

export async function generateStudyPlan(
  ankiStats: { topic: string; total: number; suspended: number; due: number; highLapse: number }[],
  recentTopics: string[],
  examDate?: string
): Promise<string> {
  const statsText = ankiStats
    .map(
      (s) =>
        `${s.topic}: ${s.total} cards (${s.suspended} suspended, ${s.due} due today, ${s.highLapse} high-lapse)`
    )
    .join("\n");

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    system: `You are a medical education expert creating a personalized study plan for a medical student preparing for board exams.

Given the student's Anki card statistics by topic and their recently missed question topics, generate a prioritized 45-60 minute study plan for tonight.

Return ONLY a JSON object with:
- "sections": array of 3-5 objects, each with:
  - "priority": "high" | "medium" | "low"
  - "topic": the topic name
  - "reason": 1 sentence why this needs attention tonight
  - "action": what to do ("Review X cards", "Unsuspend and review Y cards", etc.)
  - "cardCount": estimated number of cards to review
  - "searchQuery": an Anki search query to find these cards (e.g., "tag:*Cardiology* is:due")
- "summary": 1-2 sentence overall assessment of their readiness

IMPORTANT: Return ONLY the JSON object, no markdown fences, no other text.`,
    messages: [
      {
        role: "user",
        content: `## Anki Card Stats by Topic:\n${statsText}\n\n## Topics from recently missed questions:\n${recentTopics.join(", ") || "None recorded yet"}\n\n${examDate ? `## Exam date: ${examDate}` : ""}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "{}";
  return text;
}

// ── Parsing helpers ──

function parseJsonArray(text: string): string[] {
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed))
      return parsed.filter((t) => typeof t === "string" && t.length > 0);
  } catch {}

  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start !== -1 && end > start) {
    try {
      const parsed = JSON.parse(text.slice(start, end + 1));
      if (Array.isArray(parsed))
        return parsed.filter((t) => typeof t === "string" && t.length > 0);
    } catch {}
  }

  return [];
}

function extractJsonFromResponse(text: string): string | null {
  try {
    JSON.parse(text);
    return text;
  } catch {}

  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start !== -1 && end > start) {
    const candidate = text.slice(start, end + 1);
    try {
      JSON.parse(candidate);
      return candidate;
    } catch {}
  }

  return null;
}
