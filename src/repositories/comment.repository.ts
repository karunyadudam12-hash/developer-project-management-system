import { db } from '../prisma/db';

export async function getComments() {
  return db.orm.public.Comment.all();
}