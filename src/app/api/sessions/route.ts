import { NextRequest, NextResponse } from 'next/server';
import { db, chatSessions, messages } from '@/lib/db';
import { eq, desc, and, sql } from 'drizzle-orm';

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
    const { userId = 'demo-user', title = 'Новый чат' } = body;

    console.log('Creating session for user:', userId, 'with title:', title);

    // Проверяем, существует ли пользователь, если нет - создаем
    const existingUser = await db.execute(sql`
      SELECT id FROM users WHERE id = ${userId}
    `);
    
    if (existingUser.rows.length === 0) {
      console.log('User does not exist, creating user:', userId);
      const now = new Date().toISOString();
      await db.execute(sql`
        INSERT INTO users (id, email, first_name, created_at, updated_at)
        VALUES (${userId}, ${userId + '@demo.com'}, ${userId}, ${now}, ${now})
        ON CONFLICT (id) DO NOTHING
      `);
    }

    const now = new Date();
    const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Используем raw SQL для создания сессии
    const result = await db.execute(sql`
      INSERT INTO chat_sessions (id, user_id, title, status, message_count, created_at, updated_at)
      VALUES (${sessionId}, ${userId}, ${title}, 'active', 0, ${now.toISOString()}, ${now.toISOString()})
      RETURNING *
    `);
    
    const newSession = result.rows[0];

    console.log('Session created successfully:', newSession);
    
    // Преобразуем результат в правильный формат
    const formattedSession = {
      id: newSession.id,
      userId: newSession.user_id,
      title: newSession.title,
      status: newSession.status,
      messageCount: newSession.message_count,
      lastMessage: newSession.last_message,
      timestamp: newSession.created_at,
    };
    
    return NextResponse.json(formattedSession);
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}