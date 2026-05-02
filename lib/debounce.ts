/**
 * Debounce utility for API calls
 * 
 * This utility prevents excessive API calls by delaying function execution
 * until a specified time has passed without the function being called.
 */

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle utility for API calls
 * 
 * This utility limits the rate at which a function can be called.
 * It ensures the function is called at most once within a specified time period.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Debounced promise wrapper
 * 
 * This creates a debounced version of an async function that returns a promise.
 * It cancels previous pending requests when a new one is made.
 */
export function debouncePromise<T extends (...args: any[]) => Promise<any>>(
  func: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout;
  let latestResolve: ((value: any) => void) | null = null;
  let latestReject: ((reason: any) => void) | null = null;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // Cancel previous timeout
    clearTimeout(timeoutId);

    // Reject previous promise if still pending
    if (latestReject) {
      latestReject(new Error('Debounced: Request cancelled'));
      latestReject = null;
      latestResolve = null;
    }

    return new Promise<ReturnType<T>>((resolve, reject) => {
      latestResolve = resolve;
      latestReject = reject;

      timeoutId = setTimeout(async () => {
        try {
          const result = await func(...args);
          if (latestResolve) {
            latestResolve(result);
          }
        } catch (error) {
          if (latestReject) {
            latestReject(error);
          }
        } finally {
          latestResolve = null;
          latestReject = null;
        }
      }, delay);
    });
  };
}

/**
 * Memoized async function with cache invalidation
 * 
 * This caches the result of an async function and invalidates the cache
 * after a specified time or when manually invalidated.
 */
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  cacheTime: number = 300000 // Default 5 minutes
): {
  (...args: Parameters<T>): Promise<ReturnType<T>>;
  invalidate: (...args: Parameters<T>) => void;
  invalidateAll: () => void;
} {
  const cache = new Map<string, { data: ReturnType<T>; timestamp: number }>();

  const getCacheKey = (args: Parameters<T>): string => {
    return JSON.stringify(args);
  };

  const memoized = async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const key = getCacheKey(args);
    const now = Date.now();
    const cached = cache.get(key);

    // Check if cache is valid
    if (cached && (now - cached.timestamp) < cacheTime) {
      return cached.data;
    }

    // Execute function and cache result
    try {
      const result = await func(...args);
      cache.set(key, { data: result, timestamp: now });
      return result;
    } catch (error) {
      // Don't cache errors
      throw error;
    }
  };

  memoized.invalidate = (...args: Parameters<T>) => {
    const key = getCacheKey(args);
    cache.delete(key);
  };

  memoized.invalidateAll = () => {
    cache.clear();
  };

  return memoized;
}
