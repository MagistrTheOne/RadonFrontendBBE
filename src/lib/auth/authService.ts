import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export interface AuthResult {
  userId: string;
  userType: 'demo' | 'clerk';
  email?: string;
}

export class AuthService {
  /**
   * Аутентификация пользователя (demo или Clerk)
   */
  static async authenticate(request: NextRequest): Promise<AuthResult | null> {
    // 1. Проверяем demo пользователя
    const demoResult = this.authenticateDemo(request);
    if (demoResult) {
      return demoResult;
    }

    // 2. Проверяем Clerk пользователя
    try {
      const clerkResult = await this.authenticateClerk();
      if (clerkResult) {
        return clerkResult;
      }
    } catch (error) {
      console.error('Clerk authentication failed:', error);
    }

    return null;
  }

  /**
   * Аутентификация demo пользователя
   */
  private static authenticateDemo(request: NextRequest): AuthResult | null {
    const demoUser = request.headers.get('x-demo-user');
    if (!demoUser) {
      return null;
    }

    try {
      const parsedDemoUser = JSON.parse(demoUser);
      return {
        userId: `demo_${parsedDemoUser.id}`,
        userType: 'demo',
        email: parsedDemoUser.email
      };
    } catch (error) {
      console.error('Error parsing demo user:', error);
      return null;
    }
  }

  /**
   * Аутентификация Clerk пользователя
   */
  private static async authenticateClerk(): Promise<AuthResult | null> {
    try {
      const { userId } = await auth();
      if (!userId) {
        return null;
      }

      return {
        userId,
        userType: 'clerk'
      };
    } catch (error) {
      console.error('Clerk auth error:', error);
      return null;
    }
  }

  /**
   * Проверка прав доступа
   */
  static hasAccess(userId: string): boolean {
    // Здесь можно добавить логику проверки прав
    // Например, проверка бана, лимитов и т.д.
    return userId.length > 0;
  }
}
