import { db } from '../prisma/db';

type SortField =
  | 'title'
  | 'priority'
  | 'status'
  | 'dueDate';

type SortDirection =
  | 'asc'
  | 'desc';

export async function getTasks(filters?: {
  projectId?: number;
  assigneeId?: number;
  search?: string;
  sortBy?: SortField;
  sortOrder?: SortDirection;
}) {
  const tasks = await db.orm.public.Task.all();

  const search =
    filters?.search?.trim().toLowerCase();

  const filteredTasks = tasks.filter((task) => {
    if (
      filters?.projectId !== undefined &&
      task.projectId !== filters.projectId
    ) {
      return false;
    }

    if (
      filters?.assigneeId !== undefined &&
      task.assigneeId !== filters.assigneeId
    ) {
      return false;
    }

    if (search) {
      const title =
        task.title.toLowerCase();

      const description =
        task.description?.toLowerCase() ?? '';

      if (
        !title.includes(search) &&
        !description.includes(search)
      ) {
        return false;
      }
    }

    return true;
  });

  const sortBy =
    filters?.sortBy ?? 'title';

  const sortOrder =
    filters?.sortOrder ?? 'asc';

  filteredTasks.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'title':
        comparison =
          a.title.localeCompare(b.title);
        break;

      case 'priority': {
        const priorityOrder: Record<
          string,
          number
        > = {
          LOW: 1,
          MEDIUM: 2,
          HIGH: 3,
          URGENT: 4,
        };

        comparison =
          (priorityOrder[a.priority] ?? 0) -
          (priorityOrder[b.priority] ?? 0);

        break;
      }

      case 'status': {
        const statusOrder: Record<
          string,
          number
        > = {
          TODO: 1,
          IN_PROGRESS: 2,
          DONE: 3,
        };

        comparison =
          (statusOrder[a.status] ?? 0) -
          (statusOrder[b.status] ?? 0);

        break;
      }

      case 'dueDate': {
        if (
          !a.dueDate &&
          !b.dueDate
        ) {
          comparison = 0;
        } else if (!a.dueDate) {
          comparison = 1;
        } else if (!b.dueDate) {
          comparison = -1;
        } else {
          comparison =
            new Date(a.dueDate).getTime() -
            new Date(b.dueDate).getTime();
        }

        break;
      }
    }

    return sortOrder === 'desc'
      ? -comparison
      : comparison;
  });

  return filteredTasks;
}

export async function getTaskById(
  taskId: number
) {
  const tasks = await db.orm.public.Task.all();

  return (
    tasks.find(
      (task) => task.id === taskId
    ) ?? null
  );
}

export async function createTask(data: {
  title: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  projectId: number;
  assigneeId?: number;
  dueDate?: string;
}) {
  return db.orm.public.Task.create({
    title: data.title,
    description: data.description,
    status: data.status ?? 'TODO',
    priority: data.priority ?? 'MEDIUM',
    projectId: data.projectId,
    assigneeId: data.assigneeId,
    dueDate: data.dueDate,
  });
}

export async function updateTask(
  taskId: number,
  data: {
    title?: string;
    description?: string;
    status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    projectId?: number;
    assigneeId?: number | null;
    dueDate?: string | null;
  }
) {
  const task =
    await getTaskById(taskId);

  if (!task) {
    return null;
  }

  return db.orm.public.Task
    .where({ id: taskId })
    .update(data);
}

export async function assignTask(
  taskId: number,
  assigneeId: number | null
) {
  const task =
    await getTaskById(taskId);

  if (!task) {
    return null;
  }

  return db.orm.public.Task
    .where({ id: taskId })
    .update({ assigneeId });
}

export async function updateTaskStatus(
  taskId: number,
  status:
    | 'TODO'
    | 'IN_PROGRESS'
    | 'DONE'
) {
  const task =
    await getTaskById(taskId);

  if (!task) {
    return null;
  }

  return db.orm.public.Task
    .where({ id: taskId })
    .update({ status });
}

export async function updateTaskPriority(
  taskId: number,
  priority:
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'
    | 'URGENT'
) {
  const task =
    await getTaskById(taskId);

  if (!task) {
    return null;
  }

  return db.orm.public.Task
    .where({ id: taskId })
    .update({ priority });
}

export async function deleteTask(
  taskId: number
) {
  const task =
    await getTaskById(taskId);

  if (!task) {
    return null;
  }

  return db.orm.public.Task
    .where({ id: taskId })
    .delete();
}