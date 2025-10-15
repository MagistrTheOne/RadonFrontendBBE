import { NextRequest, NextResponse } from 'next/server';
import { db, chatSessions, messages } from '@/lib/db';
import { eq, desc, and } from 'drizzle-orm';

// GET /api/sessions - Get user's chat sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') || 'active';

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const sessions = await db
      .select()
      .from(chatSessions)
      .where(and(eq(chatSessions.userId, userId), eq(chatSessions.status, status)))
      .orderBy(desc(chatSessions.updatedAt));

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/sessions - Create new chat session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title = 'Новый чат' } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const newSession = await db
      .insert(chatSessions)
      .values({
        id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        title,
        status: 'active',
        messageCount: 0,
      })
      .returning();

    return NextResponse.json(newSession[0]);
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}