"use client";

import { Card } from "@/components/ui/card";
import { AccuracyRing } from "@/components/domain/AccuracyRing";
import { ChevronDown, ChevronUp, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Dimension {
  id: string;
  name: string;
  score: number;
  icon: LucideIcon;
  description: string;
  color: string;
  bgColor: string;
}

interface DimensionCardProps {
  dimension: Dimension;
  isExpanded: boolean;
  onToggle: () => void;
}

export function DimensionCard({ dimension, isExpanded, onToggle }: DimensionCardProps) {
  const Icon = dimension.icon;

  return (
    <Card className={`overflow-hidden transition-all ${dimension.bgColor} border-[var(--border)]`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-white dark:bg-gray-800`}>
              <Icon className={`h-5 w-5 ${dimension.color}`} />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[var(--foreground)]">
                {dimension.name}
              </h4>
            </div>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="flex flex-col items-center gap-3 mb-4">
          <div className="relative">
            <AccuracyRing accuracy={dimension.score} size={120} label={dimension.id} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-[var(--foreground)]">
                {dimension.score}%
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-[var(--muted)] text-center mb-3">
          {dimension.description}
        </p>

        {/* Expand Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full text-xs"
          aria-expanded={isExpanded}
          aria-controls={`dimension-details-${dimension.id}`}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              View Details
            </>
          )}
        </Button>

        {/* Expanded Details */}
        {isExpanded && (
          <div
            id={`dimension-details-${dimension.id}`}
            className="mt-4 pt-4 border-t border-[var(--border)] space-y-2"
          >
            <div className="text-xs space-y-1">
              <p className="text-[var(--muted)]">
                <strong className="text-[var(--foreground)]">What this measures:</strong>
              </p>
              <p className="text-[var(--muted)]">{dimension.description}</p>
            </div>

            <div className="text-xs space-y-1">
              <p className="text-[var(--muted)]">
                <strong className="text-[var(--foreground)]">How to improve:</strong>
              </p>
              <ul className="list-disc list-inside text-[var(--muted)] space-y-0.5">
                {dimension.id === 'knowledge' && (
                  <>
                    <li>Complete more practice quizzes</li>
                    <li>Study weak subjects</li>
                    <li>Finish learning objectives</li>
                  </>
                )}
                {dimension.id === 'memory' && (
                  <>
                    <li>Complete daily reviews</li>
                    <li>Clear overdue cards</li>
                    <li>Maintain review consistency</li>
                  </>
                )}
                {dimension.id === 'exam' && (
                  <>
                    <li>Take more mock exams</li>
                    <li>Improve time management</li>
                    <li>Build consistent study habits</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}