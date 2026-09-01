import {
  deleteComment,
  getCommentById,
  updateComment,
} from '@/src/repositories/comment.repository';

import {
  successResponse,
  errorResponse,
} from '@/src/lib/api-response';

import { requireAuth } from '@/src/auth/auth.guard';
import { hasPermission } from '@/src/auth/permission.helper';
import { PERMISSIONS } from '@/src/auth/permissions';

import { commentSchema } from '@/src/validations/comment.validation';

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
        PERMISSIONS.UPDATE_COMMENT
      )
    ) {
      return errorResponse(
        'Forbidden',
        403
      );
    }

    const { id } = await context.params;
    const commentId = Number(id);

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
      await getCommentById(commentId);

    if (!comment) {
      return errorResponse(
        'Comment not found',
        404
      );
    }

    if (comment.authorId !== user.id) {
      return errorResponse(
        'You can only edit your own comment',
        403
      );
    }

    const body =
      await request.json();

    const parsed =
      commentSchema.safeParse({
        ...body,
        taskId: comment.taskId,
      });

    if (!parsed.success) {
      return errorResponse(
        'Invalid comment data',
        400
      );
    }

    const updatedComment =
      await updateComment(
        commentId,
        {
          content: parsed.data.content,
        }
      );

    if (!updatedComment) {
      return errorResponse(
        'Comment not found',
        404
      );
    }

    return successResponse(
      updatedComment
    );
  } catch (error) {
    console.error(
      'PUT /api/comments/[id] error:',
      error
    );

    return errorResponse(
      'Failed to update comment'
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
        PERMISSIONS.DELETE_COMMENT
      )
    ) {
      return errorResponse(
        'Forbidden',
        403
      );
    }

    const { id } = await context.params;
    const commentId = Number(id);

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
      await getCommentById(commentId);

    if (!comment) {
      return errorResponse(
        'Comment not found',
        404
      );
    }

    const isOwner =
      comment.authorId === user.id;

    const isAdmin =
      user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return errorResponse(
        'You can only delete your own comment',
        403
      );
    }

    const deletedComment =
      await deleteComment(commentId);

    if (!deletedComment) {
      return errorResponse(
        'Comment not found',
        404
      );
    }

    return successResponse({
      message:
        'Comment deleted successfully',
      comment: deletedComment,
    });
  } catch (error) {
    console.error(
      'DELETE /api/comments/[id] error:',
      error
    );

    return errorResponse(
      'Failed to delete comment'
    );
  }
}