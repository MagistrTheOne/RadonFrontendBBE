import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Простая демо-авторизация
    const demoUser = {
      id: `demo_${Date.now()}`,
      email,
      name,
      isDemo: true
    };

    return NextResponse.json({
      user: demoUser,
      message: 'Demo login successful'
    });

  } catch (error) {
    console.error('Demo auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
