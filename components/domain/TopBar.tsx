export function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-6">
      <div className="flex items-center gap-4 sm:hidden">
        <span className="font-display font-bold text-[var(--color-primary)]">UPCAT Prep</span>
      </div>
      <div className="hidden sm:block">{/* Breadcrumb or Page Title Placeholder */}</div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 rounded-full bg-[var(--color-warning-light)] px-3 py-1 text-sm font-semibold text-[var(--color-warning-dark)]">
          🔥 0
        </div>
        <div className="h-8 w-8 rounded-full bg-[var(--color-primary-light)]"></div>
      </div>
    </header>
  );
}
