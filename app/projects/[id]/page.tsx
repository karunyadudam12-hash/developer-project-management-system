'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

type Project = {
  id: number;
  name: string;
  description?: string | null;
  status: ProjectStatus;
};

type ProjectMember = {
  id: number;
  projectId: number;
  userId: number;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  createdAt: string;
};

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = Number(params.id);

  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);

  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);

  const [error, setError] = useState('');
  const [membersError, setMembersError] = useState('');

  useEffect(() => {
    async function loadProject() {
      try {
        const response = await fetch(
          `/api/projects/${projectId}`
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || 'Failed to load project'
          );
        }

        setProject(result.data || result.details || null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load project'
        );
      } finally {
        setLoading(false);
      }
    }

    async function loadMembers() {
      try {
        const response = await fetch(
          `/api/project-members?projectId=${projectId}`
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || 'Failed to load members'
          );
        }

        setMembers(
          result.data || result.details || []
        );
      } catch (err) {
        setMembersError(
          err instanceof Error
            ? err.message
            : 'Failed to load members'
        );
      } finally {
        setMembersLoading(false);
      }
    }

    if (
      Number.isInteger(projectId) &&
      projectId > 0
    ) {
      loadProject();
      loadMembers();
    } else {
      setError('Invalid project ID');
      setLoading(false);
      setMembersLoading(false);
    }
  }, [projectId]);

  function getStatusClasses(
    status: ProjectStatus
  ) {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';

      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-700';

      case 'ACTIVE':
      default:
        return 'bg-blue-100 text-blue-700';
    }
  }

  function getRoleClasses(
    role: ProjectMember['role']
  ) {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-700';

      case 'MANAGER':
        return 'bg-orange-100 text-orange-700';

      case 'STAFF':
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  if (loading) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold">
          Project Details
        </h1>

        <p className="mt-4 text-gray-600">
          Loading project...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold">
          Project Details
        </h1>

        <p className="mt-4 rounded-md bg-red-100 p-3 text-red-700">
          {error}
        </p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold">
          Project Details
        </h1>

        <p className="mt-4 text-gray-600">
          Project not found.
        </p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {project.name}
            </h1>

            <p className="mt-3 text-gray-600">
              {project.description ||
                'No description'}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(
              project.status
            )}`}
          >
            {project.status}
          </span>
        </div>

        <div className="mt-6 border-t pt-6">
          <h2 className="text-lg font-semibold">
            Project Information
          </h2>

          <div className="mt-4 space-y-3 text-sm">
            <p>
              <span className="font-medium">
                Project ID:
              </span>{' '}
              {project.id}
            </p>

            <p>
              <span className="font-medium">
                Status:
              </span>{' '}
              {project.status}
            </p>
          </div>
        </div>

        <div className="mt-8 border-t pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Project Members
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Members assigned to this project
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium">
              {members.length}
            </span>
          </div>

          {membersLoading ? (
            <p className="mt-4 text-sm text-gray-600">
              Loading members...
            </p>
          ) : membersError ? (
            <p className="mt-4 rounded-md bg-red-100 p-3 text-sm text-red-700">
              {membersError}
            </p>
          ) : members.length === 0 ? (
            <div className="mt-4 rounded-md border p-4 text-center text-sm text-gray-600">
              No members assigned to this project.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      User ID: {member.userId}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Member ID: {member.id}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${getRoleClasses(
                      member.role
                    )}`}
                  >
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}