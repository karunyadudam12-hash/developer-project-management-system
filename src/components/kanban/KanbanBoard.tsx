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
    <article
      draggable
      onDragStart={(event) =>
        onDragStart(event, task)
      }
      className="
        group
        w-full
        min-w-0
        cursor-grab
        rounded-xl
        border
        border-gray-200
        bg-white
        p-3
        shadow-sm
        transition
        hover:-translate-y-0.5
        hover:shadow-md
        active:cursor-grabbing
        sm:p-4
      "
    >
      <div className="flex min-w-0 items-start gap-2">
        <h3
          className="
            min-w-0
            flex-1
            break-words
            text-sm
            font-semibold
            leading-5
            text-gray-900
            sm:text-base
          "
        >
          {task.title}
        </h3>

        <span
          className={`
            shrink-0
            whitespace-nowrap
            rounded-full
            px-2
            py-1
            text-[10px]
            font-semibold
            sm:text-xs
            ${getPriorityClasses(task.priority)}
          `}
        >
          {task.priority}
        </span>
      </div>

      <p
        className="
          mt-2
          line-clamp-3
          break-words
          text-xs
          leading-5
          text-gray-600
          sm:text-sm
        "
      >
        {task.description ||
          'No description'}
      </p>

      <div
        className="
          mt-3
          space-y-1
          text-[11px]
          leading-4
          text-gray-500
          sm:mt-4
          sm:text-xs
        "
      >
        <p className="break-words">
          Project: #{task.projectId}
        </p>

        <p className="break-words">
          Assignee:{' '}
          {task.assigneeId ??
            'Unassigned'}
        </p>

        <p className="break-words">
          Deadline:{' '}
          {formatDueDate(
            task.dueDate
          )}
        </p>
      </div>

      <div
        className="
          mt-3
          flex
          flex-wrap
          items-center
          justify-between
          gap-2
          sm:mt-4
        "
      >
        <span className="text-[11px] text-gray-400 sm:text-xs">
          Task #{task.id}
        </span>

        <Link
          href={`/tasks/${task.id}`}
          draggable={false}
          onClick={(event) =>
            event.stopPropagation()
          }
          className="
            shrink-0
            rounded-md
            border
            border-gray-300
            px-2.5
            py-1.5
            text-[11px]
            font-medium
            text-gray-700
            transition
            hover:bg-gray-50
            sm:px-3
            sm:text-xs
          "
        >
          View Task
        </Link>
      </div>
    </article>
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
      className={`
        flex
        min-h-[360px]
        w-full
        min-w-0
        flex-col
        rounded-xl
        border
        border-gray-200
        p-3
        transition-colors
        sm:min-h-[420px]
        sm:p-4
        ${
          isDropTarget
            ? 'border-blue-400 bg-blue-50'
            : 'bg-gray-50'
        }
      `}
    >
      <header className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="break-words text-sm font-bold text-gray-900 sm:text-base">
              {title}
            </h2>

            <p className="mt-1 break-words text-[11px] leading-4 text-gray-500 sm:text-xs">
              {description}
            </p>
          </div>

          <span className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-white px-2 text-xs font-semibold text-gray-600 shadow-sm">
            {tasks.length}
          </span>
        </div>
      </header>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {tasks.length === 0 ? (
          <div
            className="
              flex
              min-h-[140px]
              flex-1
              items-center
              justify-center
              rounded-lg
              border
              border-dashed
              border-gray-300
              bg-white
              p-4
              text-center
              text-xs
              text-gray-400
              sm:text-sm
            "
          >
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
    <div className="w-full min-w-0">
      {/* Mobile */}
      <div className="flex w-full flex-col gap-4 md:hidden">
        {columns.map((column) => (
          <div
            key={column.id}
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

      {/* Tablet + Desktop */}
      <div
        className="
          hidden
          w-full
          min-w-0
          md:block
        "
      >
        <div
          className="
            w-full
            overflow-x-auto
            pb-3
            md:scrollbar-thin
          "
        >
          <div
            className="
              grid
              min-w-[780px]
              grid-cols-3
              gap-4
              xl:min-w-0
            "
          >
            {columns.map((column) => (
              <div
                key={column.id}
                className="
                  min-w-0
                "
                onDragEnter={() =>
                  handleDragEnter(
                    column.id
                  )
                }
                onDragLeave={
                  handleDragLeave
                }
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
      </div>
    </div>
  );
}