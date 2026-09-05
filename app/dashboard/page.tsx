import type { Metadata } from 'next';

import { requireFrontendAuth } from '@/src/auth/route-protection';

import {
  getProjectStatistics,
  getTaskStatistics,
  getTeamStatistics,
  getProductivityMetrics,
  getRecentActivities,
  getDashboardProjects,
  getDashboardData,
} from '@/src/repositories/dashboard.repository';

import type { DashboardFilters } from '@/src/repositories/dashboard.repository';

import ProjectStatistics from '@/src/components/dashboard/ProjectStatistics';
import TaskStatistics from '@/src/components/dashboard/TaskStatistics';
import TeamStatistics from '@/src/components/dashboard/TeamStatistics';
import ProductivityMetrics from '@/src/components/dashboard/ProductivityMetrics';

import TaskStatusChart from '@/src/components/dashboard/TaskStatusChart';
import PriorityDistributionChart from '@/src/components/dashboard/PriorityDistributionChart';
import ProductivityChart from '@/src/components/dashboard/ProductivityChart';

import RecentActivity from '@/src/components/dashboard/RecentActivity';
import DashboardFiltersComponent from '@/src/components/dashboard/DashboardFilters';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'DPMS project management dashboard',
};

type DashboardPageProps = {
  searchParams: Promise<{
    projectId?: string;
    status?: string;
    priority?: string;
    deadline?: string;
  }>;
};

function parseFilters(
  params: {
    projectId?: string;
    status?: string;
    priority?: string;
    deadline?: string;
  }
): DashboardFilters {
  const filters: DashboardFilters = {};

  if (params.projectId) {
    const projectId =
      Number(params.projectId);

    if (
      Number.isInteger(projectId) &&
      projectId > 0
    ) {
      filters.projectId =
        projectId;
    }
  }

  if (
    params.status === 'TODO' ||
    params.status === 'IN_PROGRESS' ||
    params.status === 'DONE'
  ) {
    filters.status =
      params.status;
  }

  if (
    params.priority === 'LOW' ||
    params.priority === 'MEDIUM' ||
    params.priority === 'HIGH' ||
    params.priority === 'URGENT'
  ) {
    filters.priority =
      params.priority;
  }

  if (
    params.deadline === 'OVERDUE' ||
    params.deadline === 'UPCOMING' ||
    params.deadline === 'NO_DEADLINE'
  ) {
    filters.deadline =
      params.deadline;
  }

  return filters;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const user =
    await requireFrontendAuth();

  const params =
    await searchParams;

  const filters =
    parseFilters(params);

  const dashboardData =
    await getDashboardData();

  const [
    projectStatistics,
    taskStatistics,
    teamStatistics,
    productivityMetrics,
    recentActivities,
    dashboardProjects,
  ] = await Promise.all([
    getProjectStatistics(
      filters,
      dashboardData
    ),

    getTaskStatistics(
      filters,
      dashboardData
    ),

    getTeamStatistics(
      filters,
      dashboardData
    ),

    getProductivityMetrics(
      filters,
      dashboardData
    ),

    getRecentActivities(
      5,
      filters,
      dashboardData
    ),

    getDashboardProjects(
      dashboardData
    ),
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          Welcome, {user.name}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          Role: {user.role}
        </p>
      </div>

      <div className="mt-8 space-y-6">
        <DashboardFiltersComponent
          projects={
            dashboardProjects
          }
        />

        <ProjectStatistics
          statistics={
            projectStatistics
          }
        />

        <TaskStatistics
          statistics={
            taskStatistics
          }
        />

        <TeamStatistics
          statistics={
            teamStatistics
          }
        />

        <ProductivityMetrics
          metrics={
            productivityMetrics
          }
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <TaskStatusChart
            data={
              taskStatistics.byStatus
            }
          />

          <PriorityDistributionChart
            data={
              taskStatistics.byPriority
            }
          />
        </div>

        <ProductivityChart
          data={{
            totalTasks:
              productivityMetrics.totalTasks,

            completedTasks:
              productivityMetrics.completedTasks,

            overdueTasks:
              productivityMetrics.overdueTasks,
          }}
        />

        <RecentActivity
          activities={
            recentActivities
          }
        />
      </div>
    </main>
  );
}