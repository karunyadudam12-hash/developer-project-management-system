import { getUsers } from '@/src/repositories/user.repository';

import {
  successResponse,
  errorResponse,
} from '@/src/lib/api-response';

import { requireAuth } from '@/src/auth/auth.guard';

import { hasPermission } from '@/src/auth/permission.helper';

import { PERMISSIONS } from '@/src/auth/permissions';

import type { Role } from '@/src/auth/roles';


function getToken(request: Request) {
  return request.headers
    .get('authorization')
    ?.replace('Bearer ', '') ?? null;
}


export async function GET(request: Request) {
  try {
    const token = getToken(request);

    const user = await requireAuth(token);

    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    if (
      !hasPermission(
        user.role as Role,
        PERMISSIONS.MANAGE_USERS
      )
    ) {
      return errorResponse('Forbidden', 403);
    }

const users = await getUsers();

const safeUsers = users.map((user) => ({
  id: user.id,
  email: user.email,
  username: user.username,
  name: user.name,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
}));

return successResponse(safeUsers);
  } catch (error) {
    console.error('GET /api/users error:', error);

    return errorResponse('Failed to fetch users');
  }
}