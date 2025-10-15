import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, chatSessions } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

// GET /api/sessions/[id] - Get a specific session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const session = await db
      .select()
      .from(chatSessions)
      .where(
        and(
          eq(chatSessions.id, resolvedParams.id),
          eq(chatSessions.userId, userId)
        )
      )
      .limit(1);

    if (session.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const sessionData = session[0];
    return NextResponse.json({
      ...sessionData,
      messages: sessionData.messagesJson,
      createdAt: sessionData.createdAt.toISOString(),
      updatedAt: sessionData.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/sessions/[id] - Update a session (save messages)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const body = await request.json();
    const { messages, title } = body;

    // Validate messages format
    if (messages && !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages must be an array' },
        { status: 400 }
      );
    }

    // Check if session exists and belongs to user
    const existingSession = await db
      .select()
      .from(chatSessions)
      .where(
        and(
          eq(chatSessions.id, resolvedParams.id),
          eq(chatSessions.userId, userId)
        )
      )
      .limit(1);

    if (existingSession.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (messages) {
      updateData.messagesJson = messages;
    }

    if (title && typeof title === 'string') {
      updateData.title = title.trim();
    }

    // Update the session
    await db
      .update(chatSessions)
      .set(updateData)
      .where(
        and(
          eq(chatSessions.id, resolvedParams.id),
          eq(chatSessions.userId, userId)
        )
      );

    // Return updated session
    const updatedSession = await db
      .select()
      .from(chatSessions)
      .where(
        and(
          eq(chatSessions.id, resolvedParams.id),
          eq(chatSessions.userId, userId)
        )
      )
      .limit(1);

    const sessionData = updatedSession[0];
    return NextResponse.json({
      ...sessionData,
      messages: sessionData.messagesJson,
      createdAt: sessionData.createdAt.toISOString(),
      updatedAt: sessionData.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/sessions/[id] - Delete a session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;

    // Check if session exists and belongs to user
    const existingSession = await db
      .select()
      .from(chatSessions)
      .where(
        and(
          eq(chatSessions.id, resolvedParams.id),
          eq(chatSessions.userId, userId)
        )
      )
      .limit(1);

    if (existingSession.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Delete the session
    await db
      .delete(chatSessions)
      .where(
        and(
          eq(chatSessions.id, resolvedParams.id),
          eq(chatSessions.userId, userId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
