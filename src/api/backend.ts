const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

const TOKEN_KEY = "uworld-to-anki-token";
const ANON_USAGE_KEY = "uworld-to-anki-anon-usage";

// ── Token management ──

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ── Anonymous usage tracking (for users who haven't logged in) ──

interface AnonUsage {
  date: string;
  count: number;
}

function getAnonUsage(): AnonUsage {
  try {
    const raw = localStorage.getItem(ANON_USAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const today = new Date().toISOString().split("T")[0];
      if (parsed.date === today) return parsed;
    }
  } catch {}
  return { date: new Date().toISOString().split("T")[0], count: 0 };
}

function incrementAnonUsage(): AnonUsage {
  const usage = getAnonUsage();
  usage.count++;
  localStorage.setItem(ANON_USAGE_KEY, JSON.stringify(usage));
  return usage;
}

export function getSmartSearchesUsedToday(): number {
  return getAnonUsage().count;
}

export const FREE_DAILY_LIMIT = 3;

// ── API helpers ──

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || data.error || `API error: ${response.status}`);
    (error as ApiError).code = data.error;
    (error as ApiError).status = response.status;
    throw error;
  }

  return data as T;
}

interface ApiError extends Error {
  code?: string;
  status?: number;
}

// ── Auth ──

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  plan: "free" | "pro";
}

export interface UsageInfo {
  smartSearches: number;
  studyPlans: number;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
  usage: UsageInfo;
}

export async function loginWithGoogle(
  credential: string
): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
  setToken(data.token);
  return data;
}

export async function getProfile(): Promise<{
  user: UserProfile;
  usage: UsageInfo;
}> {
  return apiFetch("/auth/me");
}

export function logout(): void {
  clearToken();
}

// ── Smart Search (server-side) ──

import type { QuestionExplanation, GlossaryTerm } from "./claude";

export interface ServerMatchResult {
  cardId: number;
  relevance: "high" | "medium" | "low";
  reason: string;
}

export interface SmartSearchResponse {
  matches: ServerMatchResult[];
  explanation: QuestionExplanation | null;
}

export async function extractConcepts(
  questionText: string
): Promise<string[]> {
  const data = await apiFetch<{ concepts: string[] }>(
    "/smart-search/concepts",
    {
      method: "POST",
      body: JSON.stringify({ questionText }),
    }
  );
  return data.concepts;
}

export async function serverSmartSearch(
  questionText: string,
  candidates: { cardId: number; text: string; tags: string[] }[]
): Promise<SmartSearchResponse> {
  // Track anonymous usage if not logged in
  if (!getToken()) {
    incrementAnonUsage();
  }

  return apiFetch<SmartSearchResponse>("/smart-search", {
    method: "POST",
    body: JSON.stringify({ questionText, candidates }),
  });
}

// ── Study Plan ──

export interface StudyPlanSection {
  priority: "high" | "medium" | "low";
  topic: string;
  reason: string;
  action: string;
  cardCount: number;
  searchQuery: string;
}

export interface StudyPlanResponse {
  sections: StudyPlanSection[];
  summary: string;
}

export async function generateStudyPlan(
  ankiStats: {
    topic: string;
    total: number;
    suspended: number;
    due: number;
    highLapse: number;
  }[],
  recentTopics: string[],
  examDate?: string
): Promise<StudyPlanResponse> {
  return apiFetch<StudyPlanResponse>("/study-plan", {
    method: "POST",
    body: JSON.stringify({ ankiStats, recentTopics, examDate }),
  });
}

// ── Billing ──

export async function createCheckout(): Promise<string> {
  const data = await apiFetch<{ url: string }>("/billing/checkout", {
    method: "POST",
  });
  return data.url;
}

// Re-export types used elsewhere
export type { QuestionExplanation, GlossaryTerm };
