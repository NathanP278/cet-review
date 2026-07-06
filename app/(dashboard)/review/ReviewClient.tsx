"use client";

import { useState } from "react";
import { Flashcard } from "@/components/domain/Flashcard";
import { processReviewAction } from "@/app/actions/sm2";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ReviewClient({ initialCards }: { initialCards: any[] }) {
  const [cards] = useState(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);



  const handleRate = async (rating: "again" | "hard" | "good" | "easy", timeSpentMs: number) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const currentCard = cards[currentIndex];
      // Convert timeSpentMs to seconds for DB
      const timeSpentSecs = timeSpentMs / 1000;
      // Call the Server Action to process the SM-2 logic and update DB
      await processReviewAction(currentCard.id, rating, timeSpentSecs);

      // Move to next card
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((c) => c + 1);
      } else {
        // Finished!
        setIsFinished(true);
        fireConfetti();
      }
    } catch (error) {
      console.error("Failed to process review:", error);
      alert("Failed to save review. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const fireConfetti = () => {
    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 40 * (timeLeft / duration);
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: Math.random(), y: Math.random() - 0.2 },
        })
      );
    }, 250);
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-500">
        <div className="w-16 h-16 bg-[var(--color-success-light)]/20 text-[var(--color-success)] rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-3xl font-bold font-display mb-2">You&apos;re all caught up!</h2>
        <p className="text-[var(--muted)] max-w-md mb-8">
          You have reviewed all your due flashcards for today. Take a break, or jump into a practice
          quiz to discover new topics.
        </p>
        <Link href="/practice">
          <Button size="lg">Take a Mixed Quiz</Button>
        </Link>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in duration-500">
        <Card className="w-full max-w-md border-[var(--color-primary)]">
          <CardContent className="flex flex-col items-center gap-6 p-8">
            <div className="text-5xl">🎉</div>
            <div>
              <h2 className="text-2xl font-bold font-display text-[var(--foreground)]">
                Review Complete!
              </h2>
              <p className="text-[var(--muted)] mt-2">
                You successfully reviewed {cards.length} cards today.
              </p>
            </div>
            <Link href="/dashboard" className="w-full">
              <Button className="w-full">Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  // We assume questions is a single object because it's a many-to-one relationship
  const question = Array.isArray(currentCard.questions)
    ? currentCard.questions[0]
    : currentCard.questions;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 py-6">
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-2xl font-bold font-display">Daily Review</h1>
        <div className="flex items-center gap-4">
          <Progress value={(currentIndex / cards.length) * 100} className="flex-1" />
          <span className="text-sm font-medium text-[var(--muted)] whitespace-nowrap">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>
      </div>

      <div className="relative">
        {isProcessing && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--background)]/50 backdrop-blur-sm rounded-2xl">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
          </div>
        )}
        <Flashcard
          frontContent={question.content}
          backContent={
            question.answer +
            (question.explanation ? `\n\nExplanation: ${question.explanation}` : "")
          }
          onRate={handleRate}
        />
      </div>
    </div>
  );
}
