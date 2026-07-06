export function QuizQuestion({ content }: { content: string }) {
  return (
    <div className="bg-[var(--surface)] p-6 md:p-8 rounded-xl border border-[var(--border)] shadow-sm mb-6">
      <h2 className="text-xl md:text-2xl font-medium text-[var(--foreground)] leading-relaxed">
        {content}
      </h2>
    </div>
  );
}
