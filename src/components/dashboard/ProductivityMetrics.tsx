import DashboardCard from './DashboardCard';
import DashboardSection from './DashboardSection';

type ProductivityMetricsProps = {
  metrics: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    overdueTasks: number;
    overdueRate: number;
  };
};

export default function ProductivityMetrics({
  metrics,
}: ProductivityMetricsProps) {
  return (
    <DashboardSection
      title="Productivity Metrics"
      description="Overview of task completion and deadline performance"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <DashboardCard
          title="Total Tasks"
          value={metrics.totalTasks}
          description="All tasks"
        />

        <DashboardCard
          title="Completed"
          value={metrics.completedTasks}
          description="Finished tasks"
        />

        <DashboardCard
          title="Completion Rate"
          value={`${metrics.completionRate}%`}
          description="Tasks completed"
        />

        <DashboardCard
          title="Overdue Tasks"
          value={metrics.overdueTasks}
          description="Past deadline"
        />

        <DashboardCard
          title="Overdue Rate"
          value={`${metrics.overdueRate}%`}
          description="Tasks overdue"
        />
      </div>
    </DashboardSection>
  );
}