import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, FileText, Play, Youtube, Info, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { NotesEditor } from "@/components/domain/NotesEditor";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topic_id: string }>;
}) {
  const { topic_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Fetch Topic and related hierarchy
  const { data: topic, error: topicError } = await supabase
    .from("topics")
    .select(`
      *,
      categories (
        name,
        subjects (
          id,
          name
        )
      )
    `)
    .eq("id", topic_id)
    .single();

  if (topicError || !topic) {
    notFound();
  }

  // Fetch Resources
  const { data: resource } = await supabase
    .from("topic_resources")
    .select("*")
    .eq("topic_id", topic_id)
    .single();

  // Fetch User Notes
  const { data: userNote } = await supabase
    .from("user_notes")
    .select("*")
    .eq("user_id", user.id)
    .eq("topic_id", topic_id)
    .single();

  // Fetch Topic Mastery
  let mastery = 0;
  const { data: masteryData } = await supabase
    .from("topic_mastery_view")
    .select("mastery_percentage")
    .eq("user_id", user.id)
    .eq("topic_id", topic_id)
    .single();

  if (masteryData && masteryData.mastery_percentage !== null) {
    mastery = Math.round(masteryData.mastery_percentage);
  }

  // Extract deeply nested relations
  // @ts-ignore - Supabase types can be tricky with deeply nested joins
  const categoryName = topic.categories?.name || "Category";
  // @ts-ignore
  const subjectId = topic.categories?.subjects?.id;
  // @ts-ignore
  const subjectName = topic.categories?.subjects?.name || "Subject";

  const learningObjectives = (resource?.learning_objectives as string[]) || [];
  const videos = (resource?.videos as { title: string; url: string; duration?: string }[]) || [];
  
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-12">
      {/* Header & Breadcrumbs */}
      <div>
        <Link
          href={subjectId ? `/subjects/${subjectId}` : "/subjects"}
          className="inline-flex items-center text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {subjectName}
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <span className="text-sm font-semibold text-[var(--color-primary)] uppercase tracking-wider mb-2 block">
              {categoryName}
            </span>
            <h1 className="text-4xl font-bold font-display mb-3">{topic.name}</h1>
            <p className="text-[var(--muted)] text-lg max-w-2xl">
              {topic.description || "Master the concepts and build your confidence."}
            </p>
          </div>
          
          <div className="w-full md:w-64 bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] shadow-sm shrink-0">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className="text-[var(--muted)]">Topic Mastery</span>
              <span className={mastery > 80 ? "text-[var(--color-success)]" : mastery > 40 ? "text-[var(--color-warning)]" : "text-[var(--muted)]"}>
                {mastery}%
              </span>
            </div>
            <div className="h-2 w-full bg-[var(--color-slate-100)] dark:bg-[var(--color-slate-800)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--color-primary)] transition-all duration-500 ease-out" 
                style={{ width: `${mastery}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Learning Resources */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Learning Objectives */}
          {learningObjectives.length > 0 && (
            <Card className="border-[var(--border)] shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-[var(--color-success)]" />
                  <h3 className="text-lg font-semibold">Learning Objectives</h3>
                </div>
                <ul className="space-y-3">
                  {learningObjectives.map((obj, i) => (
                    <li key={i} className="flex gap-3 text-[var(--muted)] items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-2 shrink-0" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Official Study Notes */}
          <Card className="border-[var(--border)] shadow-sm overflow-hidden">
            <div className="bg-[var(--color-slate-50)] dark:bg-[var(--color-slate-900)] border-b border-[var(--border)] p-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[var(--color-primary)]" />
              <h3 className="font-semibold">Official Study Notes</h3>
            </div>
            <CardContent className="p-6">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                {resource?.study_notes ? (
                  <div dangerouslySetInnerHTML={{ __html: resource.study_notes.replace(/\n/g, "<br/>") }} />
                ) : (
                  <p className="italic text-[var(--muted)]">No official study notes available for this topic yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Video Resources */}
          {videos.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-500" />
                Video Lessons
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videos.map((vid, i) => (
                  <a key={i} href={vid.url} target="_blank" rel="noopener noreferrer" className="block group">
                    <Card className="border-[var(--border)] transition-all hover:border-[var(--color-primary)] shadow-sm hover:shadow-md h-full">
                      <CardContent className="p-4 flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Play className="h-4 w-4 text-red-600 dark:text-red-400 ml-1" />
                        </div>
                        <div>
                          <p className="font-medium line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">{vid.title}</p>
                          {vid.duration && <p className="text-xs text-[var(--muted)] mt-1">{vid.duration}</p>}
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Personal Notes & Practice */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="sticky top-24 flex flex-col gap-6">
            
            <Card className="border-[var(--border)] shadow-md overflow-hidden ring-2 ring-[var(--color-primary)]/20">
              <div className="p-6 bg-[var(--surface)] text-center">
                <h3 className="font-bold text-xl mb-2">Ready to test your knowledge?</h3>
                <p className="text-sm text-[var(--muted)] mb-6">
                  Take a practice quiz to evaluate your understanding and update your topic mastery.
                </p>
                <Link href={`/practice?topic=${topic.id}`} className="w-full block">
                  <Button size="lg" className="w-full gap-2 text-md h-12 shadow-md">
                    <Play className="h-5 w-5 fill-current" />
                    Start Practice Quiz
                  </Button>
                </Link>
              </div>
              <div className="bg-[var(--color-slate-50)] dark:bg-[var(--color-slate-900)] p-4 border-t border-[var(--border)] flex gap-3">
                <Info className="h-5 w-5 text-[var(--color-primary)] shrink-0" />
                <p className="text-xs text-[var(--muted)]">
                  Mistakes are automatically converted into Flashcards for spaced repetition review.
                </p>
              </div>
            </Card>

            <Card className="border-[var(--border)] shadow-sm">
              <div className="bg-[var(--color-slate-50)] dark:bg-[var(--color-slate-900)] border-b border-[var(--border)] p-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[var(--color-warning)]" />
                <h3 className="font-semibold">My Personal Notes</h3>
              </div>
              <CardContent className="p-0">
                <NotesEditor 
                  topicId={topic.id} 
                  initialContent={userNote?.content || ""} 
                />
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
