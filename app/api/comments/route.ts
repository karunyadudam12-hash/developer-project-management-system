import { getComments } from '@/src/repositories/comment.repository';

import {
  successResponse,
  errorResponse,
} from '@/src/lib/api-response';

import { requireAuth } from '@/src/auth/auth.guard';


function getToken(request: Request) {
  return request.headers
    .get('authorization')
    ?.replace('Bearer ', '') ?? null;
}


export async function GET(request: Request) {
  try {
    const token = getToken(request);

    const user = await requireAuth(token);

    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const comments = await getComments();

    return successResponse(comments);

  } catch (error) {
    console.error('GET /api/comments error:', error);

    return errorResponse('Failed to fetch comments');
  }
}