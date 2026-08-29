import { getComments } from '@/src/repositories/comment.repository';
import {
  successResponse,
  errorResponse,
} from '@/src/lib/api-response';

export async function GET() {
  try {
    const comments = await getComments();

    return successResponse(comments);
  } catch (error) {
    console.error('GET /api/comments error:', error);

    return errorResponse('Failed to fetch comments');
  }
}