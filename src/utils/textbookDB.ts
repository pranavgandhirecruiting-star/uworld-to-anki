/**
 * IndexedDB wrapper for storing processed textbook concepts.
 * Concepts persist across sessions — process once, use forever.
 */

import { type FirstAidConcept } from "../data/firstAidConcepts";

const DB_NAME = "ollopa-textbook";
const DB_VERSION = 1;
const STORE_NAME = "concepts";
const META_STORE = "meta";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getTextbookConcepts(): Promise<FirstAidConcept[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveTextbookConcepts(concepts: FirstAidConcept[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  // Clear existing
  store.clear();
  for (const concept of concepts) {
    store.add(concept);
  }
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getTextbookMeta(): Promise<{ name: string; processedAt: string; conceptCount: number } | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, "readonly");
    const store = tx.objectStore(META_STORE);
    const request = store.get("textbook");
    request.onsuccess = () => resolve(request.result?.value || null);
    request.onerror = () => reject(request.error);
  });
}

export async function saveTextbookMeta(meta: { name: string; processedAt: string; conceptCount: number }): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(META_STORE, "readwrite");
  const store = tx.objectStore(META_STORE);
  store.put({ key: "textbook", value: meta });
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearTextbook(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction([STORE_NAME, META_STORE], "readwrite");
  tx.objectStore(STORE_NAME).clear();
  tx.objectStore(META_STORE).clear();
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function hasTextbook(): Promise<boolean> {
  const meta = await getTextbookMeta();
  return meta !== null && meta.conceptCount > 0;
}
