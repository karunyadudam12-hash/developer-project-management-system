import DashboardCard from './DashboardCard';
import DashboardSection from './DashboardSection';

type TeamStatistics = {
  members: number;
  assignedTasks: number;
  unassignedTasks: number;
  assignedPercentage: number;
  unassignedPercentage: number;
  tasksPerMember: Array<{
    userId: number;
name: string | null;
    role: string;
    taskCount: number;
  }>;
};

type TeamStatisticsProps = {
  statistics: TeamStatistics;
};

export default function TeamStatistics({
  statistics,
}: TeamStatisticsProps) {
  return (
    <DashboardSection
      title="Team Statistics"
      description="Overview of team members and task assignment"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Team Members"
          value={statistics.members}
          description="Total users"
        />

        <DashboardCard
          title="Assigned Tasks"
          value={statistics.assignedTasks}
          description={`${statistics.assignedPercentage}% of all tasks`}
        />

        <DashboardCard
          title="Unassigned Tasks"
          value={statistics.unassignedTasks}
          description={`${statistics.unassignedPercentage}% of all tasks`}
        />

        <DashboardCard
          title="Total Workload"
          value={statistics.assignedTasks}
          description="Tasks currently assigned"
        />
      </div>

      <div className="mt-6">
        <h3 className="text-base font-semibold text-gray-900">
          Tasks per Member
        </h3>

        {statistics.tasksPerMember.length ===
        0 ? (
          <p className="mt-3 rounded-md border p-4 text-sm text-gray-500">
            No team members found.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-700">
                    Member
                  </th>

                  <th className="px-4 py-3 font-medium text-gray-700">
                    Role
                  </th>

                  <th className="px-4 py-3 font-medium text-gray-700">
                    Tasks
                  </th>
                </tr>
              </thead>

              <tbody>
                {statistics.tasksPerMember.map(
                  (member) => (
                    <tr
                      key={member.userId}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
{member.name || `User ${member.userId}`}
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {member.role}
                      </td>

                      <td className="px-4 py-3 font-medium text-gray-900">
                        {member.taskCount}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardSection>
  );
}