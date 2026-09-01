import {
  createMention,
  getMentionsByCommentId,
} from '@/src/repositories/mention.repository';

import { getCommentById } from '@/src/repositories/comment.repository';

import {
  createNotification,
} from '@/src/repositories/notification.repository';

import {
  successResponse,
  errorResponse,
} from '@/src/lib/api-response';

import { requireAuth } from '@/src/auth/auth.guard';
import { hasPermission } from '@/src/auth/permission.helper';
import { PERMISSIONS } from '@/src/auth/permissions';

import { mentionSchema } from '@/src/validations/mention.validation';

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
      await context.params;

    const commentId =
      Number(id);

    if (
      !Number.isInteger(commentId) ||
      commentId <= 0
    ) {
      return errorResponse(
        'Invalid comment ID',
        400
      );
    }

    const comment =
      await getCommentById(
        commentId
      );

    if (!comment) {
      return errorResponse(
        'Comment not found',
        404
      );
    }

    const mentions =
      await getMentionsByCommentId(
        commentId
      );

    return successResponse(
      mentions
    );
  } catch (error) {
    console.error(
      'GET /api/comments/[id]/mentions error:',
      error
    );

    return errorResponse(
      'Failed to fetch mentions'
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
        PERMISSIONS.CREATE_COMMENT
      )
    ) {
      return errorResponse(
        'Forbidden',
        403
      );
    }

    const { id } =
      await context.params;

    const commentId =
      Number(id);

    if (
      !Number.isInteger(commentId) ||
      commentId <= 0
    ) {
      return errorResponse(
        'Invalid comment ID',
        400
      );
    }

    const comment =
      await getCommentById(
        commentId
      );

    if (!comment) {
      return errorResponse(
        'Comment not found',
        404
      );
    }

    if (comment.authorId !== user.id) {
      return errorResponse(
        'Only the comment author can add mentions',
        403
      );
    }

    const body =
      await request.json();

    const parsed =
      mentionSchema.safeParse({
        ...body,
        commentId,
      });

    if (!parsed.success) {
      return errorResponse(
        'Invalid mention data',
        400
      );
    }

    const mention =
      await createMention({
        commentId,
        userId: parsed.data.userId,
      });

    await createNotification({
      userId: parsed.data.userId,
      actorId: user.id,
      taskId: comment.taskId,
      type: 'MENTION',
      message:
        `You were mentioned in a comment on Task #${comment.taskId}`,
    });

    return successResponse(
      mention,
      201
    );
  } catch (error) {
    console.error(
      'POST /api/comments/[id]/mentions error:',
      error
    );

    return errorResponse(
      'Failed to create mention'
    );
  }
}