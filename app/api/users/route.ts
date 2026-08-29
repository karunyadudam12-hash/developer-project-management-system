import { getUsers } from '@/src/repositories/user.repository';
import {
  successResponse,
  errorResponse,
} from '@/src/lib/api-response';

export async function GET() {
  try {
    const users = await getUsers();

    return successResponse(users);
  } catch (error) {
    console.error('GET /api/users error:', error);

    return errorResponse('Failed to fetch users');
  }
}