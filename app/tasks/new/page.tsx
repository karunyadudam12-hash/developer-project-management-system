'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type TaskStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'DONE';

type TaskPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'URGENT';

export default function CreateTaskPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] =
    useState('');

  const [projectId, setProjectId] =
    useState('');

  const [assigneeId, setAssigneeId] =
    useState('');

  const [status, setStatus] =
    useState<TaskStatus>('TODO');

  const [priority, setPriority] =
    useState<TaskPriority>('MEDIUM');

  const [dueDate, setDueDate] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  async function createTask() {
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    if (!projectId.trim()) {
      setError('Project ID is required');
      return;
    }

    const parsedProjectId =
      Number(projectId);

    if (
      !Number.isInteger(parsedProjectId) ||
      parsedProjectId <= 0
    ) {
      setError(
        'Project ID must be a positive integer'
      );
      return;
    }

    let parsedAssigneeId:
      | number
      | undefined;

    if (assigneeId.trim()) {
      parsedAssigneeId =
        Number(assigneeId);

      if (
        !Number.isInteger(
          parsedAssigneeId
        ) ||
        parsedAssigneeId <= 0
      ) {
        setError(
          'Assignee ID must be a positive integer'
        );
        return;
      }
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch(
        '/api/tasks',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            title: title.trim(),
            description:
              description.trim() || undefined,
            status,
            priority,
            projectId:
              parsedProjectId,
            assigneeId:
              parsedAssigneeId,
            dueDate: dueDate
              ? new Date(
                  `${dueDate}T23:59:59`
                ).toISOString()
              : undefined,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Failed to create task'
        );
      }

      const createdTask =
        result.data ||
        result.details;

      if (createdTask?.id) {
        router.push(
          `/tasks/${createdTask.id}`
        );
      } else {
        router.push('/tasks');
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create task'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">
          Create Task
        </h1>

        <p className="mt-1 text-gray-600">
          Add a new task to a project
        </p>

        {error && (
          <p className="mt-4 rounded-md bg-red-100 p-3 text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
          <div className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                maxLength={200}
                className="w-full rounded-md border p-2"
                placeholder="Enter task title"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                maxLength={1000}
                rows={5}
                className="w-full rounded-md border p-2"
                placeholder="Describe the task"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Project ID
                </label>

                <input
                  type="number"
                  min="1"
                  value={projectId}
                  onChange={(event) =>
                    setProjectId(
                      event.target.value
                    )
                  }
                  className="w-full rounded-md border p-2"
                  placeholder="e.g. 2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Assignee ID
                </label>

                <input
                  type="number"
                  min="1"
                  value={assigneeId}
                  onChange={(event) =>
                    setAssigneeId(
                      event.target.value
                    )
                  }
                  className="w-full rounded-md border p-2"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target
                        .value as TaskStatus
                    )
                  }
                  className="w-full rounded-md border p-2"
                >
                  <option value="TODO">
                    TODO
                  </option>

                  <option value="IN_PROGRESS">
                    IN PROGRESS
                  </option>

                  <option value="DONE">
                    DONE
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target
                        .value as TaskPriority
                    )
                  }
                  className="w-full rounded-md border p-2"
                >
                  <option value="LOW">
                    LOW
                  </option>

                  <option value="MEDIUM">
                    MEDIUM
                  </option>

                  <option value="HIGH">
                    HIGH
                  </option>

                  <option value="URGENT">
                    URGENT
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Deadline
              </label>

              <input
                type="date"
                value={dueDate}
                onChange={(event) =>
                  setDueDate(
                    event.target.value
                  )
                }
                className="w-full rounded-md border p-2"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={createTask}
                disabled={saving}
                className="rounded-md bg-black px-5 py-2 text-white disabled:opacity-50"
              >
                {saving
                  ? 'Creating...'
                  : 'Create Task'}
              </button>

              <button
                onClick={() =>
                  router.push('/tasks')
                }
                disabled={saving}
                className="rounded-md border px-5 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
