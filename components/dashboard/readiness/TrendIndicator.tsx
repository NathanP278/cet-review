import { TrendingUp, TrendingDown, Minus, HelpCircle } from "lucide-react";

interface TrendIndicatorProps {
  trend: 'improving' | 'stable' | 'declining' | 'unknown';
}

export function TrendIndicator({ trend }: TrendIndicatorProps) {
  const getConfig = (trend: string) => {
    switch (trend) {
      case 'improving':
        return {
          icon: TrendingUp,
          label: 'Improving',
          color: 'text-green-600 dark:text-green-400',
        };
      case 'declining':
        return {
          icon: TrendingDown,
          label: 'Declining',
          color: 'text-red-600 dark:text-red-400',
        };
      case 'stable':
        return {
          icon: Minus,
          label: 'Stable',
          color: 'text-blue-600 dark:text-blue-400',
        };
      default:
        return {
          icon: HelpCircle,
          label: 'Unknown',
          color: 'text-gray-600 dark:text-gray-400',
        };
    }
  };

  const config = getConfig(trend);
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-1.5" aria-label={`Trend: ${config.label}`}>
      <Icon className={`h-4 w-4 ${config.color}`} aria-hidden="true" />
      <span className={`text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
}