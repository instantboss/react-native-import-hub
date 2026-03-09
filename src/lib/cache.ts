interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hash: string;
}

function generateHash(data: unknown): string {
  return JSON.stringify(data).split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0).toString(36);
}

export const CACHE_DURATION = {
  SHORT: 2 * 60 * 1000,
  MEDIUM: 10 * 60 * 1000,
  LONG: 30 * 60 * 1000,
  VERY_LONG: 60 * 60 * 1000,
};

export function getCache<T>(key: string): CacheEntry<T> | null {
  try {
    const cached = localStorage.getItem(`sss_cache_${key}`);
    return cached ? (JSON.parse(cached) as CacheEntry<T>) : null;
  } catch {
    return null;
  }
}

export function setCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      hash: generateHash(data),
    };
    localStorage.setItem(`sss_cache_${key}`, JSON.stringify(entry));
  } catch (e) {
    console.error('Cache write error:', e);
  }
}

export function isCacheFresh(timestamp: number, duration: number): boolean {
  return Date.now() - timestamp < duration;
}

export function hasDataChanged(oldHash: string, newData: unknown): boolean {
  return oldHash !== generateHash(newData);
}

export function clearCache(key: string): void {
  localStorage.removeItem(`sss_cache_${key}`);
}

export function clearAllCache(): void {
  Object.keys(localStorage)
    .filter(k => k.startsWith('sss_cache_'))
    .forEach(k => localStorage.removeItem(k));
}

export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  duration: number = CACHE_DURATION.MEDIUM,
  onUpdate?: (data: T) => void
): Promise<T> {
  const cached = getCache<T>(key);

  if (cached && isCacheFresh(cached.timestamp, duration)) {
    return cached.data;
  }

  if (cached) {
    fetcher().then((freshData) => {
      if (hasDataChanged(cached.hash, freshData)) {
        setCache(key, freshData);
        onUpdate?.(freshData);
      }
    }).catch(console.error);
    return cached.data;
  }

  const data = await fetcher();
  setCache(key, data);
  return data;
}
