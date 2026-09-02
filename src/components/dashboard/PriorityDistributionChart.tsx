'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import DashboardSection from './DashboardSection';

type PriorityDistributionChartProps = {
  data: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    URGENT: number;
  };
};

export default function PriorityDistributionChart({
  data,
}: PriorityDistributionChartProps) {
  const chartData = [
    {
      name: 'Low',
      value: data.LOW,
    },
    {
      name: 'Medium',
      value: data.MEDIUM,
    },
    {
      name: 'High',
      value: data.HIGH,
    },
    {
      name: 'Urgent',
      value: data.URGENT,
    },
  ];

  return (
    <DashboardSection
      title="Priority Distribution"
      description="Tasks grouped by priority"
    >
      <div className="h-80 w-full">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                />
              ))}
            </Pie>

            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </DashboardSection>
  );
}