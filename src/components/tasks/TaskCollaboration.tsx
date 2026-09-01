'use client';

import { useEffect, useState } from 'react';
import TaskComments from './TaskComments';
import ActivityTimeline from './ActivityTimeline';

type Activity = {
  id: number;
  actorId: number;
  projectId: number | null;
  taskId: number | null;
  type: string;
  description: string;
  metadata: string | null;
  createdAt: string;
};

type TaskCollaborationProps = {
  taskId: number;
};

export default function TaskCollaboration({
  taskId,
}: TaskCollaborationProps) {
  const [activities, setActivities] =
    useState<Activity[]>([]);

  const [loadingActivities, setLoadingActivities] =
    useState(true);

  const [activityError, setActivityError] =
    useState('');

  async function loadActivities() {
    try {
      setActivityError('');

      const response = await fetch(
        `/api/tasks/${taskId}/activities`
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Failed to load activity'
        );
      }

      setActivities(
        result.data || []
      );
    } catch (err) {
      setActivityError(
        err instanceof Error
          ? err.message
          : 'Failed to load activity'
      );
    } finally {
      setLoadingActivities(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(
          `/api/tasks/${taskId}/activities`
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              'Failed to load activity'
          );
        }

        if (!cancelled) {
          setActivities(
            result.data || []
          );
        }
      } catch (err) {
        if (!cancelled) {
          setActivityError(
            err instanceof Error
              ? err.message
              : 'Failed to load activity'
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingActivities(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [taskId]);

  return (
    <section className="mt-8 border-t pt-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">
          Collaboration
        </h2>
      </div>

      <TaskComments taskId={taskId} />

      <div className="mt-8 border-t pt-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">
            Activity History
          </h3>

          <button
            type="button"
            onClick={() => {
              void loadActivities();
            }}
            disabled={loadingActivities}
            className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {loadingActivities
              ? 'Loading...'
              : 'Refresh'}
          </button>
        </div>

        {activityError && (
          <p className="mt-4 rounded-md bg-red-100 p-3 text-sm text-red-700">
            {activityError}
          </p>
        )}

        <div className="mt-4">
          {loadingActivities ? (
            <p className="text-sm text-gray-500">
              Loading activity...
            </p>
          ) : (
            <ActivityTimeline
              activities={activities}
            />
          )}
        </div>
      </div>
    </section>
  );
}