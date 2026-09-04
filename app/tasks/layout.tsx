import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { requireFrontendAuth } from '@/src/auth/route-protection';

export default async function TasksLayout({ children }: { children: ReactNode }) {
  await requireFrontendAuth();
  return children;
}
export const metadata: Metadata = { title: 'Tasks', description: 'Manage tasks in DPMS.' };
