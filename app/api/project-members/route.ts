import {
  getProjectMember,
  getProjectMembersByProjectId,
  createProjectMember,
  deleteProjectMember,
} from '@/src/repositories/project-member.repository';

import {
  successResponse,
  errorResponse,
} from '@/src/lib/api-response';

import { requireAuth } from '@/src/auth/auth.guard';
import { hasPermission } from '@/src/auth/permission.helper';
import { PERMISSIONS } from '@/src/auth/permissions';

import type { Role } from '@/src/auth/roles';

function getToken(request: Request) {
  const authorization = request.headers.get('authorization');

  if (authorization) {
    return authorization.replace('Bearer ', '');
  }

  const cookieHeader = request.headers.get('cookie');

  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader.match(
    /(?:^|;\s*)session_token=([^;]+)/
  );

  return match ? match[1] : null;
}

export async function GET(request: Request) {
  try {
    const token = getToken(request);
    const user = await requireAuth(token);

    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);

    const projectId = Number(
      searchParams.get('projectId')
    );

    if (!Number.isInteger(projectId) || projectId <= 0) {
      return errorResponse(
        'Valid projectId is required',
        400
      );
    }

    const projectMembers =
      await getProjectMembersByProjectId(projectId);

    return successResponse(projectMembers);
  } catch (error) {
    console.error(
      'GET /api/project-members error:',
      error
    );

    return errorResponse(
      'Failed to fetch project members'
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = getToken(request);
    const user = await requireAuth(token);

    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    if (
      !hasPermission(
        user.role as Role,
        PERMISSIONS.MANAGE_MEMBERS
      )
    ) {
      return errorResponse('Forbidden', 403);
    }

    const body = await request.json();

    const projectId = Number(body.projectId);
    const userId = Number(body.userId);

    if (
      !Number.isInteger(projectId) ||
      projectId <= 0 ||
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return errorResponse(
        'Valid projectId and userId are required',
        400
      );
    }

    const existingMember = await getProjectMember(
      projectId,
      userId
    );

    if (existingMember) {
      return errorResponse(
        'User is already a project member',
        409
      );
    }

    const member = await createProjectMember({
      projectId,
      userId,
    });

    return successResponse(member, 201);
  } catch (error) {
    console.error(
      'POST /api/project-members error:',
      error
    );

    return errorResponse(
      'Failed to add project member'
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const token = getToken(request);
    const user = await requireAuth(token);

    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    if (
      !hasPermission(
        user.role as Role,
        PERMISSIONS.MANAGE_MEMBERS
      )
    ) {
      return errorResponse('Forbidden', 403);
    }

    const { searchParams } = new URL(request.url);

    const projectId = Number(
      searchParams.get('projectId')
    );

    const userId = Number(
      searchParams.get('userId')
    );

    if (
      !Number.isInteger(projectId) ||
      projectId <= 0 ||
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return errorResponse(
        'Valid projectId and userId are required',
        400
      );
    }

    const member = await getProjectMember(
      projectId,
      userId
    );

    if (!member) {
      return errorResponse(
        'Project member not found',
        404
      );
    }

    const deletedMember = await deleteProjectMember(
      projectId,
      userId
    );

    if (!deletedMember) {
      return errorResponse(
        'Project member not found',
        404
      );
    }

    return successResponse({
      message: 'Project member removed successfully',
      member: deletedMember,
    });
  } catch (error) {
    console.error(
      'DELETE /api/project-members error:',
      error
    );

    return errorResponse(
      'Failed to remove project member'
    );
  }
}
