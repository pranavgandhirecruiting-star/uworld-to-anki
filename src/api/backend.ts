const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

const TOKEN_KEY = "ollopa-token";

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
  candidates: { cardId: number; text: string; tags: string[] }[],
  sessionContext?: string
): Promise<SmartSearchResponse> {
  return apiFetch<SmartSearchResponse>("/smart-search", {
    method: "POST",
    body: JSON.stringify({ questionText, candidates, sessionContext }),
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
  recentActivity: {
    topicSummary: { topic: string; count: number; weightedScore: number }[];
    recentQuestions: { question: string; topics: string[]; concepts: string[] }[];
  },
  examDate?: string,
  dismissedTopics?: string[]
): Promise<StudyPlanResponse> {
  return apiFetch<StudyPlanResponse>("/study-plan", {
    method: "POST",
    body: JSON.stringify({ ankiStats, recentActivity, examDate, dismissedTopics }),
  });
}

// ── Billing ──

export async function createCheckout(): Promise<string> {
  const data = await apiFetch<{ url: string }>("/billing/checkout", {
    method: "POST",
  });
  return data.url;
}

// ── Textbook ──

export interface TextbookChunkResult {
  concepts: Array<{
    concept: string;
    keywords: string[];
    summary: string;
    system: string;
    highYield: string;
    pageRef?: string;
  }>;
  batch: number;
}

export async function chunkTextbookBatch(
  pages: string[],
  batchIndex: number,
  totalBatches: number
): Promise<TextbookChunkResult> {
  return apiFetch<TextbookChunkResult>("/textbook/chunk", {
    method: "POST",
    body: JSON.stringify({ pages, batchIndex, totalBatches }),
  });
}

// Re-export types used elsewhere
export type { QuestionExplanation, GlossaryTerm };
