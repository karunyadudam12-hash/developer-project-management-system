import { db } from '../prisma/db';

export type DashboardFilters = {
  projectId?: number;
  status?:
    | 'TODO'
    | 'IN_PROGRESS'
    | 'DONE';
  priority?:
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'
    | 'URGENT';
  deadline?:
    | 'OVERDUE'
    | 'UPCOMING'
    | 'NO_DEADLINE';
};

export type DashboardData = {
  projects: Awaited<
    ReturnType<
      typeof db.orm.public.Project.all
    >
  >;
  tasks: Awaited<
    ReturnType<
      typeof db.orm.public.Task.all
    >
  >;
  users: Awaited<
    ReturnType<
      typeof db.orm.public.User.all
    >
  >;
  activities: Awaited<
    ReturnType<
      typeof db.orm.public.Activity.all
    >
  >;
};

function getStartOfToday() {
  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  return today;
}

function filterTasks(
  tasks: DashboardData['tasks'],
  filters?: DashboardFilters
) {
  const startOfToday =
    getStartOfToday();

  return tasks.filter((task) => {
    if (
      filters?.projectId !==
        undefined &&
      task.projectId !==
        filters.projectId
    ) {
      return false;
    }

    if (
      filters?.status !== undefined &&
      task.status !==
        filters.status
    ) {
      return false;
    }

    if (
      filters?.priority !==
        undefined &&
      task.priority !==
        filters.priority
    ) {
      return false;
    }

    if (filters?.deadline) {
      if (
        filters.deadline ===
        'NO_DEADLINE'
      ) {
        return (
          task.dueDate === null ||
          task.dueDate === undefined
        );
      }

      if (
        filters.deadline ===
        'OVERDUE'
      ) {
        if (!task.dueDate) {
          return false;
        }

        return (
          new Date(task.dueDate) <
          startOfToday
        );
      }

      if (
        filters.deadline ===
        'UPCOMING'
      ) {
        if (!task.dueDate) {
          return false;
        }

        return (
          new Date(task.dueDate) >=
          startOfToday
        );
      }
    }

    return true;
  });
}

export async function getDashboardData(): Promise<DashboardData> {
  const [
    projects,
    tasks,
    users,
    activities,
  ] = await Promise.all([
    db.orm.public.Project.all(),
    db.orm.public.Task.all(),
    db.orm.public.User.all(),
    db.orm.public.Activity.all(),
  ]);

  return {
    projects,
    tasks,
    users,
    activities,
  };
}

export async function getProjectStatistics(
  filters?: DashboardFilters,
  data?: DashboardData
) {
  const dashboardData =
    data ??
    (await getDashboardData());

  let projects =
    dashboardData.projects;

  if (
    filters?.projectId !==
    undefined
  ) {
    projects =
      projects.filter(
        (project) =>
          project.id ===
          filters.projectId
      );
  }

  const active =
    projects.filter(
      (project) =>
        project.status ===
        'ACTIVE'
    ).length;

  const completed =
    projects.filter(
      (project) =>
        project.status ===
        'COMPLETED'
    ).length;

  const archived =
    projects.filter(
      (project) =>
        project.status ===
        'ARCHIVED'
    ).length;

  return {
    total: projects.length,
    active,
    completed,
    archived,

    byStatus: {
      ACTIVE: active,
      COMPLETED: completed,
      ARCHIVED: archived,
    },
  };
}

export async function getDashboardProjects(
  data?: DashboardData
) {
  const dashboardData =
    data ??
    (await getDashboardData());

  return dashboardData.projects
    .map((project) => ({
      id: project.id,
      label: project.name,
      status: project.status,
    }))
    .sort(
      (a, b) =>
        a.id - b.id
    );
}

