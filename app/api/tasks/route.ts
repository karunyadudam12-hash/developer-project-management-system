import { getTasks } from '@/src/repositories/task.repository';

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

    const tasks = await getTasks();

    return successResponse(tasks);

  } catch (error) {
    console.error('GET /api/tasks error:', error);

    return errorResponse('Failed to fetch tasks');
  }
}