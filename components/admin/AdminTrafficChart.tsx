"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminTrafficChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-500">
        No recent activity to display.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
        <XAxis 
          dataKey="date" 
          tickLine={false} 
          axisLine={false} 
          tick={{ fontSize: 12, fill: "#64748b" }} 
          dy={10}
        />
        <YAxis 
          tickLine={false} 
          axisLine={false} 
          tick={{ fontSize: 12, fill: "#64748b" }}
          dx={-10}
        />
        <Tooltip 
          cursor={{ fill: '#334155', opacity: 0.1 }}
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Bar dataKey="exams" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="reviews" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
