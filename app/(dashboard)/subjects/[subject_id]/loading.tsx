import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function SubjectLoading() {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto animate-pulse">
      <div className="inline-flex items-center text-sm font-medium text-[var(--muted)] w-fit">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Subjects
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1 w-full">
          <Skeleton className="h-10 w-3/4 mb-3" />
          <Skeleton className="h-6 w-full max-w-xl" />
          <Skeleton className="h-6 w-5/6 max-w-xl mt-2" />
        </div>

        <Card className="shrink-0 w-full md:w-auto">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
            <Skeleton className="h-20 w-20 rounded-full" />
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 py-4 border-y border-[var(--border)]">
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div>
        <Skeleton className="h-8 w-32 mb-4" />
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
