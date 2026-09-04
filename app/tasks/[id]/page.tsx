'use client';

import TaskCollaboration from '@/src/components/tasks/TaskCollaboration';

import { useEffect, useState } from 'react';
import {
  useParams,
  useRouter,
} from 'next/navigation';

type TaskStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'DONE';

type TaskPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'URGENT';

type Task = {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: number;
  assigneeId?: number | null;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
};

type ProjectMember = {
  id: number;
  projectId: number;
  userId: number;
  role: string;
};

type Label = {
  id: number;
  name: string;
  createdAt: string;
};

type TaskLabel = {
  id: number;
  taskId: number;
  labelId: number;
  createdAt: string;
};

export default function TaskDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const taskId = Number(params.id);

  const [task, setTask] =
    useState<Task | null>(null);

  const [members, setMembers] =
    useState<ProjectMember[]>([]);

  const [labels, setLabels] =
    useState<Label[]>([]);

  const [taskLabels, setTaskLabels] =
    useState<TaskLabel[]>([]);

  const [selectedAssignee, setSelectedAssignee] =
    useState('');

  const [selectedLabel, setSelectedLabel] =
    useState('');

  const [newLabelName, setNewLabelName] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [loadingMembers, setLoadingMembers] =
    useState(false);

  const [loadingLabels, setLoadingLabels] =
    useState(false);

  const [assigning, setAssigning] =
    useState(false);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [updatingPriority, setUpdatingPriority] =
    useState(false);

  const [updatingDueDate, setUpdatingDueDate] =
    useState(false);

  const [creatingLabel, setCreatingLabel] =
    useState(false);

  const [attachingLabel, setAttachingLabel] =
    useState(false);

  const [removingLabelId, setRemovingLabelId] =
    useState<number | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [title, setTitle] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [status, setStatus] =
    useState<TaskStatus>('TODO');

  const [priority, setPriority] =
    useState<TaskPriority>('MEDIUM');

  const [editDueDate, setEditDueDate] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [message, setMessage] =
    useState('');

  useEffect(() => {
    async function loadTask() {
      try {
        const response = await fetch(
          `/api/tasks/${taskId}`
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              'Failed to load task'
          );
        }

        const loadedTask =
          result.data ||
          result.details ||
          null;

        setTask(loadedTask);

        if (loadedTask) {
          setStatus(loadedTask.status);
          setPriority(loadedTask.priority);

          setSelectedAssignee(
            loadedTask.assigneeId
              ? String(
                  loadedTask.assigneeId
                )
              : ''
          );

          setEditDueDate(
            loadedTask.dueDate
              ? loadedTask.dueDate.slice(
                  0,
                  10
                )
              : ''
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load task'
        );
      } finally {
        setLoading(false);
      }
    }

if (
  Number.isInteger(taskId) &&
  taskId > 0
) {
  loadTask();
}
  }, [taskId]);

  useEffect(() => {
    async function loadMembers() {
      if (!task) {
        return;
      }

      setLoadingMembers(true);

      try {
        const response = await fetch(
          `/api/project-members?projectId=${task.projectId}`
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              'Failed to load project members'
          );
        }

        setMembers(
          result.data ||
            result.details ||
            []
        );
      } catch (err) {
        console.error(
          'Failed to load project members:',
          err
        );
      } finally {
        setLoadingMembers(false);
      }
    }

    loadMembers();
  }, [task]);

  useEffect(() => {
    async function loadLabels() {
      setLoadingLabels(true);

      try {
        const [
          labelsResponse,
          taskLabelsResponse,
        ] = await Promise.all([
          fetch('/api/labels'),
          fetch(
            `/api/tasks/${taskId}/labels`
          ),
        ]);

        const labelsResult =
          await labelsResponse.json();

        const taskLabelsResult =
          await taskLabelsResponse.json();

        if (!labelsResponse.ok) {
          throw new Error(
            labelsResult.error ||
              'Failed to load labels'
          );
        }

        if (!taskLabelsResponse.ok) {
          throw new Error(
            taskLabelsResult.error ||
              'Failed to load task labels'
          );
        }

        setLabels(
          labelsResult.data ||
            labelsResult.details ||
            []
        );

        setTaskLabels(
          taskLabelsResult.data ||
            taskLabelsResult.details ||
            []
        );
      } catch (err) {
        console.error(
          'Failed to load labels:',
          err
        );
      } finally {
        setLoadingLabels(false);
      }
    }

    if (
      Number.isInteger(taskId) &&
      taskId > 0
    ) {
      loadLabels();
    }
  }, [taskId]);

  function startEditing() {
    if (!task) {
      return;
    }

    setTitle(task.title);
    setDescription(
      task.description || ''
    );
    setStatus(task.status);
    setPriority(task.priority);

    setEditDueDate(
      task.dueDate
        ? task.dueDate.slice(0, 10)
        : ''
    );

    setEditing(true);
    setError('');
    setMessage('');
  }

  function cancelEditing() {
    if (task) {
      setStatus(task.status);
      setPriority(task.priority);

      setEditDueDate(
        task.dueDate
          ? task.dueDate.slice(0, 10)
          : ''
      );
    }

    setEditing(false);
    setError('');
    setMessage('');
  }

  async function saveTask() {
    if (!title.trim()) {
      setError(
        'Task title cannot be empty'
      );
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `/api/tasks/${taskId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type':
              'application/json',
          },
body: JSON.stringify({
  title: title.trim(),
  description:
    description.trim(),
  status,
  priority,
 projectId: task?.projectId,
  dueDate: editDueDate
              ? new Date(
                  `${editDueDate}T23:59:59`
                ).toISOString()
              : null,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Failed to update task'
        );
      }

      const updatedTask =
        result.data ||
        result.details ||
        null;

      setTask(updatedTask);
      setEditing(false);

      setMessage(
        'Task updated successfully'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update task'
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(
    nextStatus: TaskStatus
  ) {
    if (!task || nextStatus === task.status) {
      return;
    }

    setUpdatingStatus(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `/api/tasks/${task.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Failed to update status'
        );
      }

      const updatedTask =
        result.data ||
        result.details ||
        null;

      setTask(updatedTask);
      setStatus(updatedTask.status);

      setMessage(
        'Task status updated successfully'
      );
    } catch (err) {
      setStatus(task.status);

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update status'
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function updatePriority(
    nextPriority: TaskPriority
  ) {
    if (
      !task ||
      nextPriority === task.priority
    ) {
      return;
    }

    setUpdatingPriority(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `/api/tasks/${task.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            priority: nextPriority,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Failed to update priority'
        );
      }

      const updatedTask =
        result.data ||
        result.details ||
        null;

      setTask(updatedTask);
      setPriority(updatedTask.priority);

      setMessage(
        'Task priority updated successfully'
      );
    } catch (err) {
      setPriority(task.priority);

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update priority'
      );
    } finally {
      setUpdatingPriority(false);
    }
  }

  async function updateDueDate() {
    if (!task) {
      return;
    }

    setUpdatingDueDate(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `/api/tasks/${task.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            dueDate: editDueDate
              ? new Date(
                  `${editDueDate}T23:59:59`
                ).toISOString()
              : null,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Failed to update due date'
        );
      }

      const updatedTask =
        result.data ||
        result.details ||
        null;

      setTask(updatedTask);

      setEditDueDate(
        updatedTask?.dueDate
          ? updatedTask.dueDate.slice(
              0,
              10
            )
          : ''
      );

      setMessage(
        editDueDate
          ? 'Deadline updated successfully'
          : 'Deadline removed successfully'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update due date'
      );
    } finally {
      setUpdatingDueDate(false);
    }
  }

  async function assignTask() {
    if (!task) {
      return;
    }

    setAssigning(true);
    setError('');
    setMessage('');

    try {
      const assigneeId =
        selectedAssignee === ''
          ? null
          : Number(selectedAssignee);

      const response = await fetch(
        `/api/tasks/${task.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            assigneeId,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Failed to assign task'
        );
      }

      const updatedTask =
        result.data ||
        result.details ||
        null;

      setTask(updatedTask);

      setSelectedAssignee(
        updatedTask?.assigneeId
          ? String(
              updatedTask.assigneeId
            )
          : ''
      );

      setMessage(
        assigneeId === null
          ? 'Task unassigned successfully'
          : 'Task assigned successfully'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to assign task'
      );
    } finally {
      setAssigning(false);
    }
  }

  async function createLabel() {
    const name = newLabelName.trim();

    if (!name) {
      setError('Label name is required');
      return;
    }

    setCreatingLabel(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        '/api/labels',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            name,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Failed to create label'
        );
      }

      const label =
        result.data ||
        result.details ||
        null;

      if (label) {
        setLabels((current) => {
          const exists = current.some(
            (item) =>
              item.id === label.id
          );

          return exists
            ? current
            : [...current, label];
        });

        setSelectedLabel(
          String(label.id)
        );
      }

      setNewLabelName('');

      setMessage(
        'Label created successfully'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create label'
      );
    } finally {
      setCreatingLabel(false);
    }
  }

  async function attachLabel() {
    if (!task || !selectedLabel) {
      setError('Select a label first');
      return;
    }

    const labelId = Number(
      selectedLabel
    );

    const alreadyAttached =
      taskLabels.some(
        (taskLabel) =>
          taskLabel.labelId === labelId
      );

    if (alreadyAttached) {
      setError(
        'Label is already attached to this task'
      );
      return;
    }

    setAttachingLabel(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `/api/tasks/${task.id}/labels`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            labelId,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Failed to attach label'
        );
      }

      const taskLabel =
        result.data ||
        result.details ||
        null;

      if (taskLabel) {
        setTaskLabels((current) => {
          const exists = current.some(
            (item) =>
              item.id === taskLabel.id
          );

          return exists
            ? current
            : [...current, taskLabel];
        });
      }

      setSelectedLabel('');

      setMessage(
        'Label attached successfully'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to attach label'
      );
    } finally {
      setAttachingLabel(false);
    }
  }

  async function removeLabel(
    labelId: number
  ) {
    if (!task) {
      return;
    }

    setRemovingLabelId(labelId);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `/api/tasks/${task.id}/labels?labelId=${labelId}`,
        {
          method: 'DELETE',
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Failed to remove label'
        );
      }

      setTaskLabels((current) =>
        current.filter(
          (taskLabel) =>
            taskLabel.labelId !==
            labelId
        )
      );

      setMessage(
        'Label removed successfully'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to remove label'
      );
    } finally {
      setRemovingLabelId(null);
    }
  }

  async function deleteTask() {
    if (!task) {
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${task.title}"?`
      );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `/api/tasks/${task.id}`,
        {
          method: 'DELETE',
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Failed to delete task'
        );
      }

      router.push('/tasks');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete task'
      );
    } finally {
      setDeleting(false);
    }
  }

  function getStatusClasses(
    value: TaskStatus
  ) {
    switch (value) {
      case 'DONE':
        return 'bg-green-100 text-green-700';

      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-700';

      case 'TODO':
      default:
        return 'bg-blue-100 text-blue-700';
    }
  }

  function getPriorityClasses(
    value: TaskPriority
  ) {
    switch (value) {
      case 'URGENT':
        return 'bg-red-100 text-red-700';

      case 'HIGH':
        return 'bg-orange-100 text-orange-700';

      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700';

      case 'LOW':
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  function formatDueDate(
    value?: string | null
  ) {
    if (!value) {
      return 'No deadline';
    }

    return new Date(
      value
    ).toLocaleDateString();
  }

  function getLabelName(
    labelId: number
  ) {
    return (
      labels.find(
        (label) =>
          label.id === labelId
      )?.name ||
      `Label ${labelId}`
    );
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold">
          Task Details
        </h1>

        <p className="mt-4 text-gray-600">
          Loading task...
        </p>
      </main>
    );
  }

  if (error && !task) {
    return (
      <main className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold">
          Task Details
        </h1>

        <p className="mt-4 rounded-md bg-red-100 p-3 text-red-700">
          {error}
        </p>
      </main>
    );
  }

  if (!task) {
    return (
      <main className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold">
          Task Details
        </h1>

        <p className="mt-4 text-gray-600">
          Task not found.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        {error && (
          <p className="mb-4 rounded-md bg-red-100 p-3 text-red-700">
            {error}
          </p>
        )}

        {message && (
          <p className="mb-4 rounded-md bg-green-100 p-3 text-green-700">
            {message}
          </p>
        )}

        {editing ? (
          <div>
            <h1 className="text-2xl font-bold">
              Edit Task
            </h1>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Title
                </label>

                <input
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  className="w-full rounded-md border p-2"
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
                  className="w-full rounded-md border p-2"
                  rows={5}
                />
              </div>

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
                  disabled={saving}
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
                  disabled={saving}
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

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Deadline
                </label>

                <input
                  type="date"
                  value={editDueDate}
                  onChange={(event) =>
                    setEditDueDate(
                      event.target.value
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-md border p-2"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={saveTask}
                  disabled={saving}
                  className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : 'Save Changes'}
                </button>

                <button
                  onClick={cancelEditing}
                  disabled={saving}
                  className="rounded-md border px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold">
                  {task.title}
                </h1>

                <p className="mt-3 text-gray-600">
                  {task.description ||
                    'No description'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(
                    task.status
                  )}`}
                >
                  {task.status}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${getPriorityClasses(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={startEditing}
                className="rounded-md bg-blue-600 px-4 py-2 text-white"
              >
                Edit Task
              </button>

              <button
                onClick={deleteTask}
                disabled={deleting}
                className="rounded-md border border-red-300 px-4 py-2 text-red-600 disabled:opacity-50"
              >
                {deleting
                  ? 'Deleting...'
                  : 'Delete Task'}
              </button>
            </div>

            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold">
                Status
              </h2>

              <div className="mt-4">
                <select
                  value={status}
                  onChange={(event) =>
                    updateStatus(
                      event.target
                        .value as TaskStatus
                    )
                  }
                  disabled={updatingStatus}
                  className="w-full rounded-md border p-2 sm:w-auto"
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

              {updatingStatus && (
                <p className="mt-2 text-sm text-gray-500">
                  Updating status...
                </p>
              )}
            </div>

            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold">
                Priority
              </h2>

              <div className="mt-4">
                <select
                  value={priority}
                  onChange={(event) =>
                    updatePriority(
                      event.target
                        .value as TaskPriority
                    )
                  }
                  disabled={updatingPriority}
                  className="w-full rounded-md border p-2 sm:w-auto"
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

              {updatingPriority && (
                <p className="mt-2 text-sm text-gray-500">
                  Updating priority...
                </p>
              )}
            </div>

            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold">
                Deadline
              </h2>

              <p className="mt-2 text-gray-600">
                {formatDueDate(
                  task.dueDate
                )}
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Change deadline
                  </label>

                  <input
                    type="date"
                    value={
                      editDueDate ||
                      (task.dueDate
                        ? task.dueDate.slice(
                            0,
                            10
                          )
                        : '')
                    }
                    onChange={(event) =>
                      setEditDueDate(
                        event.target.value
                      )
                    }
                    className="rounded-md border p-2"
                  />
                </div>

                <button
                  onClick={updateDueDate}
                  disabled={updatingDueDate}
                  className="rounded-md bg-purple-600 px-4 py-2 text-white disabled:opacity-50"
                >
                  {updatingDueDate
                    ? 'Updating...'
                    : 'Update Deadline'}
                </button>

                <button
                  onClick={() => {
                    if (!task.dueDate) {
                      return;
                    }

                    setEditDueDate('');
                  }}
                  disabled={
                    updatingDueDate ||
                    !task.dueDate
                  }
                  className="rounded-md border px-4 py-2 disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold">
                Assignment
              </h2>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium">
                    Assignee
                  </label>

                  <select
                    value={selectedAssignee}
                    onChange={(event) =>
                      setSelectedAssignee(
                        event.target.value
                      )
                    }
                    disabled={
                      loadingMembers
                    }
                    className="w-full rounded-md border p-2"
                  >
                    <option value="">
                      Unassigned
                    </option>

                    {members.map((member) => (
                      <option
                        key={member.userId}
                        value={member.userId}
                      >
                        User {member.userId} (
                        {member.role})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={assignTask}
                  disabled={
                    assigning ||
                    loadingMembers
                  }
                  className="rounded-md bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
                >
                  {assigning
                    ? 'Updating...'
                    : 'Update Assignee'}
                </button>
              </div>

              {loadingMembers && (
                <p className="mt-2 text-sm text-gray-500">
                  Loading project members...
                </p>
              )}

              {!loadingMembers &&
                members.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    No project members available.
                  </p>
                )}
            </div>

            <div className="mt-8 border-t pt-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  Labels
                </h2>

                {loadingLabels && (
                  <span className="text-sm text-gray-500">
                    Loading...
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {taskLabels.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No labels attached.
                  </p>
                ) : (
                  taskLabels.map(
                    (taskLabel) => (
                      <div
                        key={taskLabel.id}
                        className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1"
                      >
                        <span className="text-sm font-medium">
                          {getLabelName(
                            taskLabel.labelId
                          )}
                        </span>

                        <button
                          onClick={() =>
                            removeLabel(
                              taskLabel.labelId
                            )
                          }
                          disabled={
                            removingLabelId ===
                            taskLabel.labelId
                          }
                          className="text-sm text-red-600 disabled:opacity-50"
                        >
                          {removingLabelId ===
                          taskLabel.labelId
                            ? '...'
                            : '×'}
                        </button>
                      </div>
                    )
                  )
                )}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Attach existing label
                  </label>

                  <div className="flex flex-wrap gap-2">
                    <select
                      value={selectedLabel}
                      onChange={(event) =>
                        setSelectedLabel(
                          event.target.value
                        )
                      }
                      disabled={
                        loadingLabels ||
                        attachingLabel
                      }
                      className="min-w-0 flex-1 rounded-md border p-2"
                    >
                      <option value="">
                        Select label
                      </option>

                      {labels
                        .filter(
                          (label) =>
                            !taskLabels.some(
                              (taskLabel) =>
                                taskLabel.labelId ===
                                label.id
                            )
                        )
                        .map((label) => (
                          <option
                            key={label.id}
                            value={label.id}
                          >
                            {label.name}
                          </option>
                        ))}
                    </select>

                    <button
                      onClick={attachLabel}
                      disabled={
                        attachingLabel ||
                        loadingLabels ||
                        !selectedLabel
                      }
                      className="rounded-md bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
                    >
                      {attachingLabel
                        ? 'Adding...'
                        : 'Add'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Create new label
                  </label>

                  <div className="flex flex-wrap gap-2">
                    <input
                      value={newLabelName}
                      onChange={(event) =>
                        setNewLabelName(
                          event.target.value
                        )
                      }
                      disabled={creatingLabel}
                      className="min-w-0 flex-1 rounded-md border p-2"
                      placeholder="e.g. frontend"
                    />

                    <button
                      onClick={createLabel}
                      disabled={
                        creatingLabel ||
                        !newLabelName.trim()
                      }
                      className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
                    >
                      {creatingLabel
                        ? 'Creating...'
                        : 'Create'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold">
                Task Information
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">
                    Task ID
                  </p>

                  <p className="mt-1 font-medium">
                    {task.id}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Project ID
                  </p>

                  <p className="mt-1 font-medium">
                    {task.projectId}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Status
                  </p>

                  <p className="mt-1 font-medium">
                    {task.status}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Priority
                  </p>

                  <p className="mt-1 font-medium">
                    {task.priority}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Assignee
                  </p>

                  <p className="mt-1 font-medium">
                    {task.assigneeId ??
                      'Unassigned'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Deadline
                  </p>

                  <p className="mt-1 font-medium">
                    {formatDueDate(
                      task.dueDate
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Created
                  </p>

                  <p className="mt-1 font-medium">
                    {task.createdAt}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
        <TaskCollaboration taskId={task.id} />
      </div>
    </main>
  );
}
