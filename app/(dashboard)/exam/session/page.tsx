"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ExamTimer } from "@/components/domain/ExamTimer";
import { ExamNavigationGrid } from "@/components/domain/ExamNavigationGrid";
import { QuizQuestion } from "@/components/domain/QuizQuestion";
import { QuizOptions, type Option } from "@/components/domain/QuizOptions";
import { ExamResults, type SubjectScore } from "@/components/domain/ExamResults";
import { Button } from "@/components/ui/button";
import { Loader2, Flag, ArrowRight, ArrowLeft } from "lucide-react";

const EXAM_DURATION_SECONDS = 7200; // 120 minutes

export default function ExamSessionPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());

  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    const supabase = createClient();

    // Fetch 60 random MCQ questions.
    // In a real app, this would use a complex RPC to ensure balanced subject distribution.
    const { data, error } = await supabase
      .from("questions")
      .select(
        `
        id,
        content,
        answer,
        choices,
        topics (
          id,
          name,
          subjects (
            id,
            name
          )
        )
      `
      )
      .eq("type", "mcq")
      .limit(60);

    if (!error && data) {
      // Shuffle the questions lightly or group them. We'll just use as is for MVP.
      setQuestions(data);
    }
    setLoading(false);
  };

  const handleSelect = (optionId: string) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: optionId }));
  };

  const toggleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(currentIndex)) {
        next.delete(currentIndex);
      } else {
        next.add(currentIndex);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Grade the exam
    let totalScore = 0;
    const subjectMap: Record<string, { score: number; total: number }> = {};

    questions.forEach((q, idx) => {
      // Safely extract subject name
      let subjectName = "General";
      if (
        q.topics &&
        !Array.isArray(q.topics) &&
        q.topics.subjects &&
        !Array.isArray(q.topics.subjects)
      ) {
        subjectName = q.topics.subjects.name;
      }

      if (!subjectMap[subjectName]) {
        subjectMap[subjectName] = { score: 0, total: 0 };
      }

      subjectMap[subjectName].total += 1;

      const userAnswer = answers[idx];
      if (userAnswer === q.answer) {
        totalScore += 1;
        subjectMap[subjectName].score += 1;
      }
    });

    const subjectScores: SubjectScore[] = Object.entries(subjectMap).map(([name, data]) => ({
      name,
      score: data.score,
      total: data.total,
    }));

    setResults({ totalScore, subjectScores });

    // Save to database
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("mock_exam_attempts").insert({
        user_id: user.id,
        score_data: { totalScore, totalQuestions: questions.length, subjectScores },
      });
    }

    setIsFinished(true);
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

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
            <ExamTimer initialSeconds={EXAM_DURATION_SECONDS} onExpire={handleSubmit} />
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
          <Button
            variant="outline"
            onClick={() => setCurrentIndex((c) => Math.min(questions.length - 1, c + 1))}
            disabled={currentIndex === questions.length - 1}
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
