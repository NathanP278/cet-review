import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AICoachCardProps {
  message: string;
  isLoading?: boolean;
  className?: string;
}

export function AICoachCard({
  message,
  isLoading,
  className,
}: AICoachCardProps) {
  return (
    <div
      className={cn(
        "bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 p-4 md:p-5 rounded-xl flex items-start gap-3 shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4",
        className
      )}
      role="region"
      aria-label="AI Study Coach"
    >
      <div className="p-2 bg-purple-500/20 rounded-full mt-0.5 shadow-sm flex-shrink-0">
        <Sparkles className="h-5 w-5 text-purple-700 dark:text-purple-300" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2 flex-wrap">
          <span>AI Study Coach</span>
          <span className="bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">
            Beta
          </span>
        </h3>
        {isLoading ? (
          <div className="mt-2 space-y-2">
            <div className="h-4 w-full bg-purple-500/10 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-purple-500/10 rounded animate-pulse" />
          </div>
        ) : (
          <p className="text-sm mt-2 text-purple-800 dark:text-purple-200 leading-relaxed font-medium">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export function AICoachCardSkeleton() {
  return (
    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 p-4 md:p-5 rounded-xl flex items-start gap-3 shadow-sm animate-pulse">
      <div className="p-2 bg-purple-500/20 rounded-full mt-0.5 shadow-sm flex-shrink-0">
        <Sparkles className="h-5 w-5 text-purple-700 dark:text-purple-300" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-5 w-32 bg-purple-500/10 rounded" />
        <div className="h-4 w-full bg-purple-500/10 rounded" />
        <div className="h-4 w-3/4 bg-purple-500/10 rounded" />
      </div>
    </div>
  );
}