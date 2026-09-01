'use client';

import { useEffect, useState } from 'react';

type Notification = {
  id: number;
  userId: number;
  actorId: number | null;
  taskId: number | null;
  projectId: number | null;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationBell() {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  async function loadNotifications() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        '/api/notifications/unread'
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Failed to load notifications'
        );
      }

      setNotifications(
        result.data?.notifications || []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load notifications'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(
          '/api/notifications/unread'
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              'Failed to load notifications'
          );
        }

        if (!cancelled) {
          setNotifications(
            result.data?.notifications || []
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load notifications'
          );
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function markAsRead(
    notificationId: number
  ) {
    try {
      const response = await fetch(
        `/api/notifications/${notificationId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            action: 'read',
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Failed to mark notification as read'
        );
      }

      setNotifications((current) =>
        current.filter(
          (notification) =>
            notification.id !==
            notificationId
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update notification'
      );
    }
  }

  async function markAllAsRead() {
    try {
      const response = await fetch(
        '/api/notifications/read-all',
        {
          method: 'PATCH',
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Failed to mark notifications as read'
        );
      }

      setNotifications([]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update notifications'
      );
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);

          if (!open) {
            void loadNotifications();
          }
        }}
        className="relative rounded-full border bg-white p-2 text-gray-700 hover:bg-gray-50"
        aria-label="Notifications"
      >
        <span className="text-lg">
          🔔
        </span>

        {notifications.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
            {notifications.length > 99
              ? '99+'
              : notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border bg-white shadow-lg">
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <h3 className="font-semibold text-gray-900">
                Notifications
              </h3>

              <p className="text-xs text-gray-500">
                {notifications.length}{' '}
                unread
              </p>
            </div>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  void markAllAsRead();
                }}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {error && (
            <p className="m-3 rounded-md bg-red-100 p-2 text-xs text-red-700">
              {error}
            </p>
          )}

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="p-4 text-sm text-gray-500">
                Loading...
              </p>
            ) : notifications.length ===
              0 ? (
              <p className="p-4 text-sm text-gray-500">
                No unread notifications.
              </p>
            ) : (
              notifications.map(
                (notification) => (
                  <div
                    key={notification.id}
                    className="border-b p-4 last:border-b-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.type}
                        </p>

                        <p className="mt-1 text-sm text-gray-700">
                          {notification.message}
                        </p>

                        <p className="mt-2 text-xs text-gray-500">
                          {notification.createdAt}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          void markAsRead(
                            notification.id
                          );
                        }}
                        className="shrink-0 rounded border px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                      >
                        Read
                      </button>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}