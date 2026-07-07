"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { ShuffledQuestion, submitQuizAttempt, QuizSubmission, QuizResult, verifyAnswer } from "@/app/actions/quiz";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface QuizEngineProps {
  questions: ShuffledQuestion[];
}

export function QuizEngine({ questions: initialQuestions }: QuizEngineProps) {
  const router = useRouter();
  const [configMode, setConfigMode] = useState(true);
  const [limit, setLimit] = useState(10);
  
  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // State for the current question
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; correctAnswer: string; explanation: string } | null>(null);
  
  // Accumulators for final submission
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>({});
  
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isSubmitting, startTransition] = useTransition();

  const [currentTimer, setCurrentTimer] = useState(0);

  const startQuiz = () => {
    setQuestions(initialQuestions.slice(0, limit));
    setConfigMode(false);
  };

  useEffect(() => {
    if (configMode || isFinished || feedback !== null) return;
    const timer = setInterval(() => setCurrentTimer((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [configMode, isFinished, feedback]);

  const handleSelectAnswer = (choice: string) => {
    if (feedback !== null || isEvaluating) return;
    setSelectedOption(choice);
  };

  const handleCheckAnswer = async () => {
    if (!selectedOption || isEvaluating) return;
    
    setIsEvaluating(true);
    const q = questions[currentIndex];
    
    try {
      const res = await verifyAnswer(q.id, selectedOption);
      setFeedback(res);
      
      // Save submission to state
      setSubmissions(prev => [
        ...prev, 
        {
          questionId: q.id,
          userAnswer: selectedOption,
          timeSpentSeconds: currentTimer
        }
      ]);
      
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNext = () => {
    setCurrentTimer(0);
    setSelectedOption(null);
    setFeedback(null);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = useCallback(() => {
    setIsFinished(true);
    startTransition(async () => {
      try {
        const res = await submitQuizAttempt(submissions);
        setResult(res);
        router.refresh(); // Refresh layout to update Dashboard/Heatmap/Mastery Server Components
      } catch (e) {
        console.error(e);
      }
    });
  }, [submissions, router]);

  if (initialQuestions.length === 0) {
    return (
      <div className="text-center py-24 px-4 border border-dashed rounded-lg bg-[var(--surface)]">
        <AlertCircle className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No questions found</h3>
        <p className="text-[var(--muted)]">Try adjusting your filters or generating more content for this topic.</p>
      </div>
    );
  }

  if (configMode) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 shadow-sm text-center">
        <h2 className="text-2xl font-bold mb-2">Configure Practice</h2>
        <p className="text-[var(--muted)] mb-8">How many questions would you like to answer?</p>
        
        <div className="flex justify-center gap-4 mb-8">
          {[10, 15, 20].map((num) => (
            <Button
              key={num}
              variant={limit === num ? "default" : "outline"}
              onClick={() => setLimit(num)}
              className="w-20 h-14 text-lg"
              disabled={initialQuestions.length < num && num !== initialQuestions.length}
            >
              {Math.min(num, initialQuestions.length)}
            </Button>
          ))}
        </div>
        
        <Button size="lg" className="w-full text-lg h-12" onClick={startQuiz}>
          Start Practice
        </Button>
      </div>
    );
  }

  if (isFinished) {
    if (!result) {
      return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)]" />
          <h3 className="text-xl font-medium">Analyzing your results & updating metrics...</h3>
        </div>
      );
    }
    
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center py-12 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm">
          <h2 className="text-4xl font-display font-bold mb-4">Quiz Complete!</h2>
          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col items-center">
              <span className="text-6xl font-bold text-[var(--color-primary)]">{result.score}</span>
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
        
        <div className="flex justify-center gap-4">
          <Link href="/dashboard" className="block">
            <Button size="lg" variant="default" className="gap-2">
              <CheckCircle2 className="h-5 w-5" /> Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progressPercent = ((currentIndex) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 animate-in fade-in">
      {/* Progress & Meta Header */}
      <div className="flex items-center justify-between text-sm font-medium">
        <div className="flex items-center gap-4 text-[var(--muted)]">
          <Badge variant="outline" className="uppercase tracking-wider">
            {currentQuestion.difficulty}
          </Badge>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {currentTimer}s
          </span>
        </div>
        <span className="text-[var(--foreground)]">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      <Progress value={progressPercent} className="h-2" />

      {/* Question Card */}
      <Card className="border-[var(--border)] bg-[var(--surface)] shadow-md overflow-hidden transition-all">
        <CardContent className="p-8">
          <h2 className="text-2xl leading-relaxed font-semibold mb-8 text-[var(--foreground)]">
            {currentQuestion.content}
          </h2>

          <div className="space-y-3">
            {currentQuestion.choices.map((choice, index) => {
              const isSelected = selectedOption === choice;
              let btnClass = "border-[var(--border)] bg-[var(--background)] hover:bg-[var(--color-slate-100)] dark:hover:bg-[var(--color-slate-800)]";
              
              if (isSelected && !feedback) {
                btnClass = "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]";
              } else if (feedback) {
                if (choice === feedback.correctAnswer) {
                  btnClass = "border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-success)]";
                } else if (isSelected && !feedback.isCorrect) {
                  btnClass = "border-[var(--color-destructive)] bg-[var(--color-destructive)]/10 text-[var(--color-destructive)]";
                } else {
                  btnClass = "border-[var(--border)] bg-[var(--background)] opacity-50 cursor-not-allowed";
                }
              }

              return (
                <button
                  key={index}
                  disabled={feedback !== null || isEvaluating}
                  onClick={() => handleSelectAnswer(choice)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between font-medium ${btnClass}`}
                >
                  <span>{choice}</span>
                  {feedback && choice === feedback.correctAnswer && <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />}
                  {feedback && isSelected && !feedback.isCorrect && <XCircle className="w-5 h-5 text-[var(--color-destructive)]" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Immediate Feedback Box */}
      {feedback && (
        <Card className={`border-2 animate-in slide-in-from-bottom-2 ${feedback.isCorrect ? 'border-[var(--color-success)] bg-[var(--color-success)]/5' : 'border-[var(--color-destructive)] bg-[var(--color-destructive)]/5'}`}>
          <CardContent className="p-6">
            <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${feedback.isCorrect ? 'text-[var(--color-success)]' : 'text-[var(--color-destructive)]'}`}>
              {feedback.isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
              {feedback.isCorrect ? "Correct!" : "Incorrect"}
            </h3>
            <p className="text-[var(--foreground)]">{feedback.explanation}</p>
            {!feedback.isCorrect && (
              <div className="mt-4 text-xs font-medium bg-[var(--background)] px-3 py-2 rounded-md border border-[var(--border)] text-[var(--muted)] inline-block">
                This question has been added to your Spaced Repetition flashcard queue.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="flex justify-end pt-4">
        {!feedback ? (
          <Button 
            size="lg" 
            disabled={!selectedOption || isEvaluating} 
            onClick={handleCheckAnswer}
            className="w-full md:w-auto h-14 px-8 text-lg"
          >
            {isEvaluating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Check Answer"}
          </Button>
        ) : (
          <Button 
            size="lg" 
            onClick={handleNext}
            className="w-full md:w-auto h-14 px-8 text-lg gap-2"
          >
            {currentIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
            <ArrowRight className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
