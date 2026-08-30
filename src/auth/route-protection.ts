import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { requireAuth } from './auth.guard';

export async function requireFrontendAuth() {
  const cookieStore = await cookies();

  const token = cookieStore.get('session_token')?.value;

  const user = await requireAuth(token);

  if (!user) {
    redirect('/login');
  }

  return user;
}