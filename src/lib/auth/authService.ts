import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export interface AuthResult {
  userId: string;
  userType: 'clerk';
  email?: string;
}

export class AuthService {
  /**
   * Аутентификация пользователя (только Clerk)
   */
  static async authenticate(request: NextRequest): Promise<AuthResult | null> {
    // Проверяем только Clerk пользователя
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
