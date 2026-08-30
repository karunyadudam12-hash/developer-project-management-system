import { db } from '../prisma/db';

export async function getProjects() {
  return db.orm.public.Project.all();
}

export async function getProjectById(id: number) {
  const projects = await db.orm.public.Project.all();

  return (
    projects.find((project) => project.id === id) ?? null
  );
}

export async function createProject(data: {
  name: string;
  description?: string;
  status?: string;
}) {
  return db.orm.public.Project.create(data);
}

export async function updateProject(
  id: number,
  data: {
    name?: string;
    description?: string;
    status?: string;
  }
) {
  const project = await getProjectById(id);

  if (!project) {
    return null;
  }

  return db.orm.public.Project
    .where({ id })
    .update(data);
}

export async function deleteProject(id: number) {
  const project = await getProjectById(id);

  if (!project) {
    return null;
  }

  const members = await db.orm.public.ProjectMember.all();
  const tasks = await db.orm.public.Task.all();

  const hasMembers = members.some(
    (member) => member.projectId === id
  );

  const hasTasks = tasks.some(
    (task) => task.projectId === id
  );

  if (hasMembers || hasTasks) {
    throw new Error(
      'Project cannot be deleted while it has members or tasks'
    );
  }

  return db.orm.public.Project
    .where({ id })
    .delete();
}