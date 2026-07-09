interface ReadinessLevelBadgeProps {
  score: number;
}

export function ReadinessLevelBadge({ score }: ReadinessLevelBadgeProps) {
  const getLevel = (score: number) => {
    if (score >= 95) return { label: "Exam Ready", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" };
    if (score >= 81) return { label: "Highly Prepared", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" };
    if (score >= 61) return { label: "Prepared", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200" };
    if (score >= 41) return { label: "Progressing", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" };
    if (score >= 21) return { label: "Developing", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" };
    return { label: "Beginning", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" };
  };

  const level = getLevel(score);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${level.color}`}
      aria-label={`Readiness level: ${level.label}`}
    >
      {level.label}
    </span>
  );
}