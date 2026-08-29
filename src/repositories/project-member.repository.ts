import { db } from '../prisma/db';

export async function getProjectMembers() {
  return db.orm.public.ProjectMember.all();
}