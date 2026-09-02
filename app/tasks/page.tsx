'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import KanbanBoard from '@/src/components/kanban/KanbanBoard';

type TaskStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'DONE';

type TaskPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'URGENT';

type SortField =
  | 'title'
  | 'priority'
  | 'status'
  | 'dueDate';

type SortOrder =
  | 'asc'
  | 'desc';

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

export default function TasksPage() {
  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [search, setSearch] =
    useState('');

  const [projectId, setProjectId] =
    useState('');

  const [assigneeId, setAssigneeId] =
    useState('');

  const [sortBy, setSortBy] =
    useState<SortField>('title');

  const [sortOrder, setSortOrder] =
    useState<SortOrder>('asc');

  const [view, setView] =
    useState<'list' | 'kanban'>('list');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  async function loadTasks(
    nextSearch = search,
    nextProjectId = projectId,
    nextAssigneeId = assigneeId,
    nextSortBy = sortBy,
    nextSortOrder = sortOrder
  ) {
    setLoading(true);
    setError('');

    try {
      const params =
        new URLSearchParams();

      if (nextSearch.trim()) {
        params.set(
          'search',
          nextSearch.trim()
        );
      }

      if (nextProjectId.trim()) {
        params.set(
          'projectId',
          nextProjectId.trim()
        );
      }

      if (nextAssigneeId.trim()) {
        params.set(
          'assigneeId',
          nextAssigneeId.trim()
        );
      }

      params.set(
        'sortBy',
        nextSortBy
      );

      params.set(
        'sortOrder',
        nextSortOrder
      );

      const response = await fetch(
        `/api/tasks?${params.toString()}`
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Failed to load tasks'
        );
      }

      setTasks(
        result.data ||
          result.details ||
          []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load tasks'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      setLoading(true);
      setError('');

      try {
        const params =
          new URLSearchParams();

        params.set(
          'sortBy',
          'title'
        );

        params.set(
          'sortOrder',
          'asc'
        );

        const response = await fetch(
          `/api/tasks?${params.toString()}`
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              'Failed to load tasks'
          );
        }

        if (!cancelled) {
          setTasks(
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
              : 'Failed to load tasks'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initialLoad();

    return () => {
      cancelled = true;
    };
  }, []);
async function handleTaskMove(
  taskId: number,
  newStatus: TaskStatus
) {
  const previousTasks = tasks;

  setTasks((current) =>
    current.map((task) =>
      task.id === taskId
        ? {
            ...task,
            status: newStatus,
          }
        : task
    )
  );

  try {
    const response = await fetch(
      `/api/tasks/${taskId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      }
    );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ||
          'Failed to update task status'
      );
    }
  } catch (err) {
    setTasks(previousTasks);

    setError(
      err instanceof Error
        ? err.message
        : 'Failed to update task status'
    );
  }
}
  function clearFilters() {
    setSearch('');
    setProjectId('');
    setAssigneeId('');
    setSortBy('title');
    setSortOrder('asc');

    void loadTasks(
      '',
      '',
      '',
      'title',
      'asc'
    );
  }

  function getStatusClasses(
    status: TaskStatus
  ) {
    switch (status) {
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
    priority: TaskPriority
  ) {
    switch (priority) {
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

  return (
    <main className="p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Tasks
          </h1>

          <p className="mt-1 text-gray-600">
            Search, filter, sort and manage tasks
          </p>
        </div>

        <Link
          href="/tasks/new"
          className="w-fit rounded-md bg-blue-600 px-4 py-2 text-white"
        >
          Create Task
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            setView('list')
          }
          className={`rounded-md px-4 py-2 ${
            view === 'list'
              ? 'bg-black text-white'
              : 'border bg-white text-gray-700'
          }`}
        >
          List View
        </button>

        <button
          type="button"
          onClick={() =>
            setView('kanban')
          }
          className={`rounded-md px-4 py-2 ${
            view === 'kanban'
              ? 'bg-black text-white'
              : 'border bg-white text-gray-700'
          }`}
        >
          Kanban View
        </button>
      </div>

      <div className="mt-6 rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">
          Search, Filters & Sorting
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Search
            </label>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              className="w-full rounded-md border p-2"
              placeholder="Title or description"
            />
          </div>

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
              placeholder="e.g. 20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Sort By
            </label>

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target
                    .value as SortField
                )
              }
              className="w-full rounded-md border p-2"
            >
              <option value="title">
                Title
              </option>

              <option value="priority">
                Priority
              </option>

              <option value="status">
                Status
              </option>

              <option value="dueDate">
                Deadline
              </option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Order
            </label>

            <select
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(
                  event.target
                    .value as SortOrder
                )
              }
              className="w-full rounded-md border p-2"
            >
              <option value="asc">
                Ascending
              </option>

              <option value="desc">
                Descending
              </option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              void loadTasks(
                search,
                projectId,
                assigneeId,
                sortBy,
                sortOrder
              )
            }
            className="rounded-md bg-black px-4 py-2 text-white"
          >
            Apply
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-md border px-4 py-2"
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-red-100 p-3 text-red-700">
          {error}
        </p>
      )}

      {loading && (
        <p className="mt-6 text-gray-600">
          Loading tasks...
        </p>
      )}

      {!loading &&
        tasks.length === 0 && (
          <div className="mt-6 rounded-lg border p-6 text-center">
            <p className="text-gray-600">
              No tasks found.
            </p>

            <button
              type="button"
              onClick={() =>
                void loadTasks(
                  '',
                  '',
                  '',
                  'title',
                  'asc'
                )
              }
              className="mt-3 rounded-md bg-black px-4 py-2 text-white"
            >
              Load All Tasks
            </button>
          </div>
        )}

      {!loading &&
        tasks.length > 0 &&
        view === 'list' && (
          <div className="mt-6 space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {task.title}
                    </h2>

                    <p className="mt-2 text-gray-600">
                      {task.description ||
                        'No description'}
                    </p>

                    <div className="mt-3 space-y-1 text-sm text-gray-500">
                      <p>
                        Project ID:{' '}
                        {task.projectId}
                      </p>

                      <p>
                        Assignee:{' '}
                        {task.assigneeId ??
                          'Unassigned'}
                      </p>

                      <p>
                        Deadline:{' '}
                        {task.dueDate
                          ? new Date(
                              task.dueDate
                            ).toLocaleDateString()
                          : 'No deadline'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityClasses(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <a
                    href={`/tasks/${task.id}`}
                    className="rounded-md border px-4 py-2 text-sm"
                  >
                    View Task
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

      {!loading &&
        tasks.length > 0 &&
        view === 'kanban' && (
          <div className="mt-6">
            <KanbanBoard
              tasks={tasks}
              onTaskMove={
                handleTaskMove
              }
            />
          </div>
        )}
    </main>
  );
}