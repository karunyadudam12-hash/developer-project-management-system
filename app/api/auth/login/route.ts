import { NextResponse } from 'next/server';
import { loginUser } from '@/src/services/auth.service';
import { createUserSession } from '@/src/services/session.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const user = await loginUser(body);

    const token = await createUserSession(user.id);

    const response = NextResponse.json({
      success: true,
      data: user,
    });

    response.cookies.set('session_token', token.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('POST /api/auth/login error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid email or password',
        message: 'Invalid email or password',
      },
      {
        status: 401,
      }
    );
  }
}