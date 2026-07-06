import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r border-[var(--border)] bg-[var(--surface)] sm:flex">
      <div className="flex h-16 items-center border-b border-[var(--border)] px-6">
        <span className="font-display text-lg font-bold text-[var(--color-primary)]">
          UPCAT Prep
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-2 p-4">
        <Link
          href="/dashboard"
          className="rounded-md px-3 py-2 text-sm font-medium text-[var(--muted)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/subjects"
          className="rounded-md px-3 py-2 text-sm font-medium text-[var(--muted)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
        >
          Subjects
        </Link>
        <Link
          href="/mock-exam"
          className="rounded-md px-3 py-2 text-sm font-medium text-[var(--muted)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
        >
          Mock Exams
        </Link>
        <Link
          href="/analytics"
          className="rounded-md px-3 py-2 text-sm font-medium text-[var(--muted)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
        >
          Analytics
        </Link>
        <Link
          href="/settings"
          className="rounded-md px-3 py-2 text-sm font-medium text-[var(--muted)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
        >
          Settings
        </Link>
      </nav>
    </aside>
  );
}
