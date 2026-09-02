import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-3xl rounded-2xl border bg-white p-8 text-center shadow-sm sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          Developer Project Management System
        </p>

        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Manage projects. Manage tasks. Build better.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">
          DPMS helps development teams manage projects,
          tasks, collaboration, notifications, and
          productivity from one place.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="rounded-md bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            Sign In
          </Link>

          <Link
            href="/register"
            className="rounded-md border border-gray-300 bg-white px-6 py-3 font-medium text-gray-900 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            Create Account
          </Link>
        </div>

        <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
          <div className="rounded-lg border bg-gray-50 p-4">
            <h2 className="font-semibold text-gray-900">
              Projects
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Organize and manage development projects.
            </p>
          </div>

          <div className="rounded-lg border bg-gray-50 p-4">
            <h2 className="font-semibold text-gray-900">
              Tasks
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Track tasks with list and Kanban views.
            </p>
          </div>

          <div className="rounded-lg border bg-gray-50 p-4">
            <h2 className="font-semibold text-gray-900">
              Analytics
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Monitor productivity and project progress.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}