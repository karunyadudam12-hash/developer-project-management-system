import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { requireFrontendAuth } from '@/src/auth/route-protection';

export const metadata: Metadata = { title: 'Users', description: 'Workspace user directory for DPMS.' };

export default async function UsersLayout({ children }: { children: ReactNode }) {
  await requireFrontendAuth();
  return children;
}
