import {
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  updateTaskStatus,
  updateTaskPriority,
} from '@/src/repositories/task.repository';

import {
  successResponse,
  errorResponse,
} from '@/src/lib/api-response';

import { requireAuth } from '@/src/auth/auth.guard';
import { hasPermission } from '@/src/auth/permission.helper';
import { PERMISSIONS } from '@/src/auth/permissions';

import { taskSchema } from '@/src/validations/task.validation';

import { getProjectMember } from '@/src/repositories/project-member.repository';

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

    return successResponse(task);
  } catch (error) {
    console.error(
      'GET /api/tasks/[id] error:',
      error
    );

    return errorResponse(
      'Failed to fetch task'
    );
  }
}

export async function PUT(
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

    const existingTask =
      await getTaskById(taskId);

    if (!existingTask) {
      return errorResponse(
        'Task not found',
        404
      );
    }

    const body =
      await request.json();

    const parsed =
      taskSchema
        .partial()
        .safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        'Invalid task data',
        400
      );
    }

    const updatedTask =
      await updateTask(
        taskId,
        parsed.data
      );

    if (!updatedTask) {
      return errorResponse(
        'Task not found',
        404
      );
    }

    await logTaskActivity({
      actorId: user.id,
      taskId,
      projectId:
        updatedTask.projectId,
      type: 'TASK_UPDATED',
      description:
        `Task "${updatedTask.title}" was updated`,
    });

    return successResponse(
      updatedTask
    );
  } catch (error) {
    console.error(
      'PUT /api/tasks/[id] error:',
      error
    );

    return errorResponse(
      'Failed to update task'
    );
  }
}

export async function PATCH(
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

    const existingTask =
      await getTaskById(taskId);

    if (!existingTask) {
      return errorResponse(
        'Task not found',
        404
      );
    }

    const body =
      await request.json();

    /*
     * STATUS UPDATE
     */
    if (
      Object.prototype.hasOwnProperty.call(
        body,
        'status'
      )
    ) {
      const parsedStatus =
        taskSchema
          .pick({ status: true })
          .safeParse({
            status: body.status,
          });

      if (!parsedStatus.success) {
        return errorResponse(
          'Invalid task status',
          400
        );
      }

      const updatedTask =
        await updateTaskStatus(
          taskId,
          parsedStatus.data.status
        );

      if (!updatedTask) {
        return errorResponse(
          'Task not found',
          404
        );
      }

      await logTaskActivity({
        actorId: user.id,
        taskId,
        projectId:
          existingTask.projectId,
        type: 'STATUS_CHANGED',
        description:
          `Task "${existingTask.title}" status changed`,
        metadata: JSON.stringify({
          oldStatus:
            existingTask.status,
          newStatus:
            parsedStatus.data.status,
        }),
      });

      return successResponse(
        updatedTask
      );
    }

    /*
     * PRIORITY UPDATE
     */
    if (
      Object.prototype.hasOwnProperty.call(
        body,
        'priority'
      )
    ) {
      const parsedPriority =
        taskSchema
          .pick({ priority: true })
          .safeParse({
            priority: body.priority,
          });

      if (!parsedPriority.success) {
        return errorResponse(
          'Invalid task priority',
          400
        );
      }

      const updatedTask =
        await updateTaskPriority(
          taskId,
          parsedPriority.data.priority
        );

      if (!updatedTask) {
        return errorResponse(
          'Task not found',
          404
        );
      }

      await logTaskActivity({
        actorId: user.id,
        taskId,
        projectId:
          existingTask.projectId,
        type: 'PRIORITY_CHANGED',
        description:
          `Task "${existingTask.title}" priority changed`,
        metadata: JSON.stringify({
          oldPriority:
            existingTask.priority,
          newPriority:
            parsedPriority.data.priority,
        }),
      });

      return successResponse(
        updatedTask
      );
    }

    /*
     * ASSIGNMENT UPDATE
     */
    if (
      !Object.prototype.hasOwnProperty.call(
        body,
        'assigneeId'
      )
    ) {
      return errorResponse(
        'Status, priority, or assigneeId is required',
        400
      );
    }

    const assigneeId =
      body.assigneeId === null
        ? null
        : Number(body.assigneeId);

    if (
      assigneeId !== null &&
      (!Number.isInteger(assigneeId) ||
        assigneeId <= 0)
    ) {
      return errorResponse(
        'Valid assigneeId is required',
        400
      );
    }

    if (assigneeId !== null) {
      const projectMember =
        await getProjectMember(
          existingTask.projectId,
          assigneeId
        );

      if (!projectMember) {
        return errorResponse(
          'Assignee must be a member of the task project',
          400
        );
      }
    }

    const updatedTask =
      await assignTask(
        taskId,
        assigneeId
      );

    if (!updatedTask) {
      return errorResponse(
        'Task not found',
        404
      );
    }

    await logTaskActivity({
      actorId: user.id,
      taskId,
      projectId:
        existingTask.projectId,
      type: 'ASSIGNED',
      description:
        `Task "${existingTask.title}" assignment changed`,
      metadata: JSON.stringify({
        oldAssigneeId:
          existingTask.assigneeId,
        newAssigneeId:
          assigneeId,
      }),
    });

    return successResponse(
      updatedTask
    );
  } catch (error) {
    console.error(
      'PATCH /api/tasks/[id] error:',
      error
    );

    return errorResponse(
      'Failed to update task'
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
        PERMISSIONS.DELETE_TASK
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

    const existingTask =
      await getTaskById(taskId);

    if (!existingTask) {
      return errorResponse(
        'Task not found',
        404
      );
    }

    const deletedTask =
      await deleteTask(taskId);

    if (!deletedTask) {
      return errorResponse(
        'Task not found',
        404
      );
    }

    return successResponse({
      message:
        'Task deleted successfully',
      task: deletedTask,
    });
  } catch (error) {
    console.error(
      'DELETE /api/tasks/[id] error:',
      error
    );

    return errorResponse(
      'Failed to delete task'
    );
  }
}