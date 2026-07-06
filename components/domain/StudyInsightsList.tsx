import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";
import { StudyInsight } from "@/lib/intelligence/insights";

interface StudyInsightsListProps {
  insights: StudyInsight[];
}

export function StudyInsightsList({ insights }: StudyInsightsListProps) {
  if (!insights || insights.length === 0) return null;

  return (
    <Card className="border-[var(--border)] shadow-sm">
      <CardHeader className="pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-[var(--color-warning)] fill-[var(--color-warning)]" />
          <CardTitle>Study Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-[var(--border)]">
          {insights.map((insight) => (
            <li key={insight.id} className="p-4 flex gap-4 hover:bg-[var(--surface)] transition-colors">
              <div className="mt-0.5 shrink-0">
                {insight.type === "strength" && <TrendingUp className="h-5 w-5 text-[var(--color-success)]" />}
                {insight.type === "weakness" && <AlertTriangle className="h-5 w-5 text-[var(--color-destructive)]" />}
                {insight.type === "trend" && <TrendingUp className="h-5 w-5 text-[var(--color-primary)]" />}
                {insight.type === "suggestion" && <ArrowRight className="h-5 w-5 text-[var(--color-secondary)]" />}
              </div>
              <p className="text-sm text-[var(--foreground)]">{insight.message}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
