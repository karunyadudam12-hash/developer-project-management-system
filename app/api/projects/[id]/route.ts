import {
  deleteProject,
  getProjectById,
  updateProject,
} from '@/src/repositories/project.repository';

import {
  getTasks,
} from '@/src/repositories/task.repository';

import {
  successResponse,
  errorResponse,
} from '@/src/lib/api-response';

import { requireAuth } from '@/src/auth/auth.guard';
import { hasPermission } from '@/src/auth/permission.helper';
import { PERMISSIONS } from '@/src/auth/permissions';

import { logProjectActivity } from '@/src/repositories/activity.repository';

import type { Role } from '@/src/auth/roles';

import { getProjectMember } from '@/src/repositories/project-member.repository';

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
        cookie.startsWith(
          'session_token='
        )
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
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const token =
      getToken(request);

    const user =
      await requireAuth(token);

    if (!user) {
      return errorResponse(
        'Unauthorized',
        401
      );
    }

    const { id } =
      await params;

    const projectId =
      Number(id);

    if (
      !Number.isInteger(projectId) ||
      projectId <= 0
    ) {
      return errorResponse(
        'Invalid project ID',
        400
      );
    }

    const project =
      await getProjectById(
        projectId
      );

    if (!project) {
      return errorResponse(
        'Project not found',
        404
      );
    }

    if (user.role === 'STAFF') {
  const projectMember = await getProjectMember(
    projectId,
    user.id
  );

  if (!projectMember) {
    return errorResponse('Forbidden', 403);
  }
}


    const tasks =
      await getTasks({
        projectId,
      });

    return successResponse({
      project,
      tasks,
    });
  } catch (error) {
    console.error(
      'GET /api/projects/[id] error:',
      error
    );

    return errorResponse(
      'Failed to fetch project'
    );
  }
}

export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const token =
      getToken(request);

    const user =
      await requireAuth(token);

    if (!user) {
      return errorResponse(
        'Unauthorized',
        401
      );
    }

    if (
      !hasPermission(
        user.role as Role,
        PERMISSIONS.UPDATE_PROJECT
      )
    ) {
      return errorResponse(
        'Forbidden',
        403
      );
    }

    const { id } =
      await params;

    const projectId =
      Number(id);

    if (
      !Number.isInteger(projectId) ||
      projectId <= 0
    ) {
      return errorResponse(
        'Invalid project ID',
        400
      );
    }

    const existingProject =
      await getProjectById(
        projectId
      );

    if (!existingProject) {
      return errorResponse(
        'Project not found',
        404
      );
    }

    const body =
      await request.json();

    const name =
      typeof body.name === 'string'
        ? body.name.trim()
        : undefined;

    const description =
      typeof body.description === 'string'
        ? body.description.trim()
        : undefined;

    const status =
      typeof body.status === 'string'
        ? body.status.trim()
        : undefined;

    const allowedStatuses = [
      'ACTIVE',
      'COMPLETED',
      'ARCHIVED',
    ] as const;

    if (
      status !== undefined &&
      !allowedStatuses.includes(
        status as
          (typeof allowedStatuses)[number]
      )
    ) {
      return errorResponse(
        'Invalid project status',
        400
      );
    }

    if (
      name !== undefined &&
      name.length === 0
    ) {
      return errorResponse(
        'Project name cannot be empty',
        400
      );
    }

    if (
      name === undefined &&
      description === undefined &&
      status === undefined
    ) {
      return errorResponse(
        'No fields to update',
        400
      );
    }

    const project =
      await updateProject(
        projectId,
        {
          ...(name !== undefined && {
            name,
          }),
          ...(description !== undefined && {
            description,
          }),
          ...(status !== undefined && {
            status,
          }),
        }
      );

    if (!project) {
      return errorResponse(
        'Project not found',
        404
      );
    }

    const activityType =
      status !== undefined &&
      status !== existingProject.status
        ? 'PROJECT_STATUS_CHANGED'
        : 'PROJECT_UPDATED';

    const descriptionText =
      activityType ===
      'PROJECT_STATUS_CHANGED'
        ? `Project "${project.name}" status changed`
        : `Project "${project.name}" was updated`;

    await logProjectActivity({
      actorId: user.id,
      projectId: project.id,
      type: activityType,
      description: descriptionText,
      metadata:
        activityType ===
        'PROJECT_STATUS_CHANGED'
          ? JSON.stringify({
              oldStatus:
                existingProject.status,
              newStatus:
                project.status,
            })
          : null,
    });

    return successResponse(
      project
    );
  } catch (error) {
    console.error(
      'PUT /api/projects/[id] error:',
      error
    );

    return errorResponse(
      'Failed to update project'
    );
  }
}

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const token =
      getToken(request);

    const user =
      await requireAuth(token);

    if (!user) {
      return errorResponse(
        'Unauthorized',
        401
      );
    }

    if (
      !hasPermission(
        user.role as Role,
        PERMISSIONS.DELETE_PROJECT
      )
    ) {
      return errorResponse(
        'Forbidden',
        403
      );
    }

    const { id } =
      await params;

    const projectId =
      Number(id);

    if (
      !Number.isInteger(projectId) ||
      projectId <= 0
    ) {
      return errorResponse(
        'Invalid project ID',
        400
      );
    }

    const project =
      await getProjectById(
        projectId
      );

    if (!project) {
      return errorResponse(
        'Project not found',
        404
      );
    }

    const deletedProject =
      await deleteProject(
        projectId
      );

    if (!deletedProject) {
      return errorResponse(
        'Project not found',
        404
      );
    }

    return successResponse({
      message:
        'Project deleted successfully',
      project: deletedProject,
    });
  } catch (error) {
    console.error(
      'DELETE /api/projects/[id] error:',
      error
    );

    if (
      error instanceof Error &&
      error.message ===
        'Project cannot be deleted while it has members or tasks'
    ) {
      return errorResponse(
        'Remove the project tasks and members before deleting this project.',
        409
      );
    }

    return errorResponse('Failed to delete project');
  }
}
