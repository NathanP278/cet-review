import { Card } from "@/components/ui/card";
import type { CETReadiness } from "@/types/dashboard";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CalibrationStatusProps {
  readiness: CETReadiness;
}

export function CalibrationStatus({ readiness }: CalibrationStatusProps) {
  const mockExamsNeeded = Math.max(0, 3 - readiness.mockExamsTaken);
  const totalProgress = readiness.mockExamsTaken >= 3 ? 100 : (readiness.mockExamsTaken / 3) * 100;

  return (
    <Card className="p-4 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
      <div className="flex items-start gap-3">
        {readiness.isCalibrated ? (
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
        )}
        
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="font-semibold text-sm text-[var(--foreground)]">
              {readiness.isCalibrated ? 'Fully Calibrated' : 'Calibration in Progress'}
            </h4>
            <p className="text-xs text-[var(--muted)] mt-1">
              {readiness.isCalibrated
                ? 'Your readiness predictions are reliable and accurate'
                : `Complete ${mockExamsNeeded} more mock exam(s) for reliable predictions`}
            </p>
          </div>

          {!readiness.isCalibrated && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--muted)]">Calibration Progress</span>
                <span className="font-medium text-[var(--foreground)]">
                  {readiness.mockExamsTaken} / 3 exams
                </span>
              </div>
              <Progress value={totalProgress} className="h-2" />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}