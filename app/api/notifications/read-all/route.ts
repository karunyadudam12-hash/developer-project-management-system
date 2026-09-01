import { markAllNotificationsAsRead } from '@/src/repositories/notification.repository';

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

export async function PATCH(
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

    await markAllNotificationsAsRead(
      user.id
    );

    return successResponse({
      message:
        'All notifications marked as read',
    });
  } catch (error) {
    console.error(
      'PATCH /api/notifications/read-all error:',
      error
    );

    return errorResponse(
      'Failed to mark notifications as read'
    );
  }
}