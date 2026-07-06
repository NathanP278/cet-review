import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BrainCircuit, Target, LineChart } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-[var(--color-primary)]" />
          <span className="font-display text-xl font-bold text-[var(--color-primary)]">
            UPCAT Prep
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Sign In
          </Link>
          <Link href="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center py-20 lg:py-32">
        <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-sm font-medium text-[var(--muted)] mb-4">
            <span className="flex h-2 w-2 rounded-full bg-[var(--color-success)] mr-2 animate-pulse"></span>
            Powered by Spaced Repetition (SM-2)
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--foreground)] leading-tight">
            Study less. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-blue-400">
              Remember more.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
            Stop cramming. Our cognitively-backed platform dynamically schedules your UPCAT reviews
            so you only study what you're about to forget, maximizing long-term retention.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full gap-2 text-base h-12 px-8">
                Start Learning for Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full text-base h-12 px-8 border-2">
                I already have an account
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-24 lg:mt-32 text-left">
          <div className="flex flex-col gap-3 p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--color-primary)]/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-[var(--color-primary-light)]/20 flex items-center justify-center text-[var(--color-primary)] mb-2">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">Cognitive Science</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              Utilizes the SM-2 spaced repetition algorithm to present topics precisely when your
              brain needs them.
            </p>
          </div>

          <div className="flex flex-col gap-3 p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--color-primary)]/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center text-green-500 mb-2">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">Targeted Practice</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              Focuses on your weak points across Math, Science, and Language, ignoring what you
              already know.
            </p>
          </div>

          <div className="flex flex-col gap-3 p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--color-primary)]/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-[var(--color-warning-light)]/20 flex items-center justify-center text-[var(--color-warning)] mb-2">
              <LineChart className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">Exam Readiness</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              Track your mastery over time with beautiful, actionable analytics that show exactly
              where you stand.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-8 text-center text-sm text-[var(--muted)] mt-auto">
        <p>© {new Date().getFullYear()} UPCAT Prep Platform. Built for milestone deployment.</p>
      </footer>
    </div>
  );
}
