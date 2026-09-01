import {
  createNotification,
  getNotificationsByUserId,
} from '@/src/repositories/notification.repository';

import {
  successResponse,
  errorResponse,
} from '@/src/lib/api-response';

import { requireAuth } from '@/src/auth/auth.guard';

import { notificationSchema } from '@/src/validations/notification.validation';

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

    const user =
      await requireAuth(token);

    if (!user) {
      return errorResponse(
        'Unauthorized',
        401
      );
    }

    const notifications =
      await getNotificationsByUserId(
        user.id
      );

    return successResponse(
      notifications
    );
  } catch (error) {
    console.error(
      'GET /api/notifications error:',
      error
    );

    return errorResponse(
      'Failed to fetch notifications'
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    const token = getToken(request);

    const user =
      await requireAuth(token);

    if (!user) {
      return errorResponse(
        'Unauthorized',
        401
      );
    }

    const body =
      await request.json();

    const parsed =
      notificationSchema.safeParse({
        ...body,
        userId: body.userId,
      });

    if (!parsed.success) {
      return errorResponse(
        'Invalid notification data',
        400
      );
    }

    const notification =
      await createNotification({
        userId: parsed.data.userId,
        actorId:
          parsed.data.actorId ?? user.id,
        taskId:
          parsed.data.taskId ?? null,
        projectId:
          parsed.data.projectId ?? null,
        type: parsed.data.type,
        message: parsed.data.message,
      });

    return successResponse(
      notification,
      201
    );
  } catch (error) {
    console.error(
      'POST /api/notifications error:',
      error
    );

    return errorResponse(
      'Failed to create notification'
    );
  }
}