import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "removebg-history";
const DB_VERSION = 1;
const STORE_NAME = "images";

interface HistoryEntry {
  id: string;
  originalBlob: Blob;
  processedBlob: Blob;
  fileName: string;
  timestamp: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("timestamp", "timestamp");
        }
      },
    });
  }
  return dbPromise;
}

export async function saveToHistory(
  originalBlob: Blob,
  processedBlob: Blob,
  fileName: string
): Promise<HistoryEntry> {
  const db = await getDB();
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    originalBlob,
    processedBlob,
    fileName,
    timestamp: Date.now(),
  };
  await db.put(STORE_NAME, entry);
  return entry;
}

export async function getHistory(): Promise<HistoryEntry[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex(STORE_NAME, "timestamp");
  return all.reverse();
}

export async function getHistoryEntry(
  id: string
): Promise<HistoryEntry | undefined> {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function clearHistory(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE_NAME);
}

export type { HistoryEntry };
