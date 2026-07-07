"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { Bookmark, Flag, FileText, Lightbulb } from "lucide-react";

export interface FlashcardProps {
  cardId: string;
  questionId: string;
  frontContent: string;
  backContent: string;
  explanation?: string | null;
  intervalProjections: Record<string, number>;
  onRate: (rating: "again" | "hard" | "good" | "easy", timeSpentMs: number) => void;
}

export function Flashcard({
  frontContent,
  backContent,
  explanation,
  intervalProjections,
  onRate,
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [startTime] = useState(() => Date.now());
  const controls = useAnimation();

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
    }
  };

  const formatInterval = (days: number) => {
    if (days === 0) return "< 10m";
    if (days < 30) return `${days}d`;
    if (days < 365) return `${Math.round(days / 30)}mo`;
    return `${(days / 365).toFixed(1)}y`;
  };

  const handleRate = async (rating: "again" | "hard" | "good" | "easy") => {
    const timeSpentMs = Date.now() - startTime;
    
    // Animate out based on rating
    const direction = rating === "again" || rating === "hard" ? -1 : 1;
    await controls.start({
      x: direction * 500,
      opacity: 0,
      rotate: direction * 20,
      transition: { duration: 0.3 },
    });
    
    onRate(rating, timeSpentMs);
  };

  // Drag Gesture using Framer Motion
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isFlipped) return; // Only allow swipe after reveal
    
    const mx = info.offset.x;
    const vx = info.velocity.x;
    const trigger = Math.abs(vx) > 500 || Math.abs(mx) > 150; // Threshold to trigger action

    if (trigger) {
      // Swiped!
      const rating = mx < 0 ? "again" : "easy";
      handleRate(rating);
    } else {
      // Dragging or didn't pass threshold, spring back
      controls.start({
        x: 0,
        rotate: 0,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space" && !isFlipped) {
        e.preventDefault();
        handleFlip();
      } else if (isFlipped) {
        if (e.code === "Digit1") handleRate("again");
        if (e.code === "Digit2") handleRate("hard");
        if (e.code === "Digit3") handleRate("good");
        if (e.code === "Digit4") handleRate("easy");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFlipped]);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4">
      
      {/* Toolbar */}
      <div className="w-full flex items-center justify-end gap-2 mb-4">
         <Button variant="ghost" size="sm" className="text-[var(--muted)] hover:text-[var(--foreground)]" onClick={() => setShowHint(true)} title="Show Hint (H)">
           <Lightbulb className="w-4 h-4 mr-1" /> Hint
         </Button>
         <Button variant="ghost" size="sm" className="text-[var(--muted)] hover:text-[var(--foreground)]" title="Notes (N)">
           <FileText className="w-4 h-4 mr-1" /> Notes
         </Button>
         <Button variant="ghost" size="sm" className="text-[var(--muted)] hover:text-[var(--foreground)]" title="Bookmark (B)">
           <Bookmark className="w-4 h-4 mr-1" /> Bookmark
         </Button>
         <Button variant="ghost" size="sm" className="text-[var(--muted)] hover:text-danger" title="Report Issue">
           <Flag className="w-4 h-4" />
         </Button>
      </div>

      {/* The 3D Flip Card Container using Framer Motion */}
      <motion.div
        drag={isFlipped ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.8}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ opacity: 0, y: 20 }}
        className="relative w-full h-[400px] md:h-[500px] perspective-[1500px] cursor-pointer touch-none"
        onClick={handleFlip}
      >
        <motion.div
          className="w-full h-full preserve-3d relative"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 backface-hidden w-full h-full flex flex-col items-center justify-center p-8 bg-[var(--surface)] border-2 border-[var(--border)] rounded-2xl shadow-md"
            style={{ backfaceVisibility: "hidden" }}
          >
            <h3 className="text-2xl md:text-3xl text-center font-medium leading-relaxed">
              {frontContent}
            </h3>

            {showHint && (
               <div className="mt-8 p-4 bg-[var(--color-warning-light)]/20 text-[var(--color-warning-dark)] rounded-lg text-sm max-w-sm text-center animate-fade-in border border-[var(--color-warning-light)]">
                 Hint: Think about the core principles of this topic.
               </div>
            )}

            {!isFlipped && (
              <span className="absolute bottom-6 text-sm text-[var(--muted)] animate-pulse flex items-center gap-2">
                Tap or press <kbd className="border border-[var(--border)] px-2 py-0.5 rounded-md shadow-sm">Space</kbd> to reveal
              </span>
            )}
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 backface-hidden w-full h-full flex flex-col p-8 bg-[var(--color-primary-light)]/5 border-2 border-[var(--color-primary)] rounded-2xl shadow-md rotate-y-180 overflow-y-auto"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
             <div className="flex-1 flex flex-col items-center justify-center">
               <span className="text-sm font-semibold text-[var(--color-success)] uppercase tracking-wider mb-2">Answer</span>
               <h3 className="text-xl md:text-3xl text-center font-bold leading-relaxed mb-6">
                  {backContent}
               </h3>
               
               {explanation && (
                 <div className="w-full text-left mt-6 p-4 bg-white dark:bg-black/20 rounded-xl border border-[var(--border)]">
                   <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider block mb-2">Explanation</span>
                   <p className="text-sm md:text-base leading-relaxed text-[var(--foreground)]">{explanation}</p>
                 </div>
               )}
             </div>

             <div className="mt-auto pt-4 text-center text-xs text-[var(--muted)] flex justify-center gap-4">
                <span className="flex items-center gap-1">← Swipe Left for Again</span>
                <span className="flex items-center gap-1">Swipe Right for Easy →</span>
             </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Quality Ratings (Only show when flipped) */}
      <div
        className={cn(
          "w-full mt-8 transition-all duration-500",
          isFlipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
        )}
      >
        <h4 className="text-center text-sm font-semibold text-[var(--muted)] mb-4">
          How well did you know this?
        </h4>
        <div className="grid grid-cols-4 gap-2 md:gap-4">
          <Button
            variant="danger"
            className="w-full flex-col h-auto py-3 gap-1 shadow-sm relative group"
            onClick={(e) => { e.stopPropagation(); handleRate("again"); }}
          >
            <span className="text-sm font-bold uppercase tracking-wider">Again</span>
            <span className="text-[10px] opacity-70 border border-current rounded-sm px-1.5">{formatInterval(intervalProjections.again)}</span>
            <span className="absolute -top-3 right-2 text-[10px] bg-black text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">1</span>
          </Button>
          <Button
            variant="warning"
            className="w-full flex-col h-auto py-3 gap-1 shadow-sm border-2 border-[var(--color-warning)] bg-transparent text-[var(--foreground)] hover:bg-[var(--color-warning-light)]/20 relative group"
            onClick={(e) => { e.stopPropagation(); handleRate("hard"); }}
          >
            <span className="text-sm font-bold uppercase tracking-wider">Hard</span>
            <span className="text-[10px] opacity-70 border border-current rounded-sm px-1.5">{formatInterval(intervalProjections.hard)}</span>
            <span className="absolute -top-3 right-2 text-[10px] bg-black text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">2</span>
          </Button>
          <Button
            variant="success"
            className="w-full flex-col h-auto py-3 gap-1 shadow-sm border-2 border-[var(--color-success)] bg-transparent text-[var(--foreground)] hover:bg-[var(--color-success-light)]/20 relative group"
            onClick={(e) => { e.stopPropagation(); handleRate("good"); }}
          >
            <span className="text-sm font-bold uppercase tracking-wider">Good</span>
            <span className="text-[10px] opacity-70 border border-current rounded-sm px-1.5">{formatInterval(intervalProjections.good)}</span>
            <span className="absolute -top-3 right-2 text-[10px] bg-black text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">3</span>
          </Button>
          <Button
            variant="success"
            className="w-full flex-col h-auto py-3 gap-1 shadow-sm bg-[var(--color-success-light)] text-[var(--color-success-dark)] hover:bg-[var(--color-success)] hover:text-white relative group"
            onClick={(e) => { e.stopPropagation(); handleRate("easy"); }}
          >
            <span className="text-sm font-bold uppercase tracking-wider">Easy</span>
            <span className="text-[10px] opacity-70 border border-current rounded-sm px-1.5">{formatInterval(intervalProjections.easy)}</span>
            <span className="absolute -top-3 right-2 text-[10px] bg-black text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">4</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
