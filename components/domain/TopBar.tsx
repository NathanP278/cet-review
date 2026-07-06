"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Flame, User, BrainCircuit, X, LayoutDashboard, Library, PenTool, BarChart3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Subjects", href: "/subjects", icon: Library },
  { name: "Mock Exams", href: "/mock-exam", icon: PenTool },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function TopBar({ streak = 0 }: { streak?: number }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:px-6 z-40 relative">
        <div className="flex items-center gap-4 sm:hidden">
          <Button variant="ghost" size="icon" className="-ml-2" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <BrainCircuit className="h-6 w-6 text-[var(--color-primary)]" />
          <span className="font-display font-bold text-[var(--color-primary)]">CET Prep</span>
        </div>
        <div className="hidden sm:block">{/* Breadcrumb or Page Title Placeholder */}</div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-[var(--color-warning-light)]/20 px-3 py-1 text-sm font-semibold text-[var(--color-warning-dark)] dark:text-[var(--color-warning)] border border-[var(--color-warning-light)]/30 transition-all duration-300">
            <Flame className="h-4 w-4 fill-current animate-pulse" />
            <span>{streak}</span>
          </div>
          <Link href="/settings">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-[var(--color-slate-100)] dark:bg-[var(--color-slate-800)] hover:scale-105 transition-transform"
            >
              <User className="h-5 w-5 text-[var(--muted)]" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex sm:hidden">
          <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-[var(--surface)] pb-12 shadow-xl animate-in slide-in-from-left duration-300">
            <div className="flex px-4 pb-2 pt-5 items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-6 w-6 text-[var(--color-primary)]" />
                <span className="font-display text-xl font-bold text-[var(--color-primary)]">
                  CET Prep
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex flex-col gap-2 p-4 mt-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium transition-colors",
                      isActive
                        ? "bg-[var(--color-primary)] text-white"
                        : "text-[var(--muted)] hover:bg-[var(--color-slate-100)] dark:hover:bg-[var(--color-slate-800)] hover:text-[var(--foreground)]"
                    )}
                  >
                    <item.icon
                      className={cn("h-5 w-5", isActive ? "text-white" : "text-[var(--muted)]")}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
