import {
  createProjectMember,
  getProjectMember,
} from '../repositories/project-member.repository.js';

export async function addUserToProject(
  projectId: number,
  userId: number
) {
  const existing = await getProjectMember(projectId, userId);

  if (existing) {
    throw new Error('User is already a member of this project');
  }

  return createProjectMember({
    projectId,
    userId,
  });
}

export async function isUserProjectMember(
  projectId: number,
  userId: number
) {
  const member = await getProjectMember(projectId, userId);

  return member !== null;
}