import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { requireFrontendAuth } from '@/src/auth/route-protection';

export const metadata: Metadata = { title: 'Dashboard', description: 'Project and task overview for DPMS.' };

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireFrontendAuth();
  return children;
}
