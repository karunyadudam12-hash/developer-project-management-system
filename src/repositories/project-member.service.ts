import { db } from '../prisma/db';

export async function getProjectMembers() {
  return db.orm.public.ProjectMember.all();
}

export async function getProjectMembersByProjectId(
  projectId: number
) {
  const members = await getProjectMembers();

  return members.filter(
    (member) => member.projectId === projectId
  );
}

export async function createProjectMember(data: {
  projectId: number;
  userId: number;
  role?: string;
}) {
  return db.orm.public.ProjectMember.create({
    projectId: data.projectId,
    userId: data.userId,
    role: data.role ?? 'STAFF',
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

export async function updateProjectMemberRole(
  projectId: number,
  userId: number,
  role: string
) {
  const member = await getProjectMember(
    projectId,
    userId
  );

  if (!member) {
    return null;
  }

  return db.orm.public.ProjectMember
    .where({ id: member.id })
    .update({ role });
}

export async function deleteProjectMember(
  projectId: number,
  userId: number
) {
  const member = await getProjectMember(
    projectId,
    userId
  );

  if (!member) {
    return null;
  }

  return db.orm.public.ProjectMember
    .where({ id: member.id })
    .delete();
}