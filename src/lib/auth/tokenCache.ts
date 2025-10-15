/**
 * Кэш для OAuth токенов
 */

interface TokenCacheEntry {
  token: string;
  expiresAt: number;
}

class TokenCache {
  private cache = new Map<string, TokenCacheEntry>();
  private readonly TOKEN_BUFFER_TIME = 5 * 60 * 1000; // 5 минут буфера

  /**
   * Получить токен из кэша
   */
  get(key: string): string | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Проверяем, не истек ли токен
    if (Date.now() >= entry.expiresAt - this.TOKEN_BUFFER_TIME) {
      this.cache.delete(key);
      return null;
    }

    return entry.token;
  }

  /**
   * Сохранить токен в кэш
   */
  set(key: string, token: string, expiresInSeconds: number): void {
    const expiresAt = Date.now() + (expiresInSeconds * 1000);
    
    this.cache.set(key, {
      token,
      expiresAt
    });
  }

  /**
   * Удалить токен из кэша
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Очистить весь кэш
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Получить размер кэша
   */
  size(): number {
    return this.cache.size;
  }
}

// Singleton instance
export const tokenCache = new TokenCache();
