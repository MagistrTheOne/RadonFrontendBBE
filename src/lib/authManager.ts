// Менеджер авторизации для гибридной системы
// Пока не интегрирован в основную логику

export interface AuthConfig {
  jwtSecret: string;
  tokenExpiry: number;
  refreshThreshold: number;
}

export interface AuthToken {
  userId: string;
  exp: number;
  iat: number;
  model?: string;
}

export class AuthManager {
  private config: AuthConfig;

  constructor(config: Partial<AuthConfig> = {}) {
    this.config = {
      jwtSecret: process.env.FASTAPI_JWT_SECRET || 'default-secret',
      tokenExpiry: 300, // 5 минут
      refreshThreshold: 60, // 1 минута до истечения
      ...config
    };
  }

  generateToken(userId: string, model?: string): string {
    const now = Math.floor(Date.now() / 1000);
    
    const payload: AuthToken = {
      userId,
      exp: now + this.config.tokenExpiry,
      iat: now,
      model
    };

    return this.signToken(payload);
  }

  verifyToken(token: string): AuthToken | null {
    try {
      const payload = this.verifyTokenSignature(token);
      
      if (this.isTokenExpired(payload)) {
        return null;
      }

      return payload;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  refreshTokenIfNeeded(token: string, userId: string): string | null {
    const payload = this.verifyToken(token);
    
    if (!payload) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = payload.exp - now;

    if (timeUntilExpiry < this.config.refreshThreshold) {
      return this.generateToken(userId, payload.model);
    }

    return token;
  }

  private signToken(payload: AuthToken): string {
    // В реальной реализации используйте библиотеку JWT
    // Здесь упрощенная версия для демонстрации
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    
    const signature = this.createSignature(encodedHeader, encodedPayload);
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private verifyTokenSignature(token: string): AuthToken {
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const [header, payload, signature] = parts;
    
    // Проверяем подпись
    const expectedSignature = this.createSignature(header, payload);
    if (signature !== expectedSignature) {
      throw new Error('Invalid signature');
    }

    const decodedPayload = JSON.parse(this.base64UrlDecode(payload));
    return decodedPayload;
  }

  private createSignature(header: string, payload: string): string {
    // Упрощенная реализация HMAC-SHA256
    // В реальной реализации используйте crypto.createHmac
    const data = `${header}.${payload}`;
    const hash = this.simpleHash(data + this.config.jwtSecret);
    return this.base64UrlEncode(hash);
  }

  private isTokenExpired(payload: AuthToken): boolean {
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  }

  private base64UrlEncode(str: string): string {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private base64UrlDecode(str: string): string {
    // Добавляем padding если нужно
    const padded = str + '='.repeat((4 - str.length % 4) % 4);
    return atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  }

  private simpleHash(str: string): string {
    // Упрощенная хеш-функция для демонстрации
    // В реальной реализации используйте crypto.createHash
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }
}

// Utility functions for CORS
export class CorsManager {
  static getCorsHeaders(origin?: string): Record<string, string> {
    const allowedOrigins = [
      'https://your-app.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001'
    ];

    const isAllowedOrigin = !origin || allowedOrigins.includes(origin);

    return {
      'Access-Control-Allow-Origin': isAllowedOrigin ? origin || '*' : 'null',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400'
    };
  }

  static handlePreflightRequest(): Response {
    return new Response(null, {
      status: 200,
      headers: CorsManager.getCorsHeaders()
    });
  }
}

// Singleton instances
export const authManager = new AuthManager();
export const corsManager = new CorsManager();
