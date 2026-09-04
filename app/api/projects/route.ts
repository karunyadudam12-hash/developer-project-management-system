import {
  getProjects,
  createProject,
} from '@/src/repositories/project.repository';

import {
  successResponse,
  errorResponse,
} from '@/src/lib/api-response';

import { requireAuth } from '@/src/auth/auth.guard';
import { hasPermission } from '@/src/auth/permission.helper';
import { PERMISSIONS } from '@/src/auth/permissions';
import { projectSchema } from '@/src/validations/project.validation';
import type { Role } from '@/src/auth/roles';

import { logProjectActivity } from '@/src/repositories/activity.repository';

function getToken(request: Request) {
  const authorization =
    request.headers.get('authorization');

  if (authorization) {
    return authorization.replace(
      'Bearer ',
      ''
    );
  }

  const cookieHeader =
    request.headers.get('cookie');

  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader.match(
    /(?:^|;\s*)session_token=([^;]+)/
  );

  return match ? match[1] : null;
}

export async function GET(
  request: Request
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

    const projects =
      await getProjects();

    return successResponse(
      projects
    );
  } catch (error) {
    console.error(
      'GET /api/projects error:',
      error
    );

    return errorResponse(
      'Failed to fetch projects'
    );
  }
}

export async function POST(
  request: Request
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

    if (!hasPermission(user.role as Role, PERMISSIONS.CREATE_PROJECT)) {
      return errorResponse('Forbidden', 403);
    }

    const body =
      await request.json();

    const parsed = projectSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Invalid project data', 400, parsed.error.issues);
    }

    const project =
      await createProject({
        ...parsed.data,
      });

    await logProjectActivity({
      actorId: user.id,
      projectId: project.id,
      type: 'PROJECT_CREATED',
      description:
        `Project "${project.name}" was created`,
    });

    return successResponse(
      project,
      201
    );
  } catch (error) {
    console.error(
      'POST /api/projects error:',
      error
    );

    return errorResponse(
      'Failed to create project'
    );
  }
}