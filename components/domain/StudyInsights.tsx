import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import { StudyInsight } from "@/lib/insights";

interface StudyInsightsProps {
  insights: StudyInsight[];
}

export function StudyInsights({ insights }: StudyInsightsProps) {
  const getIcon = (type: StudyInsight["type"]) => {
    switch (type) {
      case "positive":
        return <TrendingUp className="w-5 h-5 text-[var(--color-success)]" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-[var(--color-warning)]" />;
      case "neutral":
      default:
        return <Lightbulb className="w-5 h-5 text-[var(--color-primary)]" />;
    }
  };

  const getBgColor = (type: StudyInsight["type"]) => {
    switch (type) {
      case "positive":
        return "bg-[var(--color-success-light)]/20 border-[var(--color-success-light)]";
      case "warning":
        return "bg-[var(--color-warning-light)]/20 border-[var(--color-warning-light)]";
      case "neutral":
      default:
        return "bg-[var(--color-primary-light)]/10 border-[var(--color-primary-light)]";
    }
  };

  return (
    <Card className="border-[var(--border)] shadow-sm h-full">
      <CardHeader className="pb-3 border-b border-[var(--border)]">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
          Intelligent Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 flex flex-col gap-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`flex gap-3 items-start p-3 rounded-lg border ${getBgColor(
              insight.type
            )}`}
          >
            <div className="shrink-0 mt-0.5">{getIcon(insight.type)}</div>
            <p className="text-sm font-medium leading-relaxed">{insight.message}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
