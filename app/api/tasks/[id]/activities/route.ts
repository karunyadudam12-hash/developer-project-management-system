import { getActivitiesByTaskId } from '@/src/repositories/activity.repository';
import { getTaskById } from '@/src/repositories/task.repository';

import {
  successResponse,
  errorResponse,
} from '@/src/lib/api-response';

import { requireAuth } from '@/src/auth/auth.guard';

function getToken(request: Request) {
  const authorization =
    request.headers.get('authorization');

  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice(7).trim();
  }

  const cookieHeader =
    request.headers.get('cookie');

  if (!cookieHeader) {
    return null;
  }

  const sessionCookie =
    cookieHeader
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) =>
        cookie.startsWith('session_token=')
      );

  if (!sessionCookie) {
    return null;
  }

  return decodeURIComponent(
    sessionCookie.slice(
      'session_token='.length
    )
  );
}

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const token = getToken(request);
    const user = await requireAuth(token);

    if (!user) {
      return errorResponse(
        'Unauthorized',
        401
      );
    }

    const { id } = await context.params;
    const taskId = Number(id);

    if (
      !Number.isInteger(taskId) ||
      taskId <= 0
    ) {
      return errorResponse(
        'Invalid task ID',
        400
      );
    }

    const task =
      await getTaskById(taskId);

    if (!task) {
      return errorResponse(
        'Task not found',
        404
      );
    }

    const activities =
      await getActivitiesByTaskId(taskId);

    return successResponse(activities);
  } catch (error) {
    console.error(
      'GET /api/tasks/[id]/activities error:',
      error
    );

    return errorResponse(
      'Failed to fetch task activities'
    );
  }
}