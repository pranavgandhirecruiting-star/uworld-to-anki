/**
 * Session context accumulates across SmartSearch calls.
 * Tracks missed topics, emerging patterns, and concept history.
 * Reset when the browser tab is closed (sessionStorage).
 */

const CONTEXT_KEY = "ollopa-session-context";

export interface SessionContext {
  /** Topics extracted from missed questions, with counts */
  topicCounts: Record<string, number>;
  /** Recent concepts extracted (last 10 searches) */
  recentConcepts: string[][];
  /** Total searches this session */
  searchCount: number;
  /** Timestamp of first search */
  sessionStart: number;
}

function getDefault(): SessionContext {
  return {
    topicCounts: {},
    recentConcepts: [],
    searchCount: 0,
    sessionStart: Date.now(),
  };
}

export function getSessionContext(): SessionContext {
  try {
    const raw = sessionStorage.getItem(CONTEXT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return getDefault();
}

export function updateSessionContext(concepts: string[], topics: string[]): SessionContext {
  const ctx = getSessionContext();

  // Increment topic counts
  for (const topic of topics) {
    ctx.topicCounts[topic] = (ctx.topicCounts[topic] || 0) + 1;
  }

  // Add to recent concepts (keep last 10 searches)
  ctx.recentConcepts.push(concepts);
  if (ctx.recentConcepts.length > 10) {
    ctx.recentConcepts = ctx.recentConcepts.slice(-10);
  }

  ctx.searchCount++;

  sessionStorage.setItem(CONTEXT_KEY, JSON.stringify(ctx));
  return ctx;
}

export function getContextSummary(): string {
  const ctx = getSessionContext();
  if (ctx.searchCount === 0) return "";

  // Build a summary string for injection into Claude prompts
  const lines: string[] = [];
  lines.push(`Session: ${ctx.searchCount} question(s) analyzed so far.`);

  // Top missed topics
  const sorted = Object.entries(ctx.topicCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  if (sorted.length > 0) {
    lines.push("Recurring weak topics this session:");
    for (const [topic, count] of sorted) {
      lines.push(`  - ${topic}: missed ${count} time(s)`);
    }
  }

  // Recent concepts for pattern detection
  if (ctx.recentConcepts.length > 1) {
    const allConcepts = ctx.recentConcepts.flat();
    const conceptCounts: Record<string, number> = {};
    for (const c of allConcepts) {
      conceptCounts[c] = (conceptCounts[c] || 0) + 1;
    }
    const recurring = Object.entries(conceptCounts)
      .filter(([, count]) => count >= 2)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    if (recurring.length > 0) {
      lines.push("Concepts appearing in multiple missed questions:");
      for (const [concept, count] of recurring) {
        lines.push(`  - "${concept}" (${count} times)`);
      }
    }
  }

  return lines.join("\n");
}

export function clearSessionContext(): void {
  sessionStorage.removeItem(CONTEXT_KEY);
}
