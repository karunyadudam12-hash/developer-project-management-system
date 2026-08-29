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

export async function GET() {
  try {
    const projects = await getProjects();

    return successResponse(projects);
  } catch (error) {
    console.error('GET /api/projects error:', error);

    return errorResponse('Failed to fetch projects');
  }
}

export async function POST(request: Request) {
  try {
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