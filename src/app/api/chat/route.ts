import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sendToGigaChat, sendToGigaChatMock } from '@/lib/api/gigachat';
import { ChatRequest } from '@/types/chat';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: ChatRequest = await request.json();
    
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Rate limiting (simple implementation)
    const rateLimitKey = `rate_limit_${userId}`;
    // In production, you'd use Redis or similar for rate limiting
    
    // Send to GigaChat API
    let response;
    
    // Use mock for development if no client credentials are configured
    if (!process.env.GIGACHAT_CLIENT_ID || !process.env.GIGACHAT_CLIENT_SECRET) {
      console.log('Using mock GigaChat API (no client credentials configured)');
      response = await sendToGigaChatMock(body);
    } else {
      console.log('Using real GigaChat API');
      response = await sendToGigaChat(body);
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Извините, произошла ошибка. Попробуйте еще раз.'
      },
      { status: 500 }
    );
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
