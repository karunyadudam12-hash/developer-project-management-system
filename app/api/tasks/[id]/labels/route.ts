import {
  getTaskById,
} from '@/src/repositories/task.repository';

import {
  getLabelById,
  getTaskLabels,
  getTaskLabel,
  attachLabelToTask,
  removeLabelFromTask,
} from '@/src/repositories/label.repository';

import {
  successResponse,
  errorResponse,
} from '@/src/lib/api-response';

import { requireAuth } from '@/src/auth/auth.guard';
import { hasPermission } from '@/src/auth/permission.helper';
import { PERMISSIONS } from '@/src/auth/permissions';

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

  const sessionCookie = cookieHeader
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

async function getAuthorizedTask(
  request: Request,
  taskId: number
) {
  const token = getToken(request);

  const user = await requireAuth(token);

  if (!user) {
    return {
      error: errorResponse(
        'Unauthorized',
        401
      ),
    };
  }

  if (
    !hasPermission(
      user.role as Role,
      PERMISSIONS.UPDATE_TASK
    )
  ) {
    return {
      error: errorResponse(
        'Forbidden',
        403
      ),
    };
  }

  const task = await getTaskById(taskId);

  if (!task) {
    return {
      error: errorResponse(
        'Task not found',
        404
      ),
    };
  }

  return {
    user,
    task,
  };
}

async function getTaskId(
  context: {
    params: Promise<{ id: string }>;
  }
) {
  const { id } = await context.params;

  const taskId = Number(id);

  if (
    !Number.isInteger(taskId) ||
    taskId <= 0
  ) {
    return null;
  }

  return taskId;
}

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const taskId = await getTaskId(context);

    if (taskId === null) {
      return errorResponse(
        'Invalid task ID',
        400
      );
    }

    const auth =
      await getAuthorizedTask(
        request,
        taskId
      );

    if (auth.error) {
      return auth.error;
    }

    const taskLabels =
      await getTaskLabels(taskId);

    return successResponse(taskLabels);
  } catch (error) {
    console.error(
      'GET /api/tasks/[id]/labels error:',
      error
    );

    return errorResponse(
      'Failed to fetch task labels'
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
    const taskId = await getTaskId(context);

    if (taskId === null) {
      return errorResponse(
        'Invalid task ID',
        400
      );
    }

    const auth =
      await getAuthorizedTask(
        request,
        taskId
      );

    if (auth.error) {
      return auth.error;
    }

    const body = await request.json();

    const labelId = Number(
      body.labelId
    );

    if (
      !Number.isInteger(labelId) ||
      labelId <= 0
    ) {
      return errorResponse(
        'Valid labelId is required',
        400
      );
    }

    const label =
      await getLabelById(labelId);

    if (!label) {
      return errorResponse(
        'Label not found',
        404
      );
    }

    const existing =
      await getTaskLabel(
        taskId,
        labelId
      );

    if (existing) {
      return successResponse(
        existing
      );
    }

    const taskLabel =
      await attachLabelToTask(
        taskId,
        labelId
      );

    return successResponse(
      taskLabel,
      201
    );
  } catch (error) {
    console.error(
      'POST /api/tasks/[id]/labels error:',
      error
    );

    return errorResponse(
      'Failed to attach label'
    );
  }
}

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const taskId = await getTaskId(context);

    if (taskId === null) {
      return errorResponse(
        'Invalid task ID',
        400
      );
    }

    const auth =
      await getAuthorizedTask(
        request,
        taskId
      );

    if (auth.error) {
      return auth.error;
    }

    const { searchParams } =
      new URL(request.url);

    const labelId = Number(
      searchParams.get('labelId')
    );

    if (
      !Number.isInteger(labelId) ||
      labelId <= 0
    ) {
      return errorResponse(
        'Valid labelId is required',
        400
      );
    }

    const deleted =
      await removeLabelFromTask(
        taskId,
        labelId
      );

    if (!deleted) {
      return errorResponse(
        'Task label not found',
        404
      );
    }

    return successResponse({
      message:
        'Label removed from task successfully',
      taskLabel: deleted,
    });
  } catch (error) {
    console.error(
      'DELETE /api/tasks/[id]/labels error:',
      error
    );

    return errorResponse(
      'Failed to remove label'
    );
  }
}