import "server-only";

/*
 * A small in-memory cache for chain reads, for one reason: the public Monad RPC
 * allows 15 requests a second, and a room full of people opening the same
 * vehicle link at once would otherwise spend that in one go and get a 500.
 *
 * Three things it does that a plain TTL map would not:
 * - concurrent requests for the same key share one in-flight read;
 * - when a refresh fails, the last good value is served instead of an error,
 *   and the next request tries again;
 * - it stays bounded, dropping the oldest keys past a few hundred.
 */

type Entry<T> = {
  at: number;
  pending: Promise<T>;
  /** The last value that loaded successfully, if any. */
  last?: { value: T };
};

const MAX_KEYS = 500;
const store = new Map<string, Entry<unknown>>();

export function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const entry = store.get(key) as Entry<T> | undefined;
  if (entry && Date.now() - entry.at < ttlMs) return entry.pending;

  const previous = entry?.last;
  const next: Entry<T> = { at: Date.now(), pending: Promise.resolve() as Promise<T>, last: previous };

  next.pending = load().then(
    (value) => {
      next.last = { value };
      return value;
    },
    (error: unknown) => {
      if (previous) {
        // Serve what we had, and let the very next request try the chain again.
        store.set(key, { at: 0, pending: Promise.resolve(previous.value), last: previous });
        return previous.value;
      }
      if (store.get(key) === next) store.delete(key);
      throw error;
    },
  );

  store.delete(key);
  store.set(key, next);
  if (store.size > MAX_KEYS) store.delete(store.keys().next().value!);

  return next.pending;
}
