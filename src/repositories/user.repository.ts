import { db } from '../prisma/db';

export async function getUsers() {
  return db.orm.public.User.all();
}

export async function createUser(data: {
  email: string;
  username?: string;
  name?: string;
  role?: string;
  passwordHash: string;
}) {
  const users = await db.orm.public.User.all();

  const emailExists = users.some(
    (user) => user.email === data.email
  );

  if (emailExists) {
    throw new Error('User already exists');
  }

  if (data.username) {
    const usernameExists = users.some(
      (user) => user.username === data.username
    );

    if (usernameExists) {
      throw new Error('User already exists');
    }
  }

  return db.orm.public.User.create({
    email: data.email,
    username: data.username,
    name: data.name,
    role: data.role ?? 'STAFF',
    passwordHash: data.passwordHash,
  });
}

export async function getUserByEmail(email: string) {
  const users = await db.orm.public.User.all();

  return users.find((user) => user.email === email) ?? null;
}

export async function getUserById(id: number) {
  const users = await db.orm.public.User.all();

  return users.find((user) => user.id === id) ?? null;
}