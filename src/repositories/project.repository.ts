import { db } from '../prisma/db';

export async function getProjects() {
  return db.orm.public.Project.all();
}

export async function createProject(data: {
  name: string;
  description?: string;
  status?: string;
}) {
  return db.orm.public.Project.create(data);
}