// Google Apps Script API service with Stale-While-Revalidate (SWR) Caching
export const API_URL =
  "https://script.google.com/macros/s/AKfycbyQqK_I1mcvMaXxj2jBRhudbpJmiGCfwTAn8SjH2bp3k2WdYvEj-Ga_9wVw4vmUdkCl/exec";

interface CacheOptions {
  useCache?: boolean;
  forceRefresh?: boolean;
  ttlMs?: number; // default 10 minutes
}

const CACHE_PREFIX = "ha_cache_";
const DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes

// Actions that are safe to cache
const CACHEABLE_ACTIONS = new Set([
  "get_student_list",
  "get_settings",
  "get_leaderboard",
  "get_history",
  "get_attendance",
  "get_market_items",
]);

export async function callApi<T = any>(
  action: string,
  payload: Record<string, any> = {},
  options: CacheOptions = {}
): Promise<T> {
  const isCacheable = options.useCache ?? CACHEABLE_ACTIONS.has(action);
  const cacheKey = `${CACHE_PREFIX}${action}_${JSON.stringify(payload)}`;
  const ttl = options.ttlMs || DEFAULT_TTL;

  // 1. Check local cache (Instant 0ms response)
  if (isCacheable && !options.forceRefresh && typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;

        // Trigger background revalidation if data is older than 30 seconds
        if (age > 30 * 1000) {
          revalidateInBackground(action, payload, cacheKey);
        }

        return data as T;
      }
    } catch (e) {
      console.warn("Cache read error:", e);
    }
  }

  // 2. Network Fetch
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({ action, ...payload }),
    });

    const data = await res.json();

    // 3. Save to cache if successful
    if (isCacheable && data && data.status === "success") {
      try {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ data, timestamp: Date.now() })
        );
      } catch (e) {
        console.warn("Cache write error:", e);
      }
    }

    // 4. Invalidate related caches on mutation
    if (!CACHEABLE_ACTIONS.has(action)) {
      invalidateRelatedCaches(action);
    }

    return data as T;
  } catch (error) {
    // If network fails but we have stale cache, fallback to stale cache
    if (isCacheable && typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data } = JSON.parse(cached);
          console.warn(`Network failed for ${action}, returning stale cache.`);
          return data as T;
        }
      } catch (e) {}
    }
    console.error(`API Error on action "${action}":`, error);
    throw error;
  }
}

// Background revalidation without blocking UI
async function revalidateInBackground(
  action: string,
  payload: Record<string, any>,
  cacheKey: string
) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({ action, ...payload }),
    });
    const data = await res.json();
    if (data && data.status === "success") {
      localStorage.setItem(
        cacheKey,
        JSON.stringify({ data, timestamp: Date.now() })
      );
    }
  } catch (e) {
    // Silent fail in background
  }
}

// Invalidate caches when actions modify data
export function invalidateRelatedCaches(action: string) {
  if (typeof window === "undefined") return;

  const toClear: string[] = [];
  if (action === "save" || action === "duel_resolve") {
    toClear.push("get_history", "get_leaderboard", "get_attendance");
  } else if (action === "update_settings" || action === "reset_coins") {
    toClear.push("get_settings", "get_leaderboard");
  } else if (action === "add_market_item" || action === "delete_market_item") {
    toClear.push("get_market_items");
  } else if (action === "archive_student" || action === "restore_student") {
    toClear.push("get_student_list");
  } else if (action === "clear_attendance") {
    toClear.push("get_attendance");
  }

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        if (toClear.some((c) => key.includes(c))) {
          localStorage.removeItem(key);
        }
      }
    }
  } catch (e) {}
}

// Pre-fetch common data in the background on app start
export function prefetchCommonData() {
  if (typeof window === "undefined") return;
  // Run asynchronously without blocking
  setTimeout(() => {
    callApi("get_student_list").catch(() => {});
    callApi("get_settings").catch(() => {});
    callApi("get_leaderboard").catch(() => {});
  }, 100);
}
