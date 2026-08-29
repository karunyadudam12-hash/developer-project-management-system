import { getProjectMembers } from '@/src/repositories/project-member.repository';
import {
  successResponse,
  errorResponse,
} from '@/src/lib/api-response';

export async function GET() {
  try {
    const projectMembers = await getProjectMembers();

    return successResponse(projectMembers);
  } catch (error) {
    console.error('GET /api/project-members error:', error);

    return errorResponse('Failed to fetch project members');
  }
}