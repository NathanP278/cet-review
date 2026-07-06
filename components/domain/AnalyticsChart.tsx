"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface ChartDataPoint {
  date: string;
  score: number;
}

export interface AnalyticsChartProps {
  data: ChartDataPoint[];
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--muted)] border border-dashed border-[var(--border)] rounded-lg">
        Not enough data to display a trend. Take some mock exams!
      </div>
    );
  }

  return (
    <div className="h-72 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="var(--muted)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            stroke="var(--muted)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
              borderRadius: "8px",
              color: "var(--foreground)",
            }}
            itemStyle={{ color: "var(--color-primary)" }}
            formatter={(value: number) => [`${value}%`, "Accuracy"]}
            labelStyle={{ color: "var(--muted)", marginBottom: "4px" }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="var(--color-primary)"
            strokeWidth={3}
            dot={{ r: 4, fill: "var(--surface)", stroke: "var(--color-primary)", strokeWidth: 2 }}
            activeDot={{
              r: 6,
              fill: "var(--color-primary)",
              stroke: "var(--surface)",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
