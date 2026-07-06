import { Menu, Flame, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:px-6">
      <div className="flex items-center gap-4 sm:hidden">
        <Button variant="ghost" size="icon" className="-ml-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <span className="font-display font-bold text-[var(--color-primary)]">UPCAT Prep</span>
      </div>
      <div className="hidden sm:block">{/* Breadcrumb or Page Title Placeholder */}</div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-full bg-[var(--color-warning-light)]/20 px-3 py-1 text-sm font-semibold text-[var(--color-warning-dark)] dark:text-[var(--color-warning)] border border-[var(--color-warning-light)]/30">
          <Flame className="h-4 w-4 fill-current" />
          <span>0</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-[var(--color-slate-100)] dark:bg-[var(--color-slate-800)]"
        >
          <User className="h-5 w-5 text-[var(--muted)]" />
        </Button>
      </div>
    </header>
  );
}
