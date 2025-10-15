import { NextRequest, NextResponse } from 'next/server';
import { sendToRadonAI } from '@/lib/api/radon-ai';
import { AuthService } from '@/lib/auth/authService';
import { ApiErrorHandler } from '@/lib/api/errorHandler';
import { ChatRequest } from '@/types/chat';

export async function POST(request: NextRequest) {
  try {
    // Аутентификация пользователя
    const authResult = await AuthService.authenticate(request);
    
    if (!authResult) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Проверка прав доступа
    if (!AuthService.hasAccess(authResult.userId)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Parse request body with error handling
    const body = await ApiErrorHandler.safeJsonParse(request);
    
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // TODO: Implement rate limiting with Redis
    // const rateLimitKey = `rate_limit_${authResult.userId}`;
    
    // Отправляем запрос к Radon AI
    const response = await sendToRadonAI(body);

    // Note: Messages are saved to database when session is completed
    // This happens via the frontend calling saveSession() in Zustand store
    // or when the user navigates away from the chat

    return NextResponse.json(response);

  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
