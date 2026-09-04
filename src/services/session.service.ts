import crypto from 'node:crypto';

import {
  createSession,
  deleteSessionByTokenHash,
  getSessionByTokenHash,
} from '../repositories/session.repository';

const SESSION_DURATION_MS =
  7 * 24 * 60 * 60 * 1000;

export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}


export function hashSessionToken(token: string) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}


export async function createUserSession(userId: number) {
  const token = generateSessionToken();

  const tokenHash = hashSessionToken(token);

  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_MS
  ).toISOString();

  await createSession({
    tokenHash,
    userId,
    expiresAt,
  });

  return {
    token,
    expiresAt,
  };
}


export async function validateSession(token: string) {
  const tokenHash = hashSessionToken(token);

  const session =
    await getSessionByTokenHash(tokenHash);

  if (!session) {
    return null;
  }

  if (
    new Date(session.expiresAt).getTime() <=
    Date.now()
  ) {
    return null;
  }

  return session;
}


export async function logoutUser(token: string) {
  const session = await validateSession(token);

  if (!session) {
    return false;
  }

  await deleteSessionByTokenHash(hashSessionToken(token));

  return true;
}