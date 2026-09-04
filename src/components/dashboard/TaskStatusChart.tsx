'use client';

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import DashboardSection from './DashboardSection';

type TaskStatusChartProps = {
  data: {
    TODO: number;
    IN_PROGRESS: number;
    DONE: number;
  };
};

export default function TaskStatusChart({
  data,
}: TaskStatusChartProps) {
  const chartData = [
    {
      status: 'To Do',
      tasks: data.TODO,
    },
    {
      status: 'In Progress',
      tasks: data.IN_PROGRESS,
    },
    {
      status: 'Done',
      tasks: data.DONE,
    },
  ];

  return (
    <DashboardSection
      title="Task Status"
      description="Tasks grouped by current status"
    >
      <div className="h-56 w-full sm:h-72 lg:h-80">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="status" />

            <YAxis
              allowDecimals={false}
            />

            <Tooltip />

            <Bar
              dataKey="tasks"
              name="Tasks"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardSection>
  );
}
