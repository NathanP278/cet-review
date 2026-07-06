"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, PlayCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { NotesEditor } from "./NotesEditor";


export interface TopicProps {
  id: string;
  name: string;
  progress: number; // 0 to 100
  notes: string | null;
  userNoteContent?: string | null;
}

export function TopicAccordion({ topic }: { topic: TopicProps }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-[var(--border)] rounded-lg bg-[var(--surface)] overflow-hidden flex flex-col">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--color-slate-100)] dark:hover:bg-[var(--color-slate-800)] transition-colors focus:outline-none"
      >
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-left">{topic.name}</h4>
            <span className="text-sm font-medium text-[var(--muted)]">
              {topic.progress}% Mastered
            </span>
          </div>
          <Progress value={topic.progress} className="h-2" />
        </div>
        <div className="ml-6 text-[var(--muted)]">
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-[var(--border)] bg-[var(--background)] animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Official Notes */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-[var(--color-primary)]" />
                <h5 className="font-semibold text-[var(--foreground)]">Official Study Notes</h5>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none text-[var(--muted)]">
                {topic.notes ? (
                  <p>{topic.notes}</p>
                ) : (
                  <p className="italic">
                    No official study notes available for this topic yet.
                  </p>
                )}
              </div>
            </div>

            {/* Personal Notes */}
            <div className="flex-1 min-w-0 md:border-l md:border-[var(--border)] md:pl-6">
              <NotesEditor 
                topicId={topic.id} 
                initialContent={topic.userNoteContent || ""} 
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border)]">
            <Link href="/review" passHref>
              <Button variant="outline" size="sm">
                Spaced Repetition
              </Button>
            </Link>
            <Link href={`/practice?topic=${topic.id}`} passHref>
              <Button size="sm" className="gap-2">
                <PlayCircle className="h-4 w-4" />
                Practice Topic
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
