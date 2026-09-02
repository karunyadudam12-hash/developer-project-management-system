import DashboardCard from './DashboardCard';
import DashboardSection from './DashboardSection';

type ProjectStatisticsProps = {
  statistics: {
    total: number;
    active: number;
    completed: number;
    archived: number;
  };
};

export default function ProjectStatistics({
  statistics,
}: ProjectStatisticsProps) {
  return (
    <DashboardSection
      title="Project Statistics"
      description="Overview of your projects by current status"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Projects"
          value={statistics.total}
          description="All projects"
        />

        <DashboardCard
          title="Active"
          value={statistics.active}
          description="Currently active"
        />

        <DashboardCard
          title="Completed"
          value={statistics.completed}
          description="Completed projects"
        />

        <DashboardCard
          title="Archived"
          value={statistics.archived}
          description="Archived projects"
        />
      </div>
    </DashboardSection>
  );
}