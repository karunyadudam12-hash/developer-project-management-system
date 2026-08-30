import {
  getProjects,
  createProject,
} from '@/src/repositories/project.repository';

import {
  successResponse,
  errorResponse,
} from '@/src/lib/api-response';

import { requireAuth } from '@/src/auth/auth.guard';

function getToken(request: Request) {
  const authorization = request.headers.get('authorization');

  if (authorization) {
    return authorization.replace('Bearer ', '');
  }

  const cookieHeader = request.headers.get('cookie');

  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader.match(
    /(?:^|;\s*)session_token=([^;]+)/
  );

  return match ? match[1] : null;
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

    const body = await request.json();

    const name =
      typeof body.name === 'string'
        ? body.name.trim()
        : '';

    const description =
      typeof body.description === 'string'
        ? body.description.trim()
        : undefined;

    const status =
      typeof body.status === 'string'
        ? body.status.trim()
        : undefined;

    if (!name) {
      return errorResponse('Project name is required', 400);
    }

    const project = await createProject({
      name,
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
    });

    return successResponse(project, 201);
  } catch (error) {
    console.error('POST /api/projects error:', error);

    return errorResponse('Failed to create project');
  }
}