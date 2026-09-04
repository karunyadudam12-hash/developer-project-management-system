import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { requireFrontendAuth } from '@/src/auth/route-protection';

export default async function ProjectsLayout({ children }: { children: ReactNode }) {
  await requireFrontendAuth();
  return children;
}
export const metadata: Metadata = { title: 'Projects', description: 'Manage projects in DPMS.' };
