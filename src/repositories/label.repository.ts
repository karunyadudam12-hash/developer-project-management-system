import { db } from '../prisma/db';

export async function getLabels() {
  return db.orm.public.Label.all();
}

export async function getLabelById(labelId: number) {
  const labels = await getLabels();

  return (
    labels.find((label) => label.id === labelId) ??
    null
  );
}

export async function getLabelByName(name: string) {
  const labels = await getLabels();

  return (
    labels.find(
      (label) =>
        label.name.toLowerCase() ===
        name.toLowerCase()
    ) ?? null
  );
}

export async function createLabel(name: string) {
  return db.orm.public.Label.create({
    name,
  });
}

export async function getTaskLabels(taskId: number) {
  const taskLabels =
    await db.orm.public.TaskLabel.all();

  return taskLabels.filter(
    (taskLabel) =>
      taskLabel.taskId === taskId
  );
}

export async function getTaskLabel(
  taskId: number,
  labelId: number
) {
  const taskLabels =
    await db.orm.public.TaskLabel.all();

  return (
    taskLabels.find(
      (taskLabel) =>
        taskLabel.taskId === taskId &&
        taskLabel.labelId === labelId
    ) ?? null
  );
}

export async function attachLabelToTask(
  taskId: number,
  labelId: number
) {
  const existing =
    await getTaskLabel(
      taskId,
      labelId
    );

  if (existing) {
    return existing;
  }

  return db.orm.public.TaskLabel.create({
    taskId,
    labelId,
  });
}

export async function removeLabelFromTask(
  taskId: number,
  labelId: number
) {
  const existing =
    await getTaskLabel(
      taskId,
      labelId
    );

  if (!existing) {
    return null;
  }

  return db.orm.public.TaskLabel
    .where({ id: existing.id })
    .delete();
}