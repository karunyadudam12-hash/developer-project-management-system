import { db } from '../prisma/db';

export async function getNotificationsByUserId(
  userId: number
) {
  const notifications =
    await db.orm.public.Notification.all();

  return notifications
    .filter(
      (notification) =>
        notification.userId === userId
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
}

export async function getUnreadNotificationsByUserId(
  userId: number
) {
  const notifications =
    await getNotificationsByUserId(userId);

  return notifications.filter(
    (notification) =>
      !notification.isRead
  );
}

export async function getNotificationById(
  notificationId: number
) {
  const notifications =
    await db.orm.public.Notification.all();

  return (
    notifications.find(
      (notification) =>
        notification.id === notificationId
    ) ?? null
  );
}

export async function createNotification(data: {
  userId: number;
  actorId?: number | null;
  taskId?: number | null;
  projectId?: number | null;
  type: string;
  message: string;
}) {
  return db.orm.public.Notification.create({
    userId: data.userId,
    actorId: data.actorId ?? null,
    taskId: data.taskId ?? null,
    projectId: data.projectId ?? null,
    type: data.type,
    message: data.message,
    isRead: false,
  });
}

export async function markNotificationAsRead(
  notificationId: number
) {
  return db.orm.public.Notification
    .where({ id: notificationId })
    .update({
      isRead: true,
    });
}

export async function markNotificationAsUnread(
  notificationId: number
) {
  return db.orm.public.Notification
    .where({ id: notificationId })
    .update({
      isRead: false,
    });
}

export async function markAllNotificationsAsRead(
  userId: number
) {
  const notifications =
    await getNotificationsByUserId(userId);

  for (const notification of notifications) {
    if (!notification.isRead) {
      await markNotificationAsRead(
        notification.id
      );
    }
  }

  return true;
}