import { createClient } from "@/lib/supabase/server";
import { SubjectCard } from "@/components/domain/SubjectCard";
import { BookOpen } from "lucide-react";

export const revalidate = 3600;

export default async function SubjectsPage() {
  const supabase = await createClient();

  // Fetch subjects with a count of their related topics
  const { data: subjects, error } = await supabase
    .from("subjects")
    .select(
      `
      id,
      name,
      description,
      categories (
        topics (count)
      )
    `
    )
    .order("name");

  if (error) {
    console.error("Error fetching subjects:", error);
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[var(--color-primary-light)]/20 rounded-lg text-[var(--color-primary)]">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold font-display">Subject Directory</h1>
        </div>
        <p className="text-[var(--muted)] max-w-2xl">
          Focus your practice on specific areas. Track your mastery across all CET subtests to
          ensure you&apos;re exam-ready.
        </p>
      </div>

      {error ? (
        <div className="p-4 border border-[var(--color-danger)] bg-[var(--color-danger-light)]/10 text-[var(--color-danger)] rounded-md">
          Failed to load subjects. Please try again later.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjects?.map((subject) => (
            <SubjectCard
              key={subject.id}
              id={subject.id}
              name={subject.name}
              description={subject.description || "No description available."}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              topicsCount={(subject.categories as any[])?.reduce((acc, cat) => acc + (cat.topics?.[0]?.count || 0), 0) || 0}
              accuracy={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
