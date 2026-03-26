const STORAGE_KEY = "uworld-to-anki-sessions";

export interface Session {
  id: string;
  timestamp: number;
  qids: string[];
  totalCardsFound: number;
  cardsUnsuspended: number;
}

export function getSessions(): Session[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
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
