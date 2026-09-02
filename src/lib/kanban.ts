export type KanbanStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'DONE';

export type KanbanTask = {
  id: number;
  title: string;
  description?: string | null;
  status: KanbanStatus;
  priority:
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'
    | 'URGENT';
  projectId: number;
  assigneeId?: number | null;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type KanbanColumn = {
  id: KanbanStatus;
  title: string;
  description: string;
};

export const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'TODO',
    title: 'To Do',
    description: 'Tasks that have not started yet',
  },
  {
    id: 'IN_PROGRESS',
    title: 'In Progress',
    description: 'Tasks currently being worked on',
  },
  {
    id: 'DONE',
    title: 'Done',
    description: 'Completed tasks',
  },
];

export function getTasksForColumn(
  tasks: KanbanTask[],
  status: KanbanStatus
) {
  return tasks.filter(
    (task) => task.status === status
  );
}