import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

// GET /api/users - Get user by Clerk ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get('clerkId');

    if (!clerkId) {
      return NextResponse.json({ error: 'Clerk ID is required' }, { status: 400 });
    }

    const user = await db.select().from(users).where(eq(users.id, clerkId)).limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/users - Create or update user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, firstName, lastName, username, imageUrl } = body;

    if (!id || !email) {
      return NextResponse.json({ error: 'ID and email are required' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, id)).limit(1);

    if (existingUser.length > 0) {
      // Update existing user
      const updatedUser = await db
        .update(users)
        .set({
          email,
          firstName,
          lastName,
          username,
          imageUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();

      return NextResponse.json(updatedUser[0]);
    } else {
      // Create new user
      const newUser = await db
        .insert(users)
        .values({
          id,
          email,
          firstName,
          lastName,
          username,
          imageUrl,
        })
        .returning();

      return NextResponse.json(newUser[0]);
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
