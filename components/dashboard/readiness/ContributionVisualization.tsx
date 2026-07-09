"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import type { LucideIcon } from "lucide-react";

interface Dimension {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

interface ContributionVisualizationProps {
  dimensions: Dimension[];
}

export function ContributionVisualization({ dimensions }: ContributionVisualizationProps) {
  const [hoveredDimension, setHoveredDimension] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'weight' | 'score' | 'name'>('weight');

  // Calculate contribution percentages
  const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0);
  const contributionData = dimensions.map((d) => ({
    ...d,
    contributionPercent: (d.weight / totalWeight) * 100,
    scorePercent: (d.score / d.maxScore) * 100,
    actualContribution: (d.score / d.maxScore) * d.weight,
  }));

  // Sort dimensions
  const sortedData = [...contributionData].sort((a, b) => {
    switch (sortBy) {
      case 'weight':
        return b.weight - a.weight;
      case 'score':
        return b.scorePercent - a.scorePercent;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-[var(--foreground)]">
            Contribution Analysis
          </h4>
          <p className="text-sm text-[var(--muted)] mt-1">
            How each dimension contributes to your overall readiness
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setSortBy('weight')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              sortBy === 'weight'
                ? 'bg-[var(--accent)] text-[var(--foreground)] font-medium'
                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            By Weight
          </button>
          <button
            onClick={() => setSortBy('score')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              sortBy === 'score'
                ? 'bg-[var(--accent)] text-[var(--foreground)] font-medium'
                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            By Score
          </button>
          <button
            onClick={() => setSortBy('name')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              sortBy === 'name'
                ? 'bg-[var(--accent)] text-[var(--foreground)] font-medium'
                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            Alphabetical
          </button>
        </div>
      </div>

      {/* Stacked Bar Chart */}
      <div className="space-y-1">
        <div className="text-xs text-[var(--muted)] mb-2">Weight Distribution</div>
        <div className="flex h-8 rounded-md overflow-hidden bg-[var(--accent)]">
          {sortedData.map((dimension, index) => {
            const Icon = dimension.icon;
            return (
              <div
                key={dimension.id}
                className={`relative transition-all ${dimension.bgColor} ${
                  hoveredDimension === dimension.id ? 'ring-2 ring-[var(--ring)] ring-inset' : ''
                }`}
                style={{ width: `${dimension.contributionPercent}%` }}
                onMouseEnter={() => setHoveredDimension(dimension.id)}
                onMouseLeave={() => setHoveredDimension(null)}
                title={`${dimension.name}: ${dimension.contributionPercent.toFixed(1)}%`}
              >
                {dimension.contributionPercent > 5 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className={`h-4 w-4 ${dimension.color}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend with Details */}
      <div className="space-y-2">
        {sortedData.map((dimension) => {
          const Icon = dimension.icon;
          const isHovered = hoveredDimension === dimension.id;

          return (
            <div
              key={dimension.id}
              className={`p-3 rounded-lg transition-all cursor-pointer ${
                isHovered ? 'bg-[var(--accent)] shadow-sm' : 'hover:bg-[var(--accent)]'
              }`}
              onMouseEnter={() => setHoveredDimension(dimension.id)}
              onMouseLeave={() => setHoveredDimension(null)}
            >
              <div className="flex items-center justify-between gap-4">
                {/* Left: Name & Icon */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Icon className={`h-4 w-4 ${dimension.color} flex-shrink-0`} />
                  <span className="text-sm font-medium text-[var(--foreground)] truncate">
                    {dimension.name}
                  </span>
                </div>

                {/* Middle: Score Progress */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-1 max-w-32">
                    <Progress value={dimension.scorePercent} className="h-1.5" />
                  </div>
                  <span className="text-xs text-[var(--muted)] whitespace-nowrap">
                    {dimension.score}/{dimension.maxScore}
                  </span>
                </div>

                {/* Right: Weight */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[var(--foreground)]">
                    {dimension.weight}%
                  </span>
                  <span className="text-xs text-[var(--muted)]">weight</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--border)]">
        <div className="text-center">
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {dimensions.length}
          </div>
          <div className="text-xs text-[var(--muted)]">Dimensions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {totalWeight}%
          </div>
          <div className="text-xs text-[var(--muted)]">Total Weight</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {sortedData.reduce((sum, d) => sum + d.actualContribution, 0).toFixed(1)}
          </div>
          <div className="text-xs text-[var(--muted)]">Actual Score</div>
        </div>
      </div>
    </div>
  );
}