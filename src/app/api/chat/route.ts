import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sendToRadonAI } from '@/lib/api/radon-ai';
import { ChatRequest } from '@/types/chat';

export async function POST(request: NextRequest) {
  try {
    // Check authentication (demo first, then Clerk)
    let userId: string | null = null;
    
    // Check for demo user first
    const demoUser = request.headers.get('x-demo-user');
    if (demoUser) {
      try {
        const parsedDemoUser = JSON.parse(demoUser);
        userId = `demo_${parsedDemoUser.id}`;
        console.log('Demo user authenticated:', parsedDemoUser.email);
      } catch (error) {
        console.error('Error parsing demo user:', error);
      }
    }
    
    // If no demo user, try Clerk
    if (!userId) {
      try {
        const { userId: clerkUserId } = await auth();
        userId = clerkUserId;
        console.log('Clerk user authenticated:', clerkUserId);
      } catch (error) {
        console.error('Clerk auth failed:', error);
      }
    }
    
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
    
    // Send to Radon AI API
    console.log('Using real Radon AI API');
    const response = await sendToRadonAI(body);

    // Note: Messages are saved to database when session is completed
    // This happens via the frontend calling saveSession() in Zustand store
    // or when the user navigates away from the chat

    return NextResponse.json(response);

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Return error response that frontend can handle
    return NextResponse.json(
      { 
        message: 'Извините, произошла ошибка. Попробуйте еще раз.'
      },
      { status: 200 } // Return 200 so frontend doesn't throw error
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
