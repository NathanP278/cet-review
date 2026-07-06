import { cn } from "@/lib/utils";

export interface Option {
  id: string;
  text: string;
}

export interface QuizOptionsProps {
  options: Option[];
  selectedOptionId: string | null;
  correctOptionId: string | null; // provided after user answers
  onSelect: (optionId: string) => void;
  disabled?: boolean;
}

export function QuizOptions({
  options,
  selectedOptionId,
  correctOptionId,
  onSelect,
  disabled = false,
}: QuizOptionsProps) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => {
        const isSelected = selectedOptionId === option.id;
        const isCorrect = correctOptionId === option.id;
        const isWrong = isSelected && correctOptionId && !isCorrect;
        const showCorrect = correctOptionId && isCorrect; // Highlight the correct answer once revealed

        return (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            disabled={disabled}
            className={cn(
              "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] ring-offset-[var(--background)]",
              {
                "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]/5":
                  !selectedOptionId && !correctOptionId, // Default unselected state
                "border-[var(--color-primary)] bg-[var(--color-primary-light)]/10 text-[var(--color-primary-dark)] dark:text-[var(--color-primary-light)]":
                  isSelected && !correctOptionId, // Selected but not submitted yet (if we support a submit step)
                "border-[var(--color-success)] bg-[var(--color-success-light)]/20 text-[var(--color-success-dark)] dark:text-[var(--color-success-light)]":
                  showCorrect,
                "border-[var(--color-danger)] bg-[var(--color-danger-light)]/20 text-[var(--color-danger-dark)] dark:text-[var(--color-danger-light)]":
                  isWrong,
                "opacity-50 cursor-not-allowed": disabled && !isCorrect && !isWrong,
              }
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-semibold",
                  {
                    "border-[var(--border)] text-[var(--muted)]":
                      !isSelected && !showCorrect && !isWrong,
                    "border-[var(--color-primary)] text-[var(--color-primary-dark)] dark:text-[var(--color-primary-light)]":
                      isSelected && !correctOptionId,
                    "border-[var(--color-success)] text-[var(--color-success-dark)] dark:text-[var(--color-success-light)]":
                      showCorrect,
                    "border-[var(--color-danger)] text-[var(--color-danger-dark)] dark:text-[var(--color-danger-light)]":
                      isWrong,
                  }
                )}
              >
                {option.id}
              </div>
              <span className="flex-1 font-medium">{option.text}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
