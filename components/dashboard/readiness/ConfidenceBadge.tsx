interface ConfidenceBadgeProps {
  level: 'High' | 'Medium' | 'Low' | 'Insufficient Data';
}

export function ConfidenceBadge({ level }: ConfidenceBadgeProps) {
  const getConfig = (level: string) => {
    switch (level) {
      case 'High':
        return { label: 'High Confidence', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
      case 'Medium':
        return { label: 'Medium Confidence', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
      case 'Low':
        return { label: 'Low Confidence', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' };
      default:
        return { label: 'Insufficient Data', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' };
    }
  };

  const config = getConfig(level);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      aria-label={`Confidence: ${config.label}`}
    >
      {config.label}
    </span>
  );
}