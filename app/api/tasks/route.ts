import {
  getTasks,
  createTask,
} from '@/src/repositories/task.repository';

import {
  successResponse,
  errorResponse,
} from '@/src/lib/api-response';

import { requireAuth } from '@/src/auth/auth.guard';
import { hasPermission } from '@/src/auth/permission.helper';
import { PERMISSIONS } from '@/src/auth/permissions';

import { taskSchema } from '@/src/validations/task.validation';

import { logTaskActivity } from '@/src/repositories/activity.repository';

import type { Role } from '@/src/auth/roles';

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

export async function GET(request: Request) {
  try {
    const token = getToken(request);

    const user = await requireAuth(token);

    if (!user) {
      return errorResponse(
        'Unauthorized',
        401
      );
    }

    const { searchParams } =
      new URL(request.url);

    const projectIdParam =
      searchParams.get('projectId');

    const assigneeIdParam =
      searchParams.get('assigneeId');

    const searchParam =
      searchParams.get('search');

    const sortByParam =
      searchParams.get('sortBy');

    const sortOrderParam =
      searchParams.get('sortOrder');

    const projectId =
      projectIdParam === null
        ? undefined
        : Number(projectIdParam);

    const assigneeId =
      assigneeIdParam === null
        ? undefined
        : Number(assigneeIdParam);

    const search =
      searchParam === null
        ? undefined
        : searchParam.trim();

    const sortBy =
      sortByParam === null
        ? undefined
        : sortByParam;

    const sortOrder =
      sortOrderParam === null
        ? undefined
        : sortOrderParam;

    if (
      projectId !== undefined &&
      (!Number.isInteger(projectId) ||
        projectId <= 0)
    ) {
      return errorResponse(
        'Valid projectId is required',
        400
      );
    }

    if (
      assigneeId !== undefined &&
      (!Number.isInteger(assigneeId) ||
        assigneeId <= 0)
    ) {
      return errorResponse(
        'Valid assigneeId is required',
        400
      );
    }

    const validSortFields = [
      'title',
      'priority',
      'status',
      'dueDate',
    ] as const;

    const validSortOrders = [
      'asc',
      'desc',
    ] as const;

    if (
      sortBy !== undefined &&
      !validSortFields.includes(
        sortBy as (typeof validSortFields)[number]
      )
    ) {
      return errorResponse(
        'Invalid sortBy value',
        400
      );
    }

    if (
      sortOrder !== undefined &&
      !validSortOrders.includes(
        sortOrder as (typeof validSortOrders)[number]
      )
    ) {
      return errorResponse(
        'Invalid sortOrder value',
        400
      );
    }

    const tasks = await getTasks({
      projectId,
      assigneeId,
      search,
      sortBy:
        sortBy as
          | 'title'
          | 'priority'
          | 'status'
          | 'dueDate'
          | undefined,
      sortOrder:
        sortOrder as
          | 'asc'
          | 'desc'
          | undefined,
    });

    return successResponse(tasks);
  } catch (error) {
    console.error(
      'GET /api/tasks error:',
      error
    );

    return errorResponse(
      'Failed to fetch tasks'
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = getToken(request);

    const user = await requireAuth(token);

    if (!user) {
      return errorResponse(
        'Unauthorized',
        401
      );
    }

    if (
      !hasPermission(
        user.role as Role,
        PERMISSIONS.CREATE_TASK
      )
    ) {
      return errorResponse(
        'Forbidden',
        403
      );
    }

    const body = await request.json();

    const parsed =
      taskSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        'Invalid task data',
        400
      );
    }

    const task =
      await createTask(parsed.data);

    await logTaskActivity({
      actorId: user.id,
      taskId: task.id,
      projectId: task.projectId,
      type: 'TASK_CREATED',
      description:
        `Task "${task.title}" was created`,
    });

    return successResponse(
      task,
      201
    );
  } catch (error) {
    console.error(
      'POST /api/tasks error:',
      error
    );

    return errorResponse(
      'Failed to create task'
    );
  }
}