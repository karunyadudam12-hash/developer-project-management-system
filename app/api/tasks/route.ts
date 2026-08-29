import { getTasks } from '@/src/repositories/task.repository';
import {
  successResponse,
  errorResponse,
} from '@/src/lib/api-response';

export async function GET() {
  try {
    const tasks = await getTasks();

    return successResponse(tasks);
  } catch (error) {
    console.error('GET /api/tasks error:', error);

    return errorResponse('Failed to fetch tasks');
  }
}