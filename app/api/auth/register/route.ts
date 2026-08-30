import { registerUser } from '@/src/services/auth.service';
import {
  successResponse,
  errorResponse,
} from '@/src/lib/api-response';
import { z } from 'zod';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const user = await registerUser(body);

    return successResponse(user, 201);
  } catch (error) {
    console.error('POST /api/auth/register error:', error);

    if (error instanceof z.ZodError) {
      return errorResponse(
        'Validation failed',
        400,
        error.issues
      );
    }

    if (
      error instanceof Error &&
      error.message.includes('already exists')
    ) {
      return errorResponse(
        'User already exists',
        409
      );
    }

    return errorResponse(
      'Failed to register user'
    );
  }
}