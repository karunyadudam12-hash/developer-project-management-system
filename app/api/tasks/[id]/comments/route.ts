import {
  createComment,
  getCommentsByTaskId,
} from '@/src/repositories/comment.repository';

import { getTaskById } from '@/src/repositories/task.repository';

import {
  successResponse,
  errorResponse,
} from '@/src/lib/api-response';

import { requireAuth } from '@/src/auth/auth.guard';
import { hasPermission } from '@/src/auth/permission.helper';
import { PERMISSIONS } from '@/src/auth/permissions';

import { commentSchema } from '@/src/validations/comment.validation';

import type { Role } from '@/src/auth/roles';
import { createNotification } from '@/src/repositories/notification.repository';
import { logTaskActivity } from '@/src/repositories/activity.repository';

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

    const comments =
      await getCommentsByTaskId(taskId);

    return successResponse(comments);
  } catch (error) {
    console.error(
      'GET /api/tasks/[id]/comments error:',
      error
    );

    return errorResponse(
      'Failed to fetch comments'
    );
  }
}

export async function POST(
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

    if (
      !hasPermission(
        user.role as Role,
        PERMISSIONS.UPDATE_TASK
      )
    ) {
      return errorResponse(
        'Forbidden',
        403
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

    const body =
      await request.json();

    const parsed =
      commentSchema.safeParse({
        ...body,
        taskId,
      });

    if (!parsed.success) {
      return errorResponse(
        'Invalid comment data',
        400
      );
    }

    const comment =
      await createComment({
        content: parsed.data.content,
        taskId,
        authorId: user.id,
      });

    await logTaskActivity({
      actorId: user.id,
      taskId: task.id,
      projectId: task.projectId,
      type: 'COMMENT_ADDED',
      description: `A comment was added to Task "${task.title}"`,
    });

    if (task.assigneeId && task.assigneeId !== user.id) {
      await createNotification({
        userId: task.assigneeId,
        actorId: user.id,
        taskId: task.id,
        projectId: task.projectId,
        type: 'COMMENT',
        message: `A new comment was added to your task "${task.title}"`,
      });
    }

    return successResponse(
      comment,
      201
    );
  } catch (error) {
    console.error(
      'POST /api/tasks/[id]/comments error:',
      error
    );

    return errorResponse(
      'Failed to create comment'
    );
  }
}
