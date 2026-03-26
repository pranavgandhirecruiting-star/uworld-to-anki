const ANKI_CONNECT_URL = "http://127.0.0.1:8765";

interface AnkiConnectRequest {
  action: string;
  version: 6;
  params?: Record<string, unknown>;
}

interface AnkiConnectResponse<T = unknown> {
  result: T;
  error: string | null;
}

async function invoke<T = unknown>(
  action: string,
  params?: Record<string, unknown>
): Promise<T> {
  const request: AnkiConnectRequest = { action, version: 6, params };

  const response = await fetch(ANKI_CONNECT_URL, {
    method: "POST",
    body: JSON.stringify(request),
  });

  const data: AnkiConnectResponse<T> = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.result;
}

export async function checkConnection(): Promise<boolean> {
  try {
    const version = await invoke<number>("version");
    return version >= 6;
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
