"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface FlashcardProps {
  frontContent: string;
  backContent: string;
  onRate: (quality: number) => void;
}

export function Flashcard({ frontContent, backContent, onRate }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
    }
  };

  const handleRate = (quality: number) => {
    onRate(quality);
    // Reset flip state immediately for the next card (handled by parent passing new props, but good measure)
    setIsFlipped(false);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      {/* The 3D Flip Card Container */}
      <div
        className="relative w-full h-[300px] md:h-[400px] perspective-[1000px] cursor-pointer"
        onClick={handleFlip}
      >
        <div
          className={cn(
            "w-full h-full transition-transform duration-500 preserve-3d relative",
            isFlipped ? "rotate-y-180" : ""
          )}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 backface-hidden w-full h-full flex flex-col items-center justify-center p-8 bg-[var(--surface)] border-2 border-[var(--border)] rounded-2xl shadow-sm"
            style={{ backfaceVisibility: "hidden" }}
          >
            <h3 className="text-2xl md:text-3xl text-center font-medium leading-relaxed">
              {frontContent}
            </h3>
            {!isFlipped && (
              <span className="absolute bottom-6 text-sm text-[var(--muted)] animate-pulse">
                Click to flip
              </span>
            )}
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 backface-hidden w-full h-full flex flex-col items-center justify-center p-8 bg-[var(--color-primary-light)]/5 border-2 border-[var(--color-primary)] rounded-2xl shadow-sm rotate-y-180"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <h3 className="text-xl md:text-2xl text-center font-medium leading-relaxed">
              {backContent}
            </h3>
          </div>
        </div>
      </div>

      {/* Quality Ratings (Only show when flipped) */}
      <div
        className={cn(
          "w-full mt-8 transition-all duration-300",
          isFlipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <h4 className="text-center text-sm font-semibold text-[var(--muted)] mb-4">
          How well did you know this?
        </h4>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <Button
            variant="danger"
            className="w-full flex-col h-auto py-3 gap-1"
            onClick={() => handleRate(0)}
          >
            <span className="text-lg font-bold">0</span>
            <span className="text-[10px] opacity-80 uppercase">Blackout</span>
          </Button>
          <Button
            variant="danger"
            className="w-full flex-col h-auto py-3 gap-1 bg-[var(--color-danger-light)]/80 text-[var(--color-danger-dark)] hover:bg-[var(--color-danger)] hover:text-white"
            onClick={() => handleRate(1)}
          >
            <span className="text-lg font-bold">1</span>
            <span className="text-[10px] opacity-80 uppercase">Wrong</span>
          </Button>
          <Button
            variant="warning"
            className="w-full flex-col h-auto py-3 gap-1 border-2 border-[var(--color-warning)] bg-transparent text-[var(--foreground)] hover:bg-[var(--color-warning-light)]/20"
            onClick={() => handleRate(2)}
          >
            <span className="text-lg font-bold">2</span>
            <span className="text-[10px] opacity-80 uppercase">Hard</span>
          </Button>
          <Button
            variant="warning"
            className="w-full flex-col h-auto py-3 gap-1"
            onClick={() => handleRate(3)}
          >
            <span className="text-lg font-bold">3</span>
            <span className="text-[10px] opacity-80 uppercase">Good</span>
          </Button>
          <Button
            variant="success"
            className="w-full flex-col h-auto py-3 gap-1 bg-[var(--color-success-light)]/80 text-[var(--color-success-dark)] hover:bg-[var(--color-success)] hover:text-white"
            onClick={() => handleRate(4)}
          >
            <span className="text-lg font-bold">4</span>
            <span className="text-[10px] opacity-80 uppercase">Easy</span>
          </Button>
          <Button
            variant="success"
            className="w-full flex-col h-auto py-3 gap-1"
            onClick={() => handleRate(5)}
          >
            <span className="text-lg font-bold">5</span>
            <span className="text-[10px] opacity-80 uppercase">Perfect</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
