import {
  getLabels,
  getLabelByName,
  createLabel,
} from '@/src/repositories/label.repository';

import {
  successResponse,
  errorResponse,
} from '@/src/lib/api-response';

import { requireAuth } from '@/src/auth/auth.guard';
import { hasPermission } from '@/src/auth/permission.helper';
import { PERMISSIONS } from '@/src/auth/permissions';

import { labelSchema } from '@/src/validations/label.validation';

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

  const sessionCookie = cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) =>
      cookie.startsWith('session_token=')
    );

  if (!sessionCookie) {
    return null;
  }

  return decodeURIComponent(
    sessionCookie.slice('session_token='.length)
  );
}

export async function GET(request: Request) {
  try {
    const token = getToken(request);

    const user = await requireAuth(token);

    if (!user) {
      return errorResponse(
        'Unauthorized',
        401
      );
    }

    const labels = await getLabels();

    return successResponse(labels);
  } catch (error) {
    console.error(
      'GET /api/labels error:',
      error
    );

    return errorResponse(
      'Failed to fetch labels'
    );
  }
}

export async function POST(request: Request) {
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
        PERMISSIONS.UPDATE_TASK
      )
    ) {
      return errorResponse(
        'Forbidden',
        403
      );
    }

    const body = await request.json();

    const parsed =
      labelSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        'Invalid label data',
        400
      );
    }

    const name = parsed.data.name;

    const existingLabel =
      await getLabelByName(name);

    if (existingLabel) {
      return successResponse(
        existingLabel
      );
    }

    const label =
      await createLabel(name);

    return successResponse(
      label,
      201
    );
  } catch (error) {
    console.error(
      'POST /api/labels error:',
      error
    );

    return errorResponse(
      'Failed to create label'
    );
  }
}