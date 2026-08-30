import { db } from '../prisma/db';

export async function createSession(data: {
  tokenHash: string;
  userId: number;
  expiresAt: string;
}) {
  return db.orm.public.Session.create({
    tokenHash: data.tokenHash,
    userId: data.userId,
    expiresAt: data.expiresAt,
  });
}

export async function getSessionByTokenHash(tokenHash: string) {
  const sessions = await db.orm.public.Session.all();

  return (
    sessions.find((session) => session.tokenHash === tokenHash) ?? null
  );
}