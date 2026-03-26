// When served by the Anki add-on, API is on the same origin.
// When developing locally (npm run dev), proxy to the add-on server.
const API_URL = "/api";

interface ApiRequest {
  action: string;
  params?: Record<string, unknown>;
}

interface ApiResponse<T = unknown> {
  result: T;
  error: string | null;
}

async function invoke<T = unknown>(
  action: string,
  params?: Record<string, unknown>
): Promise<T> {
  const request: ApiRequest = { action, params };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  const data: ApiResponse<T> = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.result;
}

export async function checkConnection(): Promise<boolean> {
  try {
    const version = await invoke<number>("version");
    return version >= 1;
  } catch {
    return false;
  }
}

export async function getDecks(): Promise<string[]> {
  return invoke<string[]>("deckNames");
}

export interface CardInfo {
  cardId: number;
  noteId: number;
  fields: Record<string, { value: string; order: number }>;
  tags: string[];
  queue: number; // -1 = suspended, 0 = new, 1 = learning, 2 = review
  deckName: string;
}

export async function findCardsByQID(qid: string): Promise<number[]> {
  // AnKing tags follow patterns like:
  //   #AK_Step1_v12::UWorld::QID_2127
  //   #AK_Step2_v12::UWorld::QID_2127
  // We search broadly to catch all tag formats
  const queries = [
    `tag:*QID_${qid}*`,
    `tag:*qid_${qid}*`,
    `tag:*QID${qid}*`,
    `tag:*UWorld_${qid}*`,
    `tag:*uworld_${qid}*`,
  ];

  const allCardIds = new Set<number>();

  for (const query of queries) {
    try {
      const ids = await invoke<number[]>("findCards", { query });
      ids.forEach((id) => allCardIds.add(id));
    } catch {
      // Query format not supported or no results — skip
    }
  }

  return Array.from(allCardIds);
}

export async function getCardInfo(cardIds: number[]): Promise<CardInfo[]> {
  if (cardIds.length === 0) return [];
  return invoke<CardInfo[]>("cardsInfo", { cards: cardIds });
}

export async function unsuspendCards(cardIds: number[]): Promise<boolean> {
  if (cardIds.length === 0) return true;
  return invoke<boolean>("unsuspend", { cards: cardIds });
}

export async function suspendCards(cardIds: number[]): Promise<boolean> {
  if (cardIds.length === 0) return true;
  return invoke<boolean>("suspend", { cards: cardIds });
}

export interface QIDResult {
  qid: string;
  cardIds: number[];
  cards: CardInfo[];
  suspendedCount: number;
  totalCount: number;
}

export async function lookupQIDs(qids: string[]): Promise<QIDResult[]> {
  const results: QIDResult[] = [];

  for (const qid of qids) {
    const cardIds = await findCardsByQID(qid);
    const cards = await getCardInfo(cardIds);
    const suspendedCount = cards.filter((c) => c.queue === -1).length;

    results.push({
      qid,
      cardIds,
      cards,
      suspendedCount,
      totalCount: cards.length,
    });
  }

  return results;
}
