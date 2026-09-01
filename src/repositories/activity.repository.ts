import { db } from '../prisma/db';

export async function getActivities() {
  const activities =
    await db.orm.public.Activity.all();

  return activities.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );
}

export async function getActivitiesByTaskId(
  taskId: number
) {
  const activities =
    await db.orm.public.Activity.all();

  return activities
    .filter(
      (activity) =>
        activity.taskId === taskId
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
}

export async function getActivitiesByProjectId(
  projectId: number
) {
  const activities =
    await db.orm.public.Activity.all();

  return activities
    .filter(
      (activity) =>
        activity.projectId === projectId
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
}

export async function getActivityById(
  activityId: number
) {
  const activities =
    await db.orm.public.Activity.all();

  return (
    activities.find(
      (activity) =>
        activity.id === activityId
    ) ?? null
  );
}

export async function createActivity(data: {
  actorId: number;
  projectId?: number | null;
  taskId?: number | null;
  type: string;
  description: string;
  metadata?: string | null;
}) {
  return db.orm.public.Activity.create({
    actorId: data.actorId,
    projectId: data.projectId ?? null,
    taskId: data.taskId ?? null,
    type: data.type,
    description: data.description,
    metadata: data.metadata ?? null,
  });
}

export async function logTaskActivity(data: {
  actorId: number;
  taskId: number;
  projectId: number;
  type: string;
  description: string;
  metadata?: string | null;
}) {
  return createActivity({
    actorId: data.actorId,
    taskId: data.taskId,
    projectId: data.projectId,
    type: data.type,
    description: data.description,
    metadata: data.metadata ?? null,
  });
}

export async function logProjectActivity(data: {
  actorId: number;
  projectId: number;
  type: string;
  description: string;
  metadata?: string | null;
}) {
  return createActivity({
    actorId: data.actorId,
    projectId: data.projectId,
    type: data.type,
    description: data.description,
    metadata: data.metadata ?? null,
  });
}