import { getActivitiesByProjectId } from '@/src/repositories/activity.repository';

import {
  successResponse,
  errorResponse,
} from '@/src/lib/api-response';

import { requireAuth } from '@/src/auth/auth.guard';

import { getProjectById } from '@/src/repositories/project.repository';

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
    const projectId = Number(id);

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
      await getProjectById(projectId);

    if (!project) {
      return errorResponse(
        'Project not found',
        404
      );
    }

    const activities =
      await getActivitiesByProjectId(
        projectId
      );

    return successResponse(activities);
  } catch (error) {
    console.error(
      'GET /api/projects/[id]/activities error:',
      error
    );

    return errorResponse(
      'Failed to fetch project activities'
    );
  }
}