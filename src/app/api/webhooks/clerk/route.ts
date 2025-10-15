import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await request.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, username, image_url } = evt.data;

    if (!id) {
      console.error('User ID is missing from webhook data');
      return new Response('User ID is required', { status: 400 });
    }

    try {
      // Check if user exists
      const existingUser = await db.select().from(users).where(eq(users.id, id)).limit(1);

      const userData = {
        id,
        email: email_addresses[0]?.email_address || '',
        firstName: first_name,
        lastName: last_name,
        username: username,
        imageUrl: image_url,
        updatedAt: new Date(),
      };

      if (existingUser.length > 0) {
        // Update existing user
        await db.update(users).set(userData).where(eq(users.id, id));
      } else {
        // Create new user
        await db.insert(users).values({
          ...userData,
          createdAt: new Date(),
        });
      }

      console.log(`User ${eventType}:`, id);
    } catch (error) {
      console.error('Error handling user webhook:', error);
      return new Response('Error processing user', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    if (!id) {
      console.error('User ID is missing from webhook data');
      return new Response('User ID is required', { status: 400 });
    }

    try {
      // Delete user and all related data (cascade will handle sessions and messages)
      await db.delete(users).where(eq(users.id, id));
      console.log('User deleted:', id);
    } catch (error) {
      console.error('Error deleting user:', error);
      return new Response('Error deleting user', { status: 500 });
    }
  }

  return new Response('', { status: 200 });
}
