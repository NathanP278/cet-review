"use client";

import { useState } from "react";
import { QuizQuestion } from "@/components/domain/QuizQuestion";
import { QuizOptions, type Option } from "@/components/domain/QuizOptions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Flag, MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ExamReviewClientProps {
  questions: any[];
  userAnswers: Record<number, string>;
  flaggedIndexes: number[];
  attemptId: string;
}

export function ExamReviewClient({ questions, userAnswers, flaggedIndexes, attemptId }: ExamReviewClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<"all" | "correct" | "incorrect" | "skipped" | "flagged">("all");

  const flaggedSet = new Set(flaggedIndexes);

  const filteredIndexes = questions.map((_, i) => i).filter(i => {
    if (filter === "all") return true;
    const userAnswer = userAnswers[i];
    const isCorrect = userAnswer === questions[i].answer;
    const isSkipped = !userAnswer;
    
    if (filter === "correct") return isCorrect;
    if (filter === "incorrect") return !isCorrect && !isSkipped;
    if (filter === "skipped") return isSkipped;
    if (filter === "flagged") return flaggedSet.has(i);
    return true;
  });

  const displayIndex = filteredIndexes.includes(currentIndex) ? currentIndex : (filteredIndexes[0] ?? 0);
  const question = questions[displayIndex];

  if (!question) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-xl font-bold">No questions found for this filter.</h2>
        <Button onClick={() => setFilter("all")} className="mt-4" variant="outline">View All</Button>
      </div>
    );
  }

  const options: Option[] = question.choices
    ? Object.entries(question.choices).map(([id, text]) => ({ id, text: text as string }))
    : [];

  const userAnswer = userAnswers[displayIndex];
  const isCorrect = userAnswer === question.answer;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[var(--background)] overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-80 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col order-2 md:order-1 h-[40vh] md:h-full">
        <div className="p-4 border-b border-[var(--border)]">
          <Link href={`/exam/${attemptId}/results`}>
            <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-[var(--muted)]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Results
            </Button>
          </Link>
          <h2 className="font-semibold mb-2">Review Questions</h2>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="w-full p-2 text-sm rounded-md border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          >
            <option value="all">All Questions</option>
            <option value="correct">Correct</option>
            <option value="incorrect">Incorrect</option>
            <option value="skipped">Skipped</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-5 gap-2">
            {filteredIndexes.map((qIndex) => {
              const answered = userAnswers[qIndex];
              const correct = answered === questions[qIndex].answer;
              const isFlagged = flaggedSet.has(qIndex);
              
              let bgColor = "bg-[var(--surface-raised)] text-[var(--muted)] border-[var(--border)]"; // Skipped
              if (answered) {
                bgColor = correct 
                  ? "bg-[var(--color-success-light)]/20 text-[var(--color-success-dark)] border-[var(--color-success)]" 
                  : "bg-[var(--color-danger-light)]/20 text-[var(--color-danger)] border-[var(--color-danger)]";
              }

              return (
                <button
                  key={qIndex}
                  onClick={() => setCurrentIndex(qIndex)}
                  className={cn(
                    "relative h-10 rounded-md border flex items-center justify-center text-sm font-medium transition-all",
                    bgColor,
                    displayIndex === qIndex ? "ring-2 ring-offset-1 ring-[var(--foreground)]" : "hover:opacity-80"
                  )}
                >
                  {qIndex + 1}
                  {isFlagged && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--color-warning)] rounded-full border border-[var(--background)]"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Review Area */}
      <div className="flex-1 flex flex-col order-1 md:order-2 h-[60vh] md:h-full overflow-y-auto relative">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg text-[var(--muted)]">
              Question {displayIndex + 1}
            </span>
            {question.topics &&
              !Array.isArray(question.topics) &&
              question.topics.subjects &&
              !Array.isArray(question.topics.subjects) && (
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-[var(--color-primary-light)]/10 text-[var(--color-primary-dark)] text-xs font-medium border border-[var(--color-primary-light)]/20">
                  {question.topics.subjects.name}
                </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            {userAnswer ? (
              isCorrect ? (
                <span className="flex items-center text-[var(--color-success)] gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Correct
                </span>
              ) : (
                <span className="flex items-center text-[var(--color-danger)] gap-1">
                  <XCircle className="h-4 w-4" /> Incorrect
                </span>
              )
            ) : (
              <span className="flex items-center text-[var(--muted)] gap-1">
                <MinusCircle className="h-4 w-4" /> Skipped
              </span>
            )}
            {flaggedSet.has(displayIndex) && (
              <span className="flex items-center text-[var(--color-warning)] gap-1 ml-2">
                <Flag className="h-4 w-4 fill-current" /> Flagged
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 p-4 md:p-8 max-w-3xl mx-auto w-full">
          <div className="mb-8">
            <QuizQuestion content={question.content} />
          </div>
          
          <QuizOptions
            options={options}
            selectedOptionId={userAnswer || null}
            correctOptionId={question.answer}
            onSelect={() => {}}
            disabled={true}
          />

          {/* Explanation Box */}
          <div className="mt-8 p-6 bg-[var(--surface-raised)] border border-[var(--border)] rounded-lg">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
              Explanation
            </h3>
            {question.explanation ? (
              <div 
                className="prose prose-sm dark:prose-invert max-w-none text-[var(--muted)]"
                dangerouslySetInnerHTML={{ __html: question.explanation }}
              />
            ) : (
              <p className="text-[var(--muted)] italic">No detailed explanation available for this question.</p>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="sticky bottom-0 z-10 flex items-center justify-between p-4 bg-[var(--background)]/80 backdrop-blur-md border-t border-[var(--border)]">
          <Button
            variant="outline"
            onClick={() => {
              const idx = filteredIndexes.indexOf(displayIndex);
              if (idx > 0) setCurrentIndex(filteredIndexes[idx - 1]);
            }}
            disabled={filteredIndexes.indexOf(displayIndex) <= 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const idx = filteredIndexes.indexOf(displayIndex);
              if (idx < filteredIndexes.length - 1) setCurrentIndex(filteredIndexes[idx + 1]);
            }}
            disabled={filteredIndexes.indexOf(displayIndex) >= filteredIndexes.length - 1}
            className="gap-2"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
