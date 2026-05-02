/**
 * Frontend Cache Service for eCourts API
 * 
 * This service provides client-side caching for eCourts API responses
 * to reduce API calls and improve performance.
 */

// Cache storage using localStorage
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class CacheService {
  private readonly prefix = 'ecourts_cache_';
  
  // Cache durations (in milliseconds)
  private readonly durations = {
    case_by_cnr: 24 * 60 * 60 * 1000,      // 24 hours
    search_cases: 6 * 60 * 60 * 1000,       // 6 hours
    cause_list: 2 * 60 * 60 * 1000,        // 2 hours
    status: 24 * 60 * 60 * 1000,           // 24 hours
  };

  /**
   * Generate cache key for API calls
   */
  private getKey(method: string, params?: Record<string, any>): string {
    const paramsStr = params ? JSON.stringify(params, Object.keys(params).sort()) : '';
    const keyData = `${method}_${paramsStr}`;
    return `${this.prefix}${btoa(keyData).replace(/[^a-zA-Z0-9]/g, '')}`;
  }

  /**
   * Get cached data
   */
  get<T>(method: string, params?: Record<string, any>): T | null {
    // Check if localStorage is available (SSR check)
    if (typeof localStorage === 'undefined') {
      return null;
    }
    
    try {
      const key = this.getKey(method, params);
      const cached = localStorage.getItem(key);
      
      if (!cached) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is expired
      if (now > entry.expiry) {
        localStorage.removeItem(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set data in cache
   */
  set<T>(method: string, data: T, params?: Record<string, any>): void {
    // Check if localStorage is available (SSR check)
    if (typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      const key = this.getKey(method, params);
      const duration = this.durations[method as keyof typeof this.durations] || 3600000; // Default 1 hour
      const now = Date.now();

      const entry: CacheEntry<T> = {
        data,
        timestamp: now,
        expiry: now + duration,
      };

      localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.warn('Cache set error:', error);
    }
  }

  /**
   * Clear specific cache entry
   */
  clear(method: string, params?: Record<string, any>): void {
    // Check if localStorage is available (SSR check)
    if (typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      const key = this.getKey(method, params);
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }

  /**
   * Clear all eCourts cache
   */
  clearAll(): void {
    // Check if localStorage is available (SSR check)
    if (typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Cache clear all error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { total: number; expired: number; entries: Array<{ key: string; size: number; age: number }> } {
    // Check if localStorage is available (SSR check)
    if (typeof localStorage === 'undefined') {
      return { total: 0, expired: 0, entries: [] };
    }
    
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
      const now = Date.now();
      let expired = 0;
      const entries: Array<{ key: string; size: number; age: number }> = [];

      keys.forEach(key => {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const entry: CacheEntry<any> = JSON.parse(cached);
            const age = now - entry.timestamp;
            const isExpired = now > entry.expiry;
            
            if (isExpired) {
              expired++;
            }

            entries.push({
              key: key.replace(this.prefix, ''),
              size: cached.length,
              age,
            });
          }
        } catch (error) {
          // Skip invalid entries
        }
      });

      return {
        total: keys.length,
        expired,
        entries,
      };
    } catch (error) {
      console.warn('Cache stats error:', error);
      return { total: 0, expired: 0, entries: [] };
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    // Check if localStorage is available (SSR check)
    if (typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
      const now = Date.now();

      keys.forEach(key => {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const entry: CacheEntry<any> = JSON.parse(cached);
            if (now > entry.expiry) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // Remove invalid entries
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Cache cleanup error:', error);
    }
  }
}

// Singleton instance
export const cacheService = new CacheService();

// Auto-cleanup expired entries on initialization
setTimeout(() => cacheService.cleanup(), 1000);
