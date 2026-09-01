import {
  getNotificationById,
  markNotificationAsRead,
  markNotificationAsUnread,
} from '@/src/repositories/notification.repository';

import {
  successResponse,
  errorResponse,
} from '@/src/lib/api-response';

import { requireAuth } from '@/src/auth/auth.guard';

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

async function getAuthenticatedUser(
  request: Request
) {
  const token = getToken(request);
  return requireAuth(token);
}

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const user =
      await getAuthenticatedUser(request);

    if (!user) {
      return errorResponse(
        'Unauthorized',
        401
      );
    }

    const { id } =
      await context.params;

    const notificationId =
      Number(id);

    if (
      !Number.isInteger(notificationId) ||
      notificationId <= 0
    ) {
      return errorResponse(
        'Invalid notification ID',
        400
      );
    }

    const notification =
      await getNotificationById(
        notificationId
      );

    if (!notification) {
      return errorResponse(
        'Notification not found',
        404
      );
    }

    if (
      notification.userId !== user.id
    ) {
      return errorResponse(
        'Forbidden',
        403
      );
    }

    const body =
      await request.json();

    if (
      body.action !== 'read' &&
      body.action !== 'unread'
    ) {
      return errorResponse(
        'action must be read or unread',
        400
      );
    }

    const updated =
      body.action === 'read'
        ? await markNotificationAsRead(
            notificationId
          )
        : await markNotificationAsUnread(
            notificationId
          );

    return successResponse(
      updated
    );
  } catch (error) {
    console.error(
      'PATCH /api/notifications/[id] error:',
      error
    );

    return errorResponse(
      'Failed to update notification'
    );
  }
}