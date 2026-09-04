import type { ReactNode } from 'react';
import { requireFrontendAuth } from '@/src/auth/route-protection';

export default async function ProjectsLayout({ children }: { children: ReactNode }) {
  await requireFrontendAuth();
  return children;
}