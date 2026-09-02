import { NextResponse } from 'next/server';
import { logoutUser } from '@/src/services/session.service';

export async function POST(request: Request) {
  try {
    const token = request.headers
      .get('cookie')
      ?.match(/(?:^|;\s*)session_token=([^;]+)/)?.[1];

    if (token) {
      await logoutUser(token);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('POST /api/auth/logout error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to logout',
      },
      { status: 500 }
    );
  }
}
