/**
 * Generic localStorage-backed persistence for offline/fallback mode.
 *
 * Used when the FastAPI backend is unreachable (down, not started, wrong
 * URL) so the app keeps working for demo/local-testing purposes instead
 * of showing a wall of network errors. Every entity gets its own
 * namespaced key; each helper mimics a tiny REST-ish CRUD surface so the
 * fallback functions in each feature's api.ts can mirror the real
 * network calls closely.
 */

const NAMESPACE = "social-suite:offline:";

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(NAMESPACE + key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, items: T[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NAMESPACE + key, JSON.stringify(items));
}

export const localStore = {
  list<T>(key: string): T[] {
    return readList<T>(key);
  },
  set<T>(key: string, items: T[]): void {
    writeList(key, items);
  },
  insert<T extends { id: string }>(key: string, item: T): T {
    const items = readList<T>(key);
    items.push(item);
    writeList(key, items);
    return item;
  },
  update<T extends { id: string }>(key: string, id: string, patch: Partial<T>): T | null {
    const items = readList<T>(key);
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...patch } as T;
    writeList(key, items);
    return items[index];
  },
  remove(key: string, id: string): void {
    const items = readList<{ id: string }>(key);
    writeList(
      key,
      items.filter((i) => i.id !== id)
    );
  },
  clear(key: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(NAMESPACE + key);
  },
};

export function generateLocalId(prefix: string): string {
  return `${prefix}_local_${Math.random().toString(36).slice(2, 10)}`;
}
