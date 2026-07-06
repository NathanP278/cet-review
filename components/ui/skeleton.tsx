import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[var(--color-slate-200)] dark:bg-[var(--color-slate-800)]",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
