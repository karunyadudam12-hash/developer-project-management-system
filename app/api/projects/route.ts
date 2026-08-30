import {
  createProject,
  getProjects,
} from '@/src/repositories/project.repository';

import { z } from 'zod';
import { projectSchema } from '@/src/validations/project.validation';

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

    const projects = await getProjects();

    return successResponse(projects);

  } catch (error) {
    console.error('GET /api/projects error:', error);

    return errorResponse('Failed to fetch projects');
  }
}


export async function POST(request: Request) {
  try {
    const token = getToken(request);

    const user = await requireAuth(token);

    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    if (
      !hasPermission(
        user.role as Role,
        PERMISSIONS.CREATE_PROJECT
      )
    ) {
      return errorResponse('Forbidden', 403);
    }

    const body = await request.json();

    const validatedData = projectSchema.parse(body);

    const project = await createProject(validatedData);

    return successResponse(project, 201);

  } catch (error) {
    console.error('POST /api/projects error:', error);

    if (error instanceof z.ZodError) {
      return errorResponse(
        'Validation failed',
        400,
        error.issues
      );
    }

    return errorResponse('Failed to create project');
  }
}