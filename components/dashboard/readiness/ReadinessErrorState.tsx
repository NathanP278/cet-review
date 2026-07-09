import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ReadinessErrorStateProps {
  error: string;
}

export function ReadinessErrorState({ error }: ReadinessErrorStateProps) {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Card className="p-8 text-center border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
      <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
        <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            Failed to Load Readiness
          </h3>
          <p className="text-sm text-[var(--muted)]">
            We encountered an error while calculating your readiness score.
          </p>
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-mono">
              {error}
            </p>
          )}
        </div>

        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    </Card>
  );
}