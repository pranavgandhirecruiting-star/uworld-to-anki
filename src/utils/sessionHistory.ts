const STORAGE_KEY = "ollopa-sessions";
const LEGACY_KEY = "uworld-to-anki-sessions";

export interface Session {
  id: string;
  timestamp: number;
  mode: "qid" | "smart";
  qids: string[];
  questionText?: string;
  concepts?: string[];      // Medical concepts extracted (e.g., "epidural hematoma", "middle meningeal artery")
  topics?: string[];        // Organ system/topic tags (e.g., "Neurology", "Cardiology")
  totalCardsFound: number;
  cardsUnsuspended: number;
}

export function getSessions(): Session[] {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    // Migrate from old key if needed
    if (!raw) {
      raw = localStorage.getItem(LEGACY_KEY);
      if (raw) {
        localStorage.setItem(STORAGE_KEY, raw);
        localStorage.removeItem(LEGACY_KEY);
      }
    }
    if (!raw) return [];
    const sessions = JSON.parse(raw) as Session[];
    // Backfill mode for legacy sessions that don't have it
    return sessions.map(s => ({ ...s, mode: s.mode || "qid" }));
  } catch {
    return [];
  }
}

export function saveSession(session: Omit<Session, "id">): Session {
  const sessions = getSessions();
  const newSession: Session = {
    ...session,
    id: crypto.randomUUID(),
  };
  sessions.unshift(newSession);
  // Keep last 100 sessions
  const trimmed = sessions.slice(0, 100);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  return newSession;
}

export function clearSessions(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getTopicSummary(): { topic: string; count: number; lastSeen: number }[] {
  const sessions = getSessions();
  const topicMap = new Map<string, { count: number; lastSeen: number }>();

  for (const session of sessions) {
    if (session.topics) {
      for (const topic of session.topics) {
        const existing = topicMap.get(topic);
        if (existing) {
          existing.count++;
          existing.lastSeen = Math.max(existing.lastSeen, session.timestamp);
        } else {
          topicMap.set(topic, { count: 1, lastSeen: session.timestamp });
        }
      }
    }
  }

  return Array.from(topicMap.entries())
    .map(([topic, data]) => ({ topic, ...data }))
    .sort((a, b) => b.count - a.count);
}
