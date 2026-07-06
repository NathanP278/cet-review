import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AccuracyRing } from "@/components/domain/AccuracyRing";

export interface SubjectCardProps {
  id: string;
  name: string;
  description: string;
  topicsCount: number;
  accuracy: number;
}

export function SubjectCard({ id, name, description, topicsCount, accuracy }: SubjectCardProps) {
  return (
    <Link href={`/subjects/${id}`} className="block group">
      <Card className="h-full transition-all hover:border-[var(--color-primary)] hover:shadow-md">
        <CardContent className="flex items-center gap-6 p-6">
          <AccuracyRing accuracy={accuracy} size={80} label="Mastery" />
          <div className="flex-1 space-y-1">
            <h3 className="font-display text-xl font-bold text-[var(--foreground)] group-hover:text-[var(--color-primary)] transition-colors">
              {name}
            </h3>
            <p className="text-sm text-[var(--muted)] line-clamp-2">{description}</p>
            <div className="text-xs font-semibold text-[var(--muted)] pt-2 uppercase tracking-wider">
              {topicsCount} Topics
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-[var(--muted)] group-hover:text-[var(--color-primary)] transition-colors" />
        </CardContent>
      </Card>
    </Link>
  );
}
