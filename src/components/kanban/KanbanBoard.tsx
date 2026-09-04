'use client';

import Link from 'next/link';
import {
  useMemo,
  useState,
  type DragEvent,
} from 'react';

import type {
  KanbanStatus,
  KanbanTask,
} from '@/src/lib/kanban';

import {
  KANBAN_COLUMNS,
  getTasksForColumn,
} from '@/src/lib/kanban';

import { canMoveTask } from '@/src/lib/kanban-rules';

type KanbanBoardProps = {
  tasks: KanbanTask[];
  onTaskMove?: (
    taskId: number,
    status: KanbanStatus
  ) => void;
};

function getPriorityClasses(
  priority: KanbanTask['priority']
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

function KanbanTaskCard({
  task,
  onDragStart,
}: {
  task: KanbanTask;
  onDragStart: (
    event: DragEvent<HTMLElement>,
    task: KanbanTask
  ) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(event) =>
        onDragStart(event, task)
      }
      className="w-full cursor-grab rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 flex-1 break-words font-semibold text-gray-900">
          {task.title}
        </h3>

        <span
          className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${getPriorityClasses(
            task.priority
          )}`}
        >
          {task.priority}
        </span>
      </div>

      <p className="mt-2 line-clamp-3 break-words text-sm text-gray-600">
        {task.description ||
          'No description'}
      </p>

      <div className="mt-4 space-y-1 text-xs text-gray-500">
        <p>
          Project: #{task.projectId}
        </p>

        <p>
          Assignee:{' '}
          {task.assigneeId ?? 'Unassigned'}
        </p>

        <p>
          Deadline:{' '}
          {formatDueDate(
            task.dueDate
          )}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-gray-400">
          Task #{task.id}
        </span>

        <Link
          href={`/tasks/${task.id}`}
          draggable={false}
          onClick={(event) =>
            event.stopPropagation()
          }
          className="rounded-md border px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          View Task
        </Link>
      </div>
    </div>
  );
}

function KanbanColumn({
  status,
  title,
  description,
  tasks,
  isDropTarget,
  onDragOver,
  onDrop,
  onDragStart,
}: {
  status: KanbanStatus;
  title: string;
  description: string;
  tasks: KanbanTask[];
  isDropTarget: boolean;
  onDragOver: (
    event: DragEvent<HTMLElement>
  ) => void;
  onDrop: (
    event: DragEvent<HTMLElement>,
    status: KanbanStatus
  ) => void;
  onDragStart: (
    event: DragEvent<HTMLElement>,
    task: KanbanTask
  ) => void;
}) {
  return (
    <section
      onDragOver={onDragOver}
      onDrop={(event) =>
        onDrop(event, status)
      }
      className={`flex min-h-[360px] w-full min-w-0 flex-1 flex-col rounded-lg border p-3 sm:min-h-[400px] sm:p-4 ${
        isDropTarget
          ? 'border-blue-400 bg-blue-50'
          : 'bg-gray-50'
      } transition-colors`}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="min-w-0 break-words font-semibold text-gray-900">
            {title}
          </h2>

          <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-600">
            {tasks.length}
          </span>
        </div>

        <p className="mt-1 break-words text-xs text-gray-500">
          {description}
        </p>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {tasks.length === 0 ? (
          <div className="flex min-h-[140px] flex-1 items-center justify-center rounded-md border border-dashed bg-white p-4 text-center text-sm text-gray-400">
            Drop tasks here
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanTaskCard
              key={task.id}
              task={task}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default function KanbanBoard({
  tasks,
  onTaskMove,
}: KanbanBoardProps) {
  const [draggedTaskId, setDraggedTaskId] =
    useState<number | null>(null);

  const [draggedTaskStatus, setDraggedTaskStatus] =
    useState<KanbanStatus | null>(null);

  const [dropTarget, setDropTarget] =
    useState<KanbanStatus | null>(null);

  const columns = useMemo(() => {
    return KANBAN_COLUMNS.map(
      (column) => ({
        ...column,
        tasks: getTasksForColumn(
          tasks,
          column.id
        ),
      })
    );
  }, [tasks]);

  function handleDragStart(
    event: DragEvent<HTMLElement>,
    task: KanbanTask
  ) {
    setDraggedTaskId(task.id);
    setDraggedTaskStatus(task.status);

    event.dataTransfer.effectAllowed =
      'move';

    event.dataTransfer.setData(
      'text/plain',
      String(task.id)
    );
  }

  function handleDragOver(
    event: DragEvent<HTMLElement>
  ) {
    event.preventDefault();

    event.dataTransfer.dropEffect =
      'move';
  }

  function handleDrop(
    event: DragEvent<HTMLElement>,
    targetStatus: KanbanStatus
  ) {
    event.preventDefault();

    if (
      draggedTaskId === null ||
      draggedTaskStatus === null
    ) {
      setDropTarget(null);
      return;
    }

    if (
      draggedTaskStatus === targetStatus
    ) {
      setDraggedTaskId(null);
      setDraggedTaskStatus(null);
      setDropTarget(null);
      return;
    }

    if (
      !canMoveTask(
        draggedTaskStatus,
        targetStatus
      )
    ) {
      setDraggedTaskId(null);
      setDraggedTaskStatus(null);
      setDropTarget(null);
      return;
    }

    onTaskMove?.(
      draggedTaskId,
      targetStatus
    );

    setDraggedTaskId(null);
    setDraggedTaskStatus(null);
    setDropTarget(null);
  }

  function handleDragEnter(
    status: KanbanStatus
  ) {
    setDropTarget(status);
  }

  function handleDragLeave(
    event: DragEvent<HTMLElement>
  ) {
    const currentTarget =
      event.currentTarget;

    const relatedTarget =
      event.relatedTarget;

    if (
      relatedTarget instanceof Node &&
      currentTarget.contains(
        relatedTarget
      )
    ) {
      return;
    }

    setDropTarget(null);
  }

  return (
    <div className="w-full overflow-x-hidden pb-4">
<div
  className="
    grid
    w-full
    min-w-0
    grid-cols-1
    gap-4
    md:grid-cols-2
    lg:grid-cols-3
  "
>
        {columns.map((column) => (
          <div
            key={column.id}
            className="w-full min-w-0 lg:flex-1"
            onDragEnter={() =>
              handleDragEnter(
                column.id
              )
            }
            onDragLeave={handleDragLeave}
          >
            <KanbanColumn
              status={column.id}
              title={column.title}
              description={
                column.description
              }
              tasks={column.tasks}
              isDropTarget={
                dropTarget ===
                column.id
              }
              onDragOver={
                handleDragOver
              }
              onDrop={handleDrop}
              onDragStart={
                handleDragStart
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}