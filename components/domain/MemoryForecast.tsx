"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CalendarDays } from "lucide-react";

interface MemoryForecastProps {
  forecastData: { day: string; count: number }[];
  totalNext30Days: number;
}

export function MemoryForecast({ forecastData, totalNext30Days }: MemoryForecastProps) {
  return (
    <Card className="border-[var(--border)] shadow-sm h-full flex flex-col">
      <CardHeader className="pb-2 border-b border-[var(--border)]">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="w-5 h-5 text-[var(--color-primary)]" />
              Memory Forecast
            </CardTitle>
            <CardDescription className="mt-1">
              Upcoming review workload
            </CardDescription>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-[var(--foreground)]">{totalNext30Days}</span>
            <span className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
              Next 30 Days
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-[200px] pt-6 pb-2">
        {forecastData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-[var(--muted)]">
            No forecast data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forecastData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "var(--muted)" }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "var(--muted)" }} 
              />
              <Tooltip
                cursor={{ fill: "var(--color-slate-100)" }}
                contentStyle={{ 
                  borderRadius: "8px", 
                  border: "1px solid var(--border)",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                }}
              />
              <Bar 
                dataKey="count" 
                fill="var(--color-primary)" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
