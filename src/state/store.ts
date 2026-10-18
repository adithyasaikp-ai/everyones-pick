/**
 * Storage abstraction.
 *
 * The persistence logic depends only on this tiny async key/value interface, so
 * it stays independent of React Native and can be unit-tested with an in-memory
 * implementation. The real app wires in `asyncStorageStore` (see
 * `asyncStorageStore.ts`).
 */
export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/** In-memory store used by tests and non-persistent previews. */
export function createMemoryStore(initial: Record<string, string> = {}): KeyValueStore {
  const map = new Map<string, string>(Object.entries(initial));

  return {
    getItem(key) {
      const value = map.get(key);
      return Promise.resolve(value === undefined ? null : value);
    },
    setItem(key, value) {
      map.set(key, value);
      return Promise.resolve();
    },
    removeItem(key) {
      map.delete(key);
      return Promise.resolve();
    },
  };
}
