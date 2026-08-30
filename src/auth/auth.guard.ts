import { getCurrentUser } from '../services/current-user.service';

export async function requireAuth(
  token: string | null | undefined
) {
  if (!token) {
    return null;
  }

  const user = await getCurrentUser(token);

  return user;
}