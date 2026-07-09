"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CETReadiness } from "@/types/dashboard";
import { Calendar, TrendingUp, TrendingDown, Milestone } from "lucide-react";

interface ReadinessTimelineProps {
  readiness: CETReadiness;
}

type TimeRange = '7d' | '30d' | '90d' | 'all';

interface TimelineDataPoint {
  date: string;
  overallReadiness: number;
  knowledgeReadiness: number;
  memoryReadiness: number;
  examReadiness: number;
  milestone?: {
    type: 'improvement' | 'decline' | 'calibration';
    description: string;
  };
}

export function ReadinessTimeline({ readiness }: ReadinessTimelineProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Generate timeline data (in production, this comes from backend)
  const generateTimelineData = (range: TimeRange): TimelineDataPoint[] => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 180;
    const data: TimelineDataPoint[] = [];
    const currentScore = readiness.overallScore;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate historical progression
      const progress = (days - i) / days;
      const baseScore = Math.max(0, currentScore - (days - i) * 0.3);
      const noise = (Math.random() - 0.5) * 5;
      
      const overall = Math.min(100, Math.max(0, baseScore + noise));
      const knowledge = Math.min(100, Math.max(0, overall + (Math.random() - 0.5) * 10));
      const memory = Math.min(100, Math.max(0, overall + (Math.random() - 0.5) * 10));
      const exam = Math.min(100, Math.max(0, overall + (Math.random() - 0.5) * 10));

      const dataPoint: TimelineDataPoint = {
        date: date.toISOString().split('T')[0],
        overallReadiness: Math.round(overall),
        knowledgeReadiness: Math.round(knowledge),
        memoryReadiness: Math.round(memory),
        examReadiness: Math.round(exam),
      };

      // Add milestones
      if (i === Math.floor(days * 0.7) && overall > 50) {
        dataPoint.milestone = {
          type: 'improvement',
          description: 'Significant improvement in mock exam performance',
        };
      } else if (i === Math.floor(days * 0.3) && readiness.isCalibrated) {
        dataPoint.milestone = {
          type: 'calibration',
          description: 'Readiness system calibrated',
        };
      }

      data.push(dataPoint);
    }

    return data;
  };

  const timelineData = generateTimelineData(timeRange);
  
  // Calculate statistics
  const currentValue = timelineData[timelineData.length - 1]?.overallReadiness || 0;
  const previousValue = timelineData[0]?.overallReadiness || 0;
  const change = currentValue - previousValue;
  const changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0;
  
  // Calculate moving average
  const movingAverage = timelineData.length >= 7
    ? timelineData.slice(-7).reduce((sum, d) => sum + d.overallReadiness, 0) / 7
    : currentValue;

  // Find max and min for scaling
  const maxValue = Math.max(...timelineData.map(d => 
    Math.max(d.overallReadiness, d.knowledgeReadiness, d.memoryReadiness, d.examReadiness)
  ));
  const minValue = Math.min(...timelineData.map(d => 
    Math.min(d.overallReadiness, d.knowledgeReadiness, d.memoryReadiness, d.examReadiness)
  ));

  const getYPosition = (value: number) => {
    const range = maxValue - minValue || 1;
    return ((maxValue - value) / range) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Readiness Timeline
          </h3>
          <p className="text-sm text-[var(--muted)] mt-1">
            Historical view of your readiness progression
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === 'all' ? 'All Time' : range.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[var(--muted)]">Current</div>
              <div className="text-2xl font-bold text-[var(--foreground)] mt-1">
                {currentValue}%
              </div>
            </div>
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[var(--muted)]">Change</div>
              <div className={`text-2xl font-bold mt-1 ${
                change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
              </div>
            </div>
            {change >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[var(--muted)]">7-Day Avg</div>
              <div className="text-2xl font-bold text-[var(--foreground)] mt-1">
                {movingAverage.toFixed(1)}%
              </div>
            </div>
            <div className="h-5 w-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[var(--muted)]">Milestones</div>
              <div className="text-2xl font-bold text-[var(--foreground)] mt-1">
                {timelineData.filter(d => d.milestone).length}
              </div>
            </div>
            <Milestone className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
        </Card>
      </div>

      {/* Timeline Chart */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Chart */}
          <div className="relative h-64">
            <svg className="w-full h-full" preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((value) => (
                <g key={value}>
                  <line
                    x1="0"
                    y1={`${((maxValue - value) / (maxValue - minValue)) * 100}%`}
                    x2="100%"
                    y2={`${((maxValue - value) / (maxValue - minValue)) * 100}%`}
                    stroke="var(--border)"
                    strokeWidth="1"
                    strokeDasharray="4"
                  />
                  <text
                    x="0"
                    y={`${((maxValue - value) / (maxValue - minValue)) * 100}%`}
                    dy="-4"
                    fontSize="10"
                    fill="var(--muted)"
                  >
                    {value}%
                  </text>
                </g>
              ))}

              {/* Lines */}
              <polyline
                points={timelineData.map((d, i) => 
                  `${(i / (timelineData.length - 1)) * 100},${getYPosition(d.overallReadiness)}`
                ).join(' ')}
                fill="none"
                stroke="rgb(59, 130, 246)"
                strokeWidth="2"
              />
              <polyline
                points={timelineData.map((d, i) => 
                  `${(i / (timelineData.length - 1)) * 100},${getYPosition(d.knowledgeReadiness)}`
                ).join(' ')}
                fill="none"
                stroke="rgb(34, 197, 94)"
                strokeWidth="1.5"
                opacity="0.6"
              />
              <polyline
                points={timelineData.map((d, i) => 
                  `${(i / (timelineData.length - 1)) * 100},${getYPosition(d.memoryReadiness)}`
                ).join(' ')}
                fill="none"
                stroke="rgb(168, 85, 247)"
                strokeWidth="1.5"
                opacity="0.6"
              />
              <polyline
                points={timelineData.map((d, i) => 
                  `${(i / (timelineData.length - 1)) * 100},${getYPosition(d.examReadiness)}`
                ).join(' ')}
                fill="none"
                stroke="rgb(249, 115, 22)"
                strokeWidth="1.5"
                opacity="0.6"
              />

              {/* Milestones */}
              {timelineData.map((d, i) => 
                d.milestone ? (
                  <g key={i}>
                    <circle
                      cx={`${(i / (timelineData.length - 1)) * 100}%`}
                      cy={`${getYPosition(d.overallReadiness)}%`}
                      r="4"
                      fill={d.milestone.type === 'improvement' ? 'rgb(34, 197, 94)' : 
                            d.milestone.type === 'calibration' ? 'rgb(249, 115, 22)' : 'rgb(239, 68, 68)'}
                    />
                  </g>
                ) : null
              )}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600" />
              <span className="text-[var(--muted)]">Overall</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600 opacity-60" />
              <span className="text-[var(--muted)]">Knowledge</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-600 opacity-60" />
              <span className="text-[var(--muted)]">Memory</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-600 opacity-60" />
              <span className="text-[var(--muted)]">Exam</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Milestones */}
      {timelineData.some(d => d.milestone) && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-[var(--foreground)]">Key Milestones</h4>
          {timelineData.filter(d => d.milestone).map((d, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  d.milestone?.type === 'improvement' ? 'bg-green-100 dark:bg-green-900' :
                  d.milestone?.type === 'calibration' ? 'bg-orange-100 dark:bg-orange-900' :
                  'bg-red-100 dark:bg-red-900'
                }`}>
                  <Milestone className={`h-4 w-4 ${
                    d.milestone?.type === 'improvement' ? 'text-green-600 dark:text-green-400' :
                    d.milestone?.type === 'calibration' ? 'text-orange-600 dark:text-orange-400' :
                    'text-red-600 dark:text-red-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-[var(--foreground)]">
                    {d.milestone?.description}
                  </div>
                  <div className="text-xs text-[var(--muted)] mt-1">
                    {new Date(d.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                <div className="text-sm font-bold text-[var(--foreground)]">
                  {d.overallReadiness}%
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}