
/* eslint-disable @typescript-eslint/no-explicit-any */
import { searchContent } from "@/app/actions/learning";
import { Search as SearchIcon, BookOpen, PenTool } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || "";

  let results = { topics: [] as any[], notes: [] as any[] };
  if (query.length > 2) {
    results = await searchContent(query);
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold font-display mb-2 flex items-center gap-3">
          <SearchIcon className="h-8 w-8 text-primary" />
          Search Results
        </h1>
        {query ? (
          <p className="text-[var(--muted)]">Showing results for &quot;{query}&quot;</p>
        ) : (
          <p className="text-[var(--muted)]">Enter a search term in the navigation bar to find topics and notes.</p>
        )}
      </div>

      {query.length > 2 && results.topics.length === 0 && results.notes.length === 0 && (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <p className="text-[var(--muted)] text-lg">No results found for &quot;{query}&quot;.</p>
        </div>
      )}

      {results.topics.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b border-[var(--border)] pb-2 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Curriculum Topics
          </h2>
          <div className="flex flex-col gap-3">
            {results.topics.map((topic) => {
              const categoryName = topic.categories?.name || "Category";
              const subjectName = topic.categories?.subjects?.name || "Subject";
              
              return (
                <Link key={topic.id} href={`/learn/${topic.id}`} className="group block">
                  <Card className="bg-[var(--card)] border-[var(--border)] transition-colors group-hover:border-[var(--ring)]/50">
                    <CardContent className="p-4">
                      <div className="text-xs text-[var(--muted)] mb-1 flex items-center gap-1.5 font-medium uppercase tracking-wider">
                        <span>{subjectName}</span>
                        <span>•</span>
                        <span>{categoryName}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-primary mb-1">{topic.name}</h3>
                      <p className="text-sm text-[var(--muted)] line-clamp-2">{topic.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {results.notes.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b border-[var(--border)] pb-2 flex items-center gap-2 mt-4">
            <PenTool className="h-5 w-5 text-primary" />
            My Notes
          </h2>
          <div className="flex flex-col gap-3">
            {results.notes.map((note) => (
              <Link key={note.id} href={`/learn/${note.topic_id}?tab=notes`} className="group block">
                <Card className="bg-[var(--card)] border-[var(--border)] transition-colors group-hover:border-[var(--ring)]/50">
                  <CardContent className="p-4">
                    <p className="text-sm text-[var(--muted-foreground)] line-clamp-3 italic">
                      &quot;...{note.content as string}...&quot;
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
