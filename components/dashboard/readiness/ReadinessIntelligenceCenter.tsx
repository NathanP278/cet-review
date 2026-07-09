"use client";

import { useState } from "react";
import type { CETReadiness } from "@/types/dashboard";
import { OverallReadinessDisplay } from "./OverallReadinessDisplay";
import { ReadinessDimensionsPanel } from "./ReadinessDimensionsPanel";
import { ReadinessPotentialCard } from "./ReadinessPotentialCard";
import { CalibrationStatus } from "./CalibrationStatus";
import { ReadinessEmptyState } from "./ReadinessEmptyState";
import { ReadinessErrorState } from "./ReadinessErrorState";
import { SkeletonReadiness } from "./SkeletonReadiness";

interface ReadinessIntelligenceCenterProps {
  readiness: CETReadiness;
  isLoading?: boolean;
  error?: string;
}

export function ReadinessIntelligenceCenter({
  readiness,
  isLoading = false,
  error,
}: ReadinessIntelligenceCenterProps) {
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);

  // Loading state
  if (isLoading) {
    return <SkeletonReadiness />;
  }

  // Error state
  if (error) {
    return <ReadinessErrorState error={error} />;
  }

  // Uncalibrated / Empty state
  if (!readiness.isCalibrated) {
    return (
      <div className="space-y-4">
        <CalibrationStatus readiness={readiness} />
        <ReadinessEmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Readiness */}
      <OverallReadinessDisplay readiness={readiness} />

      {/* Three Dimensions */}
      <ReadinessDimensionsPanel
        readiness={readiness}
        expandedDimension={expandedDimension}
        onDimensionToggle={setExpandedDimension}
      />

      {/* Readiness Potential */}
      <ReadinessPotentialCard readiness={readiness} />
    </div>
  );
}