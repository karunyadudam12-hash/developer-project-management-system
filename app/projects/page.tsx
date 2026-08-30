import { requireFrontendAuth } from '@/src/auth/route-protection';

export default async function ProjectsPage() {
  const user = await requireFrontendAuth();

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">
        Projects
      </h1>

      <p className="mt-4">
        Welcome, {user.name}
      </p>
    </main>
  );
}