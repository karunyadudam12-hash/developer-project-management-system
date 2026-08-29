import { db } from '../prisma/db';

export async function getTasks() {
  return db.orm.public.Task.all();
}