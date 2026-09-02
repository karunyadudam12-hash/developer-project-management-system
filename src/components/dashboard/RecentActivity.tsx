import Link from 'next/link';

import DashboardSection from './DashboardSection';

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

type RecentActivityProps = {
  activities: Activity[];
};

function formatActivityDate(
  value: string
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export default function RecentActivity({
  activities,
}: RecentActivityProps) {
  return (
    <DashboardSection
      title="Recent Activity"
      description="Latest actions across tasks and projects"
    >
      {activities.length === 0 ? (
        <p className="rounded-md border p-4 text-sm text-gray-500">
          No recent activity.
        </p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="rounded-lg border bg-gray-50 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">
                    {activity.description}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    User {activity.actorId}
                    {' • '}
                    {activity.type}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {formatActivityDate(
                      activity.createdAt
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {activity.taskId !== null && (
                    <Link
                      href={`/tasks/${activity.taskId}`}
                      className="rounded-md border bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                    >
                      View Task
                    </Link>
                  )}

                  {activity.projectId !== null && (
                    <Link
                      href={`/projects/${activity.projectId}`}
                      className="rounded-md border bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                    >
                      View Project
                    </Link>
                  )}
                </div>
              </div>

              {activity.metadata && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-medium text-gray-600">
                    Details
                  </summary>

                  <pre className="mt-2 overflow-x-auto rounded-md bg-white p-3 text-xs text-gray-600">
                    {activity.metadata}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}