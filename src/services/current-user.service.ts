import { validateSession } from './session.service';
import { getUserById } from '../repositories/user.repository';

export async function getCurrentUser(token: string) {
  const session = await validateSession(token);

  if (!session) {
    return null;
  }

  const user = await getUserById(session.userId);

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
  };
}