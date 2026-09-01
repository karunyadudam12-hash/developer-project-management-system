'use client';

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

type ActivityTimelineProps = {
  activities: Activity[];
};

function getDotClass(type: string) {
  switch (type) {
    case 'TASK_CREATED':
      return 'bg-green-500';

    case 'STATUS_CHANGED':
      return 'bg-blue-500';

    case 'PRIORITY_CHANGED':
      return 'bg-orange-500';

    case 'ASSIGNED':
      return 'bg-purple-500';

    case 'TASK_UPDATED':
      return 'bg-gray-500';

    default:
      return 'bg-gray-400';
  }
}

export default function ActivityTimeline({
  activities,
}: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <p className="rounded-md border p-4 text-sm text-gray-500">
        No activity yet.
      </p>
    );
  }

  return (
    <div className="relative ml-2">
      <div className="absolute bottom-0 left-2 top-0 w-px bg-gray-200" />

      <div className="space-y-6">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="relative flex gap-4"
          >
            <div className="relative z-10 mt-1">
              <div
                className={`h-4 w-4 rounded-full border-2 border-white ${getDotClass(
                  activity.type
                )}`}
              />
            </div>

            <div className="min-w-0 flex-1 rounded-lg border bg-white p-4">
              <p className="font-medium text-gray-900">
                {activity.description}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                User {activity.actorId}
                {' • '}
                {activity.type}
                {' • '}
                {activity.createdAt}
              </p>

              {activity.metadata && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-gray-600">
                    Details
                  </summary>

                  <pre className="mt-2 overflow-x-auto rounded bg-gray-50 p-2 text-xs text-gray-600">
                    {activity.metadata}
                  </pre>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}