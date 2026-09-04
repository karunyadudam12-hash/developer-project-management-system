import type { ReactNode } from 'react';
import { requireFrontendAuth } from '@/src/auth/route-protection';

export default async function TasksLayout({ children }: { children: ReactNode }) {
  await requireFrontendAuth();
  return children;
}