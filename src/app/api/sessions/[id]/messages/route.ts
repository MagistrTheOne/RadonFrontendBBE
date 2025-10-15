import { NextRequest, NextResponse } from 'next/server';
import { db, messages, chatSessions } from '@/lib/db';
import { eq, desc, and } from 'drizzle-orm';

// GET /api/sessions/[id]/messages - Get messages for a session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const sessionId = resolvedParams.id;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const sessionMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(messages.createdAt);

    return NextResponse.json(sessionMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/sessions/[id]/messages - Add message to session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const sessionId = resolvedParams.id;
    const body = await request.json();
    const { content, role, attachments, reactions, status } = body;

    if (!sessionId || !content || !role) {
      return NextResponse.json({ error: 'Session ID, content and role are required' }, { status: 400 });
    }

    // Verify session exists
    const session = await db.select().from(chatSessions).where(eq(chatSessions.id, sessionId)).limit(1);
    if (session.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Create message
    const newMessage = await db
      .insert(messages)
      .values({
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId,
        content,
        role,
        attachments,
        reactions,
        status,
      })
      .returning();

    // Update session message count and last message
    await db
      .update(chatSessions)
      .set({
        messageCount: session[0].messageCount + 1,
        lastMessage: content.length > 100 ? content.substring(0, 100) + '...' : content,
        updatedAt: new Date(),
      })
      .where(eq(chatSessions.id, sessionId));

    return NextResponse.json(newMessage[0]);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
