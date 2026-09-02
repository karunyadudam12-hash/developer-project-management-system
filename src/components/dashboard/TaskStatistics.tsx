import DashboardCard from './DashboardCard';
import DashboardSection from './DashboardSection';

type TaskStatisticsProps = {
  statistics: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
    low: number;
    medium: number;
    high: number;
    urgent: number;
    overdue: number;
    upcoming: number;
  };
};

export default function TaskStatistics({
  statistics,
}: TaskStatisticsProps) {
  return (
    <DashboardSection
      title="Task Statistics"
      description="Overview of tasks by status, priority and deadline"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <DashboardCard
          title="Total Tasks"
          value={statistics.total}
          description="All tasks"
        />

        <DashboardCard
          title="To Do"
          value={statistics.todo}
          description="Not started"
        />

        <DashboardCard
          title="In Progress"
          value={statistics.inProgress}
          description="Currently active"
        />

        <DashboardCard
          title="Completed"
          value={statistics.done}
          description="Finished tasks"
        />

        <DashboardCard
          title="Overdue"
          value={statistics.overdue}
          description="Past deadline"
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <DashboardCard
          title="Upcoming"
          value={statistics.upcoming}
          description="Today or later"
        />

        <DashboardCard
          title="Low Priority"
          value={statistics.low}
          description="Low priority tasks"
        />

        <DashboardCard
          title="Medium Priority"
          value={statistics.medium}
          description="Medium priority tasks"
        />

        <DashboardCard
          title="High Priority"
          value={statistics.high}
          description="High priority tasks"
        />

        <DashboardCard
          title="Urgent"
          value={statistics.urgent}
          description="Urgent tasks"
        />
      </div>
    </DashboardSection>
  );
}