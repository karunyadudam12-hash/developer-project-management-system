import { requireFrontendAuth } from '@/src/auth/route-protection';

export default async function DashboardPage() {
  const user = await requireFrontendAuth();

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">
        Dashboard
      </h1>

      <p className="mt-4">
        Welcome, {user.name}
      </p>

      <p className="mt-2 text-gray-500">
        Role: {user.role}
      </p>
    </main>
  );
}