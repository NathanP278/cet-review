"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { ExamTimer } from "@/components/domain/ExamTimer";
import { ExamNavigationGrid } from "@/components/domain/ExamNavigationGrid";
import { QuizQuestion } from "@/components/domain/QuizQuestion";
import { QuizOptions, type Option } from "@/components/domain/QuizOptions";
import { ExamResults, type SubjectScore } from "@/components/domain/ExamResults";
import { Button } from "@/components/ui/button";
import { Loader2, Flag, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveExamState } from "@/app/actions/exam";
import { useRouter } from "next/navigation";
import { useRef } from "react";

interface ExamSessionClientProps {
  attemptId: string;
  initialQuestions: any[];
  initialAnswers: Record<number, string>;
  initialFlagged: number[];
  initialRemainingSeconds: number;
}

export function ExamSessionClient({ 
  attemptId, 
  initialQuestions, 
  initialAnswers, 
  initialFlagged, 
  initialRemainingSeconds 
}: ExamSessionClientProps) {
  const router = useRouter();
  const [questions] = useState<any[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>(initialAnswers);
  const [flagged, setFlagged] = useState<Set<number>>(new Set(initialFlagged));
  
  const remainingSecondsRef = useRef(initialRemainingSeconds);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<{
    totalScore: number;
    subjectScores: SubjectScore[];
  } | null>(null);

  // Prevent accidental refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isFinished) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isFinished]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentIndex((c) => Math.max(0, c - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentIndex((c) => Math.min(questions.length - 1, c + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [questions.length]);

  // Debounced Autosave
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!isFinished && !isSubmitting) {
        saveExamState(attemptId, answers, Array.from(flagged), remainingSecondsRef.current);
      }
    }, 2000); // Autosave 2 seconds after last change

    return () => clearTimeout(handler);
  }, [answers, flagged, attemptId, isFinished, isSubmitting]);

  const handleSelect = useCallback((optionId: string) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: optionId }));
  }, [currentIndex]);

  const toggleFlag = useCallback(() => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(currentIndex)) {
        next.delete(currentIndex);
      } else {
        next.add(currentIndex);
      }
      return next;
    });
  }, [currentIndex]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Save final state first just in case
    await saveExamState(attemptId, answers, Array.from(flagged), remainingSecondsRef.current);
    
    // Call server action to grade
    try {
      // @ts-ignore
      const { submitExam } = await import("@/app/actions/exam");
      await submitExam(attemptId);
    } catch (err) {
      console.error("Submission failed", err);
    }

    setIsFinished(true);
    setIsSubmitting(false);

    // Redirect to results page
    router.push(`/exam/${attemptId}/results`);
  };


  if (questions.length === 0) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[var(--background)] p-4">
        <h2 className="text-xl font-bold">No questions available.</h2>
      </div>
    );
  }

  if (isFinished && results) {
    return (
      <div className="p-4 md:p-8">
        <ExamResults
          totalScore={results.totalScore}
          totalQuestions={questions.length}
          subjectScores={results.subjectScores}
        />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const options: Option[] = currentQuestion.choices
    ? Object.entries(currentQuestion.choices).map(([id, text]) => ({ id, text: text as string }))
    : [];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[var(--background)] overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-80 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col order-2 md:order-1 h-[40vh] md:h-full">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="font-semibold">Questions</h2>
          <span className="text-sm text-[var(--muted)]">
            {Object.keys(answers).length} / {questions.length} answered
          </span>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          <ExamNavigationGrid
            totalQuestions={questions.length}
            currentIndex={currentIndex}
            answers={answers}
            flagged={flagged}
            onNavigate={setCurrentIndex}
          />
        </div>
        <div className="p-4 border-t border-[var(--border)]">
          <Button
            className="w-full"
            size="lg"
            variant="default"
            onClick={() => {
              if (
                confirm("Are you sure you want to submit the exam? You cannot undo this action.")
              ) {
                handleSubmit();
              }
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Submit Exam
          </Button>
        </div>
      </div>

      {/* Main Exam Area */}
      <div className="flex-1 flex flex-col order-1 md:order-2 h-[60vh] md:h-full overflow-y-auto relative">
        {/* Header toolbar */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg text-[var(--muted)]">
              Question {currentIndex + 1}
            </span>
            {currentQuestion.topics &&
              !Array.isArray(currentQuestion.topics) &&
              currentQuestion.topics.subjects &&
              !Array.isArray(currentQuestion.topics.subjects) && (
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-[var(--color-primary-light)]/10 text-[var(--color-primary-dark)] dark:text-[var(--color-primary-light)] text-xs font-medium border border-[var(--color-primary-light)]/20">
                  {currentQuestion.topics.subjects.name}
                </span>
              )}
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFlag}
              className={cn(
                "gap-2",
                flagged.has(currentIndex)
                  ? "bg-[var(--color-warning-light)]/20 text-[var(--color-warning-dark)] border-[var(--color-warning)]"
                  : ""
              )}
            >
              <Flag className={cn("h-4 w-4", flagged.has(currentIndex) ? "fill-current" : "")} />
              <span className="hidden sm:inline">Flag</span>
            </Button>
            <ExamTimer 
              initialSeconds={initialRemainingSeconds} 
              onExpire={handleSubmit} 
              onTick={(left) => { remainingSecondsRef.current = left; }}
            />
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 p-4 md:p-8 max-w-3xl mx-auto w-full">
          <div className="mb-8">
            <QuizQuestion content={currentQuestion.content} />
          </div>
          <QuizOptions
            options={options}
            selectedOptionId={answers[currentIndex] || null}
            correctOptionId={null} // Don't show correct answer during exam!
            onSelect={handleSelect}
            disabled={false}
          />
        </div>

        {/* Footer Navigation */}
        <div className="sticky bottom-0 z-10 flex items-center justify-between p-4 bg-[var(--background)]/80 backdrop-blur-md border-t border-[var(--border)]">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex((c) => Math.max(0, c - 1))}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          {currentIndex === questions.length - 1 ? (
            <Button
              variant="default"
              onClick={() => {
                if (
                  confirm("Are you sure you want to submit the exam? You cannot undo this action.")
                ) {
                  handleSubmit();
                }
              }}
              disabled={isSubmitting}
              className="gap-2 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Exam
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setCurrentIndex((c) => Math.min(questions.length - 1, c + 1))}
              className="gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
