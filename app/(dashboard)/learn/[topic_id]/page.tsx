/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Clock, BarChart, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FormulaCard } from "@/components/domain/FormulaCard";
import { VideoEmbed } from "@/components/domain/VideoEmbed";
import { NotesEditor } from "@/components/domain/NotesEditor";
import { BookmarkButton } from "@/components/domain/BookmarkButton";
import { getUserNote, getProgress } from "@/app/actions/learning";

export default async function LearningPage({ params }: { params: Promise<{ topic_id: string }> }) {
  const { topic_id } = await params;
  const supabase = await createClient();

  // Fetch the Topic
  const { data: topic, error: topicError } = await supabase
    .from("topics")
    .select("*, categories(name, subject_id, subjects(name))")
    .eq("id", topic_id)
    .single();

  if (topicError || !topic) notFound();

  // Cast complex relations
  const categoryName = (topic.categories as Record<string, any>)?.name || "Category";
  const subjectName = (topic.categories as Record<string, any>)?.subjects?.name || "Subject";
  const subjectId = (topic.categories as Record<string, any>)?.subject_id;

  // Fetch Topic Resource
  const { data: resource } = await supabase
    .from("topic_resources")
    .select("*")
    .eq("topic_id", topic_id)
    .is("subtopic_id", null)
    .single();

  // Fetch Progress & Note
  const [progress, userNote] = await Promise.all([
    getProgress(topic_id),
    getUserNote(topic_id)
  ]);

  const formulas = Array.isArray(resource?.formulas) ? resource.formulas as any[] : [];
  const videos = Array.isArray(resource?.videos) ? resource.videos as any[] : [];
  const externalLinks = Array.isArray(resource?.external_links) ? resource.external_links as any[] : [];
  const keyConcepts = Array.isArray(resource?.key_concepts) ? resource.key_concepts as any[] : [];

  return (
    <div className="flex flex-col gap-12 max-w-4xl mx-auto pb-16">
      {/* Header & Breadcrumbs */}
      <div>
        <nav className="flex items-center text-sm font-medium text-[var(--muted)] mb-6 overflow-x-auto whitespace-nowrap">
          <Link href="/subjects" className="hover:text-[var(--foreground)] transition-colors">Subjects</Link>
          <span className="mx-2">/</span>
          {subjectId ? (
            <Link href={`/subjects/${subjectId}`} className="hover:text-[var(--foreground)] transition-colors">{subjectName}</Link>
          ) : (
            <span>{subjectName}</span>
          )}
          <span className="mx-2">/</span>
          <span>{categoryName}</span>
          <span className="mx-2">/</span>
          <span className="text-[var(--foreground)]">{topic.name}</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold font-display">{topic.name}</h1>
              <BookmarkButton entityType="topic" entityId={topic.id} size="default" />
            </div>
            <p className="text-[var(--muted)] text-lg mb-6">{topic.description}</p>
            
            <div className="flex flex-wrap items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1">
                <Clock className="w-3.5 h-3.5" /> 45 mins
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1">
                <BarChart className="w-3.5 h-3.5" /> Intermediate
              </Badge>
              <Badge variant={progress?.status === 'completed' ? "default" : "secondary"} className="flex items-center gap-1.5 px-3 py-1">
                {progress?.status === 'completed' ? "Mastered" : "In Progress"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* 1. LEARN SECTION */}
      <div className="space-y-8 border-b border-[var(--border)] pb-12">
        <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
          <h2 className="text-2xl font-bold">1. Learn</h2>
        </div>

        {!resource ? (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <p className="text-[var(--muted)]">Learning materials are currently being developed for this topic.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {resource.study_notes && (
              <div className="prose prose-invert max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed text-lg text-[var(--muted-foreground)]">
                  {resource.study_notes}
                </p>
              </div>
            )}

            {keyConcepts.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">Key Concepts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {keyConcepts.map((concept: any, idx: number) => (
                    <Card key={idx} className="bg-[var(--card)] border-[var(--border)]">
                      <CardContent className="p-5">
                        <h4 className="font-semibold text-lg text-primary mb-2">{concept.term}</h4>
                        <p className="text-[var(--muted)]">{concept.definition}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {formulas.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">Formulas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formulas.map((f: any, i: number) => (
                    <FormulaCard 
                      key={i} 
                      name={f.name} 
                      formula={f.formula} 
                      explanation={f.explanation} 
                      variables={f.variables} 
                      topicId={topic_id}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. RESOURCES SECTION */}
      <div className="space-y-8 border-b border-[var(--border)] pb-12">
        <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
          <h2 className="text-2xl font-bold">2. Watch & Read</h2>
        </div>

        {videos.length === 0 && externalLinks.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <p className="text-[var(--muted)]">No external resources added yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {videos.length > 0 && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {videos.map((v: any, i: number) => (
                    <VideoEmbed key={i} title={v.title as string} url={v.url as string} duration={v.duration as string} topicId={topic_id} />
                  ))}
                </div>
              </div>
            )}

            {externalLinks.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><ExternalLink className="w-5 h-5 text-primary" /> References</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {externalLinks.map((link: any, i: number) => (
                    <a key={i} href={link.url as string} target="_blank" rel="noopener noreferrer" className="block group">
                      <Card className="h-full border-[var(--border)] bg-[var(--card)] transition-all group-hover:border-[var(--ring)]">
                        <CardContent className="p-4 flex items-center justify-between">
                          <span className="font-medium group-hover:text-primary transition-colors">{link.title as string}</span>
                          <ExternalLink className="w-4 h-4 text-[var(--muted)]" />
                        </CardContent>
                      </Card>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. TAKE NOTES SECTION */}
      <div className="space-y-8 border-b border-[var(--border)] pb-12">
        <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
          <h2 className="text-2xl font-bold">3. Take Notes</h2>
        </div>
        <p className="text-[var(--muted)]">Write down your own summary, examples, and reminders. These notes are private to you.</p>
        <div className="h-[400px]">
          <NotesEditor topicId={topic_id} initialContent={userNote?.content || ""} />
        </div>
      </div>

      {/* 4. PRACTICE SECTION */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
          <h2 className="text-2xl font-bold">4. Practice & Master</h2>
        </div>
        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">Ready to test your knowledge?</h3>
              <p className="text-[var(--muted)]">Take a focused practice session on {topic.name}. Missed questions will automatically be scheduled for spaced repetition review.</p>
            </div>
            <Link href={`/practice?topic=${topic_id}`} className="shrink-0 w-full md:w-auto">
              <Button size="lg" className="w-full">
                Start Practice Session
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
