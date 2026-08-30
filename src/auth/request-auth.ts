import { requireAuth } from './auth.guard.js';

export async function requireRequestAuth(request: Request) {
  const authorization = request.headers.get('authorization');

  let token: string | null = null;

  if (authorization?.startsWith('Bearer ')) {
    token = authorization.slice(7).trim();
  }

  return requireAuth(token);
}