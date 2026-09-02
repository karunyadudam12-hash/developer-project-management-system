'use client';

import { useEffect, useState } from 'react';

type ProjectStatus =
  | 'ACTIVE'
  | 'COMPLETED'
  | 'ARCHIVED';

type Project = {
  id: number;
  name: string;
  description?: string | null;
  status: ProjectStatus;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(
    null
  );

  const [name, setName] = useState('');
  const [description, setDescription] =
    useState('');
  const [status, setStatus] =
    useState<ProjectStatus>('ACTIVE');

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          '/api/projects'
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              'Failed to load projects'
          );
        }

        if (!cancelled) {
          setProjects(
            result.data ||
              result.details ||
              []
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load projects'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  function startEditing(project: Project) {
    setEditingId(project.id);
    setName(project.name);
    setDescription(
      project.description || ''
    );
    setStatus(project.status);
    setError('');
    setMessage('');
  }

  function cancelEditing() {
    setEditingId(null);
    setName('');
    setDescription('');
    setStatus('ACTIVE');
    setError('');
  }

  async function saveProject() {
    if (!editingId) return;

    if (!name.trim()) {
      setError(
        'Project name cannot be empty'
      );
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `/api/projects/${editingId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            name: name.trim(),
            description:
              description.trim(),
            status,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Failed to update project'
        );
      }

      const updatedProject =
        result.details || result.data;

      setProjects((current) =>
        current.map((project) =>
          project.id === editingId
            ? updatedProject
            : project
        )
      );

      setMessage(
        'Project updated successfully'
      );

      cancelEditing();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update project'
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(
    projectId: number
  ) {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this project?'
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(projectId);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `/api/projects/${projectId}`,
        {
          method: 'DELETE',
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Failed to delete project'
        );
      }

      setProjects((current) =>
        current.filter(
          (project) =>
            project.id !== projectId
        )
      );

      setMessage(
        'Project deleted successfully'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete project'
      );
    } finally {
      setDeletingId(null);
    }
  }

  function getStatusClasses(
    projectStatus: ProjectStatus
  ) {
    switch (projectStatus) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';

      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-700';

      case 'ACTIVE':
      default:
        return 'bg-blue-100 text-blue-700';
    }
  }

  if (loading) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold">
          Projects
        </h1>

        <p className="mt-4 text-gray-600">
          Loading projects...
        </p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Projects
          </h1>

          <p className="mt-1 text-gray-600">
            Manage your projects
          </p>
        </div>
      </div>

      {error && (
        <p
          className="mt-4 rounded-md bg-red-100 p-3 text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      {message && (
        <p
          className="mt-4 rounded-md bg-green-100 p-3 text-green-700"
          role="status"
        >
          {message}
        </p>
      )}

      {projects.length === 0 ? (
        <div className="mt-6 rounded-lg border p-6 text-center">
          <p className="text-gray-600">
            No projects found.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-lg border bg-white p-5 shadow-sm"
            >
              {editingId === project.id ? (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor={`project-name-${project.id}`}
                      className="mb-1 block text-sm font-medium"
                    >
                      Project name
                    </label>

                    <input
                      id={`project-name-${project.id}`}
                      value={name}
                      onChange={(e) =>
                        setName(
                          e.target.value
                        )
                      }
                      className="w-full rounded-md border p-2 outline-none focus:ring-2"
                      placeholder="Project name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`project-description-${project.id}`}
                      className="mb-1 block text-sm font-medium"
                    >
                      Description
                    </label>

                    <textarea
                      id={`project-description-${project.id}`}
                      value={description}
                      onChange={(e) =>
                        setDescription(
                          e.target.value
                        )
                      }
                      className="w-full rounded-md border p-2 outline-none focus:ring-2"
                      placeholder="Project description"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`project-status-${project.id}`}
                      className="mb-1 block text-sm font-medium"
                    >
                      Status
                    </label>

                    <select
                      id={`project-status-${project.id}`}
                      value={status}
                      onChange={(e) =>
                        setStatus(
                          e.target
                            .value as ProjectStatus
                        )
                      }
                      className="w-full rounded-md border p-2 outline-none focus:ring-2"
                    >
                      <option value="ACTIVE">
                        Active
                      </option>

                      <option value="COMPLETED">
                        Completed
                      </option>

                      <option value="ARCHIVED">
                        Archived
                      </option>
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={
                        saveProject
                      }
                      disabled={saving}
                      className="rounded-md bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      {saving
                        ? 'Saving...'
                        : 'Save'}
                    </button>

                    <button
                      type="button"
                      onClick={
                        cancelEditing
                      }
                      disabled={saving}
                      className="rounded-md border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {project.name}
                      </h2>

                      <p className="mt-2 text-gray-600">
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

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        startEditing(
                          project
                        )
                      }
                      className="rounded-md bg-blue-600 px-4 py-2 text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteProject(
                          project.id
                        )
                      }
                      disabled={
                        deletingId ===
                        project.id
                      }
                      className="rounded-md border border-red-300 px-4 py-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {deletingId ===
                      project.id
                        ? 'Deleting...'
                        : 'Delete'}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}