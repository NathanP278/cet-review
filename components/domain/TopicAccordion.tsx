"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface TopicProps {
  id: string;
  name: string;
  progress: number; // 0 to 100
  notes: string | null;
}

export function TopicAccordion({ topic }: { topic: TopicProps }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-[var(--border)] rounded-lg bg-[var(--surface)] overflow-hidden">
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
          <div className="prose prose-sm dark:prose-invert max-w-none text-[var(--muted)] mb-4">
            {topic.notes ? (
              <p>{topic.notes}</p>
            ) : (
              <p>
                No study notes available for this topic yet. Jump into practice to build your
                mastery!
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm">
              Review Notes
            </Button>
            <Button size="sm" className="gap-2">
              <PlayCircle className="h-4 w-4" />
              Practice Topic
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
