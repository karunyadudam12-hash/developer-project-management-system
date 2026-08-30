import { db } from '../prisma/db';

export async function getProjectMembers() {
  return db.orm.public.ProjectMember.all();
}

export async function createProjectMember(data: {
  projectId: number;
  userId: number;
}) {
  return db.orm.public.ProjectMember.create({
    projectId: data.projectId,
    userId: data.userId,
  });
}

export async function getProjectMember(
  projectId: number,
  userId: number
) {
  const members = await getProjectMembers();

  return (
    members.find(
      (member) =>
        member.projectId === projectId &&
        member.userId === userId
    ) ?? null
  );
}