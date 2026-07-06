import { createClient } from "@/lib/supabase/server";
import { SubjectCard } from "@/components/domain/SubjectCard";
import { BookOpen } from "lucide-react";

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
      topics (count)
    `
    )
    .order("name");

  if (error) {
    console.error("Error fetching subjects:", error);
  }

  // Calculate mock accuracy for MVP (in a real app, this would be computed from user_cards or quiz_attempts)
  const getMockAccuracy = (name: string) => {
    if (name.includes("Math")) return 65;
    if (name.includes("Science")) return 82;
    if (name.includes("Language")) return 45;
    if (name.includes("Reading")) return 90;
    return 0;
  };

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
          Focus your practice on specific areas. Track your mastery across all UPCAT subtests to
          ensure you are fully prepared for exam day.
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
              topicsCount={subject.topics[0]?.count || 0}
              accuracy={getMockAccuracy(subject.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
