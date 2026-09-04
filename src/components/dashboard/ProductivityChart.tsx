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

type ProductivityChartProps = {
  data: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
  };
};

export default function ProductivityChart({
  data,
}: ProductivityChartProps) {
  const chartData = [
    {
      metric: 'Total',
      value: data.totalTasks,
    },
    {
      metric: 'Completed',
      value: data.completedTasks,
    },
    {
      metric: 'Overdue',
      value: data.overdueTasks,
    },
  ];

  return (
    <DashboardSection
      title="Productivity Overview"
      description="Comparison of total, completed and overdue tasks"
    >
      <div className="h-56 w-full sm:h-72 lg:h-80">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="metric" />

            <YAxis
              allowDecimals={false}
            />

            <Tooltip />

            <Bar
              dataKey="value"
              name="Tasks"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardSection>
  );
}
