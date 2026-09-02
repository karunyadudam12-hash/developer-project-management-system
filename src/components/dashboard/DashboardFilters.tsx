'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

type DashboardProject = {
  id: number;
  label: string;
  status: string;
};

type DashboardStatus =
  | ''
  | 'TODO'
  | 'IN_PROGRESS'
  | 'DONE';

type DashboardPriority =
  | ''
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'URGENT';

type DashboardDeadline =
  | ''
  | 'OVERDUE'
  | 'UPCOMING'
  | 'NO_DEADLINE';

type DashboardFiltersProps = {
  projects: DashboardProject[];
};

export default function DashboardFilters({
  projects,
}: DashboardFiltersProps) {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const [projectId, setProjectId] =
    useState(
      searchParams.get(
        'projectId'
      ) || ''
    );

  const [status, setStatus] =
    useState<DashboardStatus>(
      (searchParams.get(
        'status'
      ) as DashboardStatus) || ''
    );

  const [priority, setPriority] =
    useState<DashboardPriority>(
      (searchParams.get(
        'priority'
      ) as DashboardPriority) || ''
    );

  const [deadline, setDeadline] =
    useState<DashboardDeadline>(
      (searchParams.get(
        'deadline'
      ) as DashboardDeadline) || ''
    );

  function applyFilters() {
    const params =
      new URLSearchParams();

    if (projectId) {
      params.set(
        'projectId',
        projectId
      );
    }

    if (status) {
      params.set(
        'status',
        status
      );
    }

    if (priority) {
      params.set(
        'priority',
        priority
      );
    }

    if (deadline) {
      params.set(
        'deadline',
        deadline
      );
    }

    const query =
      params.toString();

    router.push(
      query
        ? `/dashboard?${query}`
        : '/dashboard'
    );
  }

  function clearFilters() {
    setProjectId('');
    setStatus('');
    setPriority('');
    setDeadline('');

    router.push('/dashboard');
  }

  return (
    <section className="rounded-lg border bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Dashboard Filters
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Combine project, status, priority and deadline filters
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label
            htmlFor="project-filter"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Project
          </label>

          <select
            id="project-filter"
            value={projectId}
            onChange={(event) =>
              setProjectId(
                event.target.value
              )
            }
            className="w-full rounded-md border p-2 text-gray-900"
          >
            <option value="">
              All Projects
            </option>

            {projects.map((project) => (
              <option
                key={project.id}
                value={project.id}
              >
                {project.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="status-filter"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Status
          </label>

          <select
            id="status-filter"
            value={status}
            onChange={(event) =>
              setStatus(
                event.target
                  .value as DashboardStatus
              )
            }
            className="w-full rounded-md border p-2 text-gray-900"
          >
            <option value="">
              All Statuses
            </option>

            <option value="TODO">
              To Do
            </option>

            <option value="IN_PROGRESS">
              In Progress
            </option>

            <option value="DONE">
              Done
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="priority-filter"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Priority
          </label>

          <select
            id="priority-filter"
            value={priority}
            onChange={(event) =>
              setPriority(
                event.target
                  .value as DashboardPriority
              )
            }
            className="w-full rounded-md border p-2 text-gray-900"
          >
            <option value="">
              All Priorities
            </option>

            <option value="LOW">
              Low
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="HIGH">
              High
            </option>

            <option value="URGENT">
              Urgent
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="deadline-filter"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Deadline
          </label>

          <select
            id="deadline-filter"
            value={deadline}
            onChange={(event) =>
              setDeadline(
                event.target
                  .value as DashboardDeadline
              )
            }
            className="w-full rounded-md border p-2 text-gray-900"
          >
            <option value="">
              All Deadlines
            </option>

            <option value="OVERDUE">
              Overdue
            </option>

            <option value="UPCOMING">
              Upcoming
            </option>

            <option value="NO_DEADLINE">
              No Deadline
            </option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={applyFilters}
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:opacity-90"
        >
          Apply Filters
        </button>

        <button
          type="button"
          onClick={clearFilters}
          className="rounded-md border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Clear Filters
        </button>
      </div>
    </section>
  );
}