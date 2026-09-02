export type DashboardStats = {
  projects: {
    total: number;
    active: number;
    completed: number;
    archived: number;
  };

  tasks: {
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

  team: {
    members: number;
    assignedTasks: number;
    unassignedTasks: number;
  };

  productivity: {
    completionRate: number;
    overdueRate: number;
  };
};

export type DashboardActivity = {
  id: number;
  actorId: number;
  projectId: number | null;
  taskId: number | null;
  type: string;
  description: string;
  metadata: string | null;
  createdAt: string;
};