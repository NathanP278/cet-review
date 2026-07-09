"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";

interface Dimension {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  shortExplanation: string;
  fullExplanation: string;
  calculationExplanation: string;
  trend: 'improving' | 'stable' | 'declining';
}

interface DimensionBreakdownCardProps {
  dimension: Dimension;
  isExpanded: boolean;
  onToggle: () => void;
}

export function DimensionBreakdownCard({
  dimension,
  isExpanded,
  onToggle,
}: DimensionBreakdownCardProps) {
  const Icon = dimension.icon;
  const percentage = (dimension.score / dimension.maxScore) * 100;
  const contributionPercentage = dimension.weight;

  const getTrendIcon = () => {
    switch (dimension.trend) {
      case 'improving':
        return <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />;
      case 'declining':
        return <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />;
      default:
        return <Minus className="h-3 w-3 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getTrendLabel = () => {
    switch (dimension.trend) {
      case 'improving':
        return 'Improving';
      case 'declining':
        return 'Declining';
      default:
        return 'Stable';
    }
  };

  return (
    <Card className={`${dimension.bgColor} border-[var(--border)] transition-all`}>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-white dark:bg-gray-800">
              <Icon className={`h-4 w-4 ${dimension.color}`} />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[var(--foreground)]">
                {dimension.name}
              </h4>
              <p className="text-xs text-[var(--muted)]">
                {dimension.shortExplanation}
              </p>
            </div>
          </div>
        </div>

        {/* Score */}
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-2xl font-bold text-[var(--foreground)]">
                {dimension.score}
              </span>
              <span className="text-sm text-[var(--muted)]">
                {' '}/ {dimension.maxScore}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              {getTrendIcon()}
              <span className="text-[var(--muted)]">{getTrendLabel()}</span>
            </div>
          </div>

          <Progress value={percentage} className="h-2" />

          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span>{percentage.toFixed(1)}% Complete</span>
            <span>{contributionPercentage}% Weight</span>
          </div>
        </div>

        {/* Expand Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full text-xs"
          aria-expanded={isExpanded}
          aria-controls={`dimension-breakdown-${dimension.id}`}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Show Details
            </>
          )}
        </Button>

        {/* Expanded Content */}
        {isExpanded && (
          <div
            id={`dimension-breakdown-${dimension.id}`}
            className="pt-4 border-t border-[var(--border)] space-y-3"
          >
            {/* Full Explanation */}
            <div>
              <h5 className="text-xs font-semibold text-[var(--foreground)] mb-1">
                What this measures
              </h5>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {dimension.fullExplanation}
              </p>
            </div>

            {/* Calculation */}
            <div>
              <h5 className="text-xs font-semibold text-[var(--foreground)] mb-1">
                How it's calculated
              </h5>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {dimension.calculationExplanation}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="p-2 bg-white dark:bg-gray-800 rounded">
                <div className="text-xs text-[var(--muted)]">Score</div>
                <div className="text-sm font-bold text-[var(--foreground)]">
                  {dimension.score} / {dimension.maxScore}
                </div>
              </div>
              <div className="p-2 bg-white dark:bg-gray-800 rounded">
                <div className="text-xs text-[var(--muted)]">Contribution</div>
                <div className="text-sm font-bold text-[var(--foreground)]">
                  {contributionPercentage}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}