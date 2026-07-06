"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { QuizQuestion } from "@/components/domain/QuizQuestion";
import { QuizOptions, type Option } from "@/components/domain/QuizOptions";
import { QuizResults } from "@/components/domain/QuizResults";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

// In a real app, this would be heavily validated on the server.
// For the MVP, we load questions and handle the logic on the client.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PracticeClient({ initialQuestions }: { initialQuestions: any[] }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [questions, setQuestions] = useState<any[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadQuestions = async () => {
    setLoading(true);
    const supabase = createClient();

    // Fetch 5 random MCQ questions for practice MVP
    // In a full app, this uses SM-2 algorithm via an Edge Function or RPC
    const { data, error } = await supabase.from("questions").select("*").eq("type", "mcq").limit(5);

    if (!error && data) {
      setQuestions(data);
    }
    setLoading(false);
  };

  const handleSelect = (optionId: string) => {
    if (isRevealed) return; // prevent changing answer after reveal
    setSelectedOption(optionId);
  };

  const handleSubmit = () => {
    if (!selectedOption || isRevealed) return;

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedOption === currentQuestion.answer;

    if (isCorrect) {
      setScore((s) => s + 1);
    }

    setAnswers((prev) => [...prev, selectedOption]);
    setIsRevealed(true);
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((c) => c + 1);
      setSelectedOption(null);
      setIsRevealed(false);
    } else {
      setIsFinished(true);
      await saveAttempt();
    }
  };

  const saveAttempt = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const finalScore = score + (selectedOption === questions[currentIndex].answer ? 1 : 0);

      // 1. Save the quiz attempt
      await supabase.from("quiz_attempts").insert({
        user_id: user.id,
        topic_id: questions[0]?.topic_id,
        score: finalScore,
        total: questions.length,
      });

      // 2. Mistake -> Flashcard Pipeline (M7)
      const wrongQuestions = questions.filter((q, idx) => {
        const userAnswer = answers[idx] || (idx === currentIndex ? selectedOption : null);
        return userAnswer !== q.answer;
      });

      if (wrongQuestions.length > 0) {
        const upsertData = wrongQuestions.map((q) => ({
          user_id: user.id,
          question_id: q.id,
          interval: 0,
          ease_factor: 2.5,
          next_review: new Date().toISOString(),
        }));
        await supabase.from("user_cards").upsert(upsertData);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "Enter") {
        e.preventDefault();
        if (!isRevealed && selectedOption) {
          handleSubmit();
        } else if (isRevealed) {
          handleNext();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRevealed, selectedOption, currentIndex, questions.length]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-xl font-bold">No questions available.</h2>
        <p className="text-[var(--muted)]">Please check back later or seed the database.</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <QuizResults
        score={score}
        total={questions.length}
        onRetry={() => {
          setCurrentIndex(0);
          setScore(0);
          setAnswers([]);
          setIsFinished(false);
          setSelectedOption(null);
          setIsRevealed(false);
          loadQuestions();
        }}
      />
    );
  }

  const currentQuestion = questions[currentIndex];
  // Convert Supabase JSON choices to Option array
  const options: Option[] = currentQuestion.choices
    ? Object.entries(currentQuestion.choices).map(([id, text]) => ({
        id,
        text: text as string,
      }))
    : [];

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 py-6">
      <div className="flex items-center gap-4 mb-4">
        <Progress value={(currentIndex / questions.length) * 100} className="flex-1" />
        <span className="text-sm font-medium text-[var(--muted)] whitespace-nowrap">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <QuizQuestion content={currentQuestion.content} />

      <QuizOptions
        options={options}
        selectedOptionId={selectedOption}
        correctOptionId={isRevealed ? currentQuestion.answer : null}
        onSelect={handleSelect}
        disabled={isRevealed}
      />

      {isRevealed && currentQuestion.explanation && (
        <div className="mt-4 p-4 rounded-lg bg-[var(--color-primary-light)]/10 border border-[var(--color-primary-light)]/20 animate-in fade-in duration-300">
          <h4 className="font-semibold text-[var(--color-primary-dark)] dark:text-[var(--color-primary-light)] mb-1">
            Explanation
          </h4>
          <p className="text-sm text-[var(--foreground)]">{currentQuestion.explanation}</p>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        {!isRevealed ? (
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!selectedOption}
            className="w-full sm:w-auto"
          >
            Check Answer
          </Button>
        ) : (
          <Button size="lg" onClick={handleNext} className="w-full sm:w-auto">
            {currentIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
          </Button>
        )}
      </div>
    </div>
  );
}
