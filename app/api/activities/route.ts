import {
  createActivity,
  getActivities,
} from '@/src/repositories/activity.repository';

import {
  successResponse,
  errorResponse,
} from '@/src/lib/api-response';

import { requireAuth } from '@/src/auth/auth.guard';
import { activitySchema } from '@/src/validations/activity.validation';

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
  request: Request
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

    const activities =
      await getActivities();

    return successResponse(activities);
  } catch (error) {
    console.error(
      'GET /api/activities error:',
      error
    );

    return errorResponse(
      'Failed to fetch activities'
    );
  }
}

export async function POST(
  request: Request
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

    const body =
      await request.json();

    const parsed =
      activitySchema.safeParse({
        ...body,
        actorId: user.id,
      });

    if (!parsed.success) {
      return errorResponse(
        'Invalid activity data',
        400
      );
    }

    const activity =
      await createActivity({
        actorId: user.id,
        projectId:
          parsed.data.projectId ?? null,
        taskId:
          parsed.data.taskId ?? null,
        type: parsed.data.type,
        description:
          parsed.data.description,
        metadata:
          parsed.data.metadata ?? null,
      });

    return successResponse(
      activity,
      201
    );
  } catch (error) {
    console.error(
      'POST /api/activities error:',
      error
    );

    return errorResponse(
      'Failed to create activity'
    );
  }
}