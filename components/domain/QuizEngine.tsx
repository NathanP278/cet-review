"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw, HelpCircle, ArrowRight } from "lucide-react";
import { ShuffledQuestion, submitQuizAttempt, QuizSubmission, QuizResult } from "@/app/actions/quiz";

interface QuizEngineProps {
  questions: ShuffledQuestion[];
}

export function QuizEngine({ questions: initialQuestions }: QuizEngineProps) {
  const [questions] = useState<ShuffledQuestion[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [, startTransition] = useTransition();

  const [currentTimer, setCurrentTimer] = useState(0);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (isFinished) return;
    const timer = setInterval(() => setCurrentTimer((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [currentIndex, isFinished]);

  const handleSelectAnswer = (choice: string) => {
    if (answers[currentQuestion.id]) return; // prevent changing answer in this MVP
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: choice }));
    setTimeSpent((prev) => ({ ...prev, [currentQuestion.id]: currentTimer }));
  };

  const handleNext = () => {
    setCurrentTimer(0);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = useCallback(() => {
    setIsFinished(true);
    startTransition(async () => {
      const submissions: QuizSubmission[] = Object.keys(answers).map((qId) => ({
        questionId: qId,
        userAnswer: answers[qId],
        timeSpentSeconds: timeSpent[qId] || 0,
      }));
      
      try {
        const res = await submitQuizAttempt(submissions);
        setResult(res);
      } catch (e) {
        console.error(e);
        // Error handling in a real app
      }
    });
  }, [answers, timeSpent]);

  if (questions.length === 0) {
    return (
      <div className="text-center py-24 px-4 border border-dashed rounded-lg bg-[var(--surface)]">
        <AlertCircle className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No questions found</h3>
        <p className="text-[var(--muted)]">Try adjusting your filters or generating more content for this topic.</p>
      </div>
    );
  }

  if (isFinished && result) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center py-12 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm">
          <h2 className="text-4xl font-display font-bold mb-4">Quiz Complete!</h2>
          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col items-center">
              <span className="text-6xl font-bold text-primary">{result.score}</span>
              <span className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider">Score</span>
            </div>
            <div className="h-16 w-px bg-[var(--border)]"></div>
            <div className="flex flex-col items-center">
              <span className="text-6xl font-bold text-[var(--foreground)]">{result.total}</span>
              <span className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider">Total</span>
            </div>
            <div className="h-16 w-px bg-[var(--border)]"></div>
            <div className="flex flex-col items-center">
              <span className="text-6xl font-bold text-[var(--color-success)]">
                {Math.round((result.score / result.total) * 100)}%
              </span>
              <span className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider">Accuracy</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold border-b border-[var(--border)] pb-2">Review your answers</h3>
          {result.results.map((res, idx) => {
            const originalQ = questions.find((q) => q.id === res.questionId)!;
            return (
              <Card key={idx} className={`border-l-4 ${res.isCorrect ? 'border-l-[var(--color-success)]' : 'border-l-[var(--color-warning)]'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 shrink-0">
                      {res.isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-[var(--color-success)]" />
                      ) : (
                        <XCircle className="w-6 h-6 text-[var(--color-warning)]" />
                      )}
                    </div>
                    <div className="flex-1 space-y-4">
                      <p className="text-lg font-medium leading-relaxed">{originalQ.content}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3 bg-[var(--color-slate-100)] dark:bg-[var(--color-slate-800)]/50 rounded-lg border border-[var(--border)]">
                          <span className="text-xs uppercase tracking-wider text-[var(--muted)] block mb-1">Your Answer</span>
                          <span className={res.isCorrect ? "text-[var(--color-success)] font-medium" : "text-[var(--color-warning)] font-medium"}>
                            {res.userAnswer}
                          </span>
                        </div>
                        {!res.isCorrect && (
                          <div className="p-3 bg-[var(--color-success)]/10 rounded-lg border border-[var(--color-success)]/30">
                            <span className="text-xs uppercase tracking-wider text-[var(--color-success)] block mb-1">Correct Answer</span>
                            <span className="text-[var(--color-success)] font-medium">{res.correctAnswer}</span>
                          </div>
                        )}
                      </div>

                      {res.explanation && (
                        <div className="mt-4 p-4 bg-[var(--muted)]/30 rounded-lg border border-[var(--border)] text-sm">
                          <h5 className="font-semibold mb-2 flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Explanation</h5>
                          <div className="prose prose-sm dark:prose-invert max-w-none text-[var(--muted-foreground)] whitespace-pre-wrap">
                            {res.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center pt-8">
          <Button size="lg" className="w-full md:w-auto" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" /> Start Another Session
          </Button>
        </div>
      </div>
    );
  }

  if (isFinished && !result) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <RefreshCw className="w-10 h-10 animate-spin text-primary" />
        <h2 className="text-2xl font-bold">Evaluating your answers...</h2>
        <p className="text-[var(--muted)]">Syncing with Spaced Repetition engine.</p>
      </div>
    );
  }

  const hasAnsweredCurrent = !!answers[currentQuestion.id];
  const progressPercent = ((currentIndex) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-full space-y-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <div className="flex items-center gap-2 text-[var(--muted)] text-sm font-medium">
          <Clock className="w-4 h-4" />
          <span>{currentTimer}s</span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="h-2 w-full bg-[var(--muted)]/20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Card */}
      <Card className="border-[var(--border)] shadow-md bg-[var(--surface)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 bg-primary h-full"></div>
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Badge variant="outline" className="uppercase tracking-widest text-[10px]">{currentQuestion.difficulty}</Badge>
            <Badge variant="secondary" className="uppercase tracking-widest text-[10px]">Estimated: {currentQuestion.estimated_time_seconds}s</Badge>
          </div>
          
          <h2 className="text-xl md:text-2xl font-medium leading-relaxed mb-8">
            {currentQuestion.content}
          </h2>

          <div className="space-y-3">
            {currentQuestion.choices.map((choice, i) => {
              const isSelected = answers[currentQuestion.id] === choice;
              return (
                <button
                  key={i}
                  disabled={hasAnsweredCurrent}
                  onClick={() => handleSelectAnswer(choice)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected 
                      ? "border-primary bg-primary/5 text-[var(--foreground)]" 
                      : "border-[var(--border)] hover:border-primary/50 hover:bg-[var(--muted)]/10 text-[var(--muted-foreground)]"
                  } ${hasAnsweredCurrent && !isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-semibold border ${
                      isSelected ? "bg-primary text-primary-foreground border-primary" : "border-[var(--border)]"
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="text-lg">{choice}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <Button 
              size="lg" 
              disabled={!hasAnsweredCurrent}
              onClick={handleNext}
              className="gap-2"
            >
              {currentIndex === questions.length - 1 ? "Submit Exam" : "Next Question"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