export async function getTaskStatistics(
  filters?: DashboardFilters,
  data?: DashboardData
) {
  const dashboardData =
    data ??
    (await getDashboardData());

  const tasks =
    filterTasks(
      dashboardData.tasks,
      filters
    );

  const todo = tasks.filter(
    (task) =>
      task.status === 'TODO'
  ).length;

  const inProgress = tasks.filter(
    (task) =>
      task.status ===
      'IN_PROGRESS'
  ).length;

  const done = tasks.filter(
    (task) =>
      task.status === 'DONE'
  ).length;

  const low = tasks.filter(
    (task) =>
      task.priority === 'LOW'
  ).length;

  const medium = tasks.filter(
    (task) =>
      task.priority === 'MEDIUM'
  ).length;

  const high = tasks.filter(
    (task) =>
      task.priority === 'HIGH'
  ).length;

  const urgent = tasks.filter(
    (task) =>
      task.priority === 'URGENT'
  ).length;

  const startOfToday =
    getStartOfToday();

  const overdue = tasks.filter(
    (task) => {
      if (!task.dueDate) {
        return false;
      }

      return (
        new Date(task.dueDate) <
        startOfToday
      );
    }
  ).length;

  const upcoming = tasks.filter(
    (task) => {
      if (!task.dueDate) {
        return false;
      }

      return (
        new Date(task.dueDate) >=
        startOfToday
      );
    }
  ).length;

  return {
    total: tasks.length,
    todo,
    inProgress,
    done,
    low,
    medium,
    high,
    urgent,
    overdue,
    upcoming,

    byStatus: {
      TODO: todo,
      IN_PROGRESS: inProgress,
      DONE: done,
    },

    byPriority: {
      LOW: low,
      MEDIUM: medium,
      HIGH: high,
      URGENT: urgent,
    },
  };
}

export async function getTeamStatistics(
  filters?: DashboardFilters,
  data?: DashboardData
) {
  const dashboardData =
    data ??
    (await getDashboardData());

  const tasks =
    filterTasks(
      dashboardData.tasks,
      filters
    );

  const assignedTasks =
    tasks.filter(
      (task) =>
        task.assigneeId !== null &&
        task.assigneeId !==
          undefined
    ).length;

  const unassignedTasks =
    tasks.filter(
      (task) =>
        task.assigneeId === null ||
        task.assigneeId ===
          undefined
    ).length;

  const totalTasks =
    tasks.length;

  const assignedPercentage =
    totalTasks > 0
      ? Math.round(
          (assignedTasks /
            totalTasks) *
            100
        )
      : 0;

  const unassignedPercentage =
    totalTasks > 0
      ? Math.round(
          (unassignedTasks /
            totalTasks) *
            100
        )
      : 0;

  const tasksPerMember =
    dashboardData.users.map(
      (user) => ({
        userId: user.id,
        name: user.name,
        role: user.role,

        taskCount: tasks.filter(
          (task) =>
            task.assigneeId ===
            user.id
        ).length,
      })
    );

  return {
    members:
      dashboardData.users.length,

    assignedTasks,
    unassignedTasks,
    assignedPercentage,
    unassignedPercentage,
    tasksPerMember,
  };
}

export async function getProductivityMetrics(
  filters?: DashboardFilters,
  data?: DashboardData
) {
  const dashboardData =
    data ??
    (await getDashboardData());

  const tasks =
    filterTasks(
      dashboardData.tasks,
      filters
    );

  const totalTasks =
    tasks.length;

  const completedTasks =
    tasks.filter(
      (task) =>
        task.status === 'DONE'
    ).length;

  const startOfToday =
    getStartOfToday();

  const overdueTasks =
    tasks.filter(
      (task) => {
        if (!task.dueDate) {
          return false;
        }

        return (
          new Date(task.dueDate) <
          startOfToday
        );
      }
    ).length;

  const completionRate =
    totalTasks > 0
      ? Math.round(
          (completedTasks /
            totalTasks) *
            100
        )
      : 0;

  const overdueRate =
    totalTasks > 0
      ? Math.round(
          (overdueTasks /
            totalTasks) *
            100
        )
      : 0;

  return {
    totalTasks,
    completedTasks,
    completionRate,
    overdueTasks,
    overdueRate,
  };
}

export async function getRecentActivities(
  limit = 5,
  filters?: DashboardFilters,
  data?: DashboardData
) {
  const dashboardData =
    data ??
    (await getDashboardData());

  let activities =
    dashboardData.activities;

  if (
    filters?.projectId !==
    undefined
  ) {
    activities =
      activities.filter(
        (activity) =>
          activity.projectId ===
          filters.projectId
      );
  }

  return activities
    .sort(
      (a, b) =>
        new Date(
          b.createdAt
        ).getTime() -
        new Date(
          a.createdAt
        ).getTime()
    )
    .slice(0, limit);
}
