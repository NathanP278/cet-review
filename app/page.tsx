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
            so you only study what you&apos;re about to forget, maximizing long-term retention.
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

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto w-full mt-32 text-left">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold">Frequently Asked Questions</h2>
            <p className="text-[var(--muted)] mt-2">
              Everything you need to know about the platform.
            </p>
          </div>

          <div className="space-y-4">
            <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-xl">
              <h4 className="font-semibold text-lg mb-2">How does Spaced Repetition work?</h4>
              <p className="text-[var(--muted)] leading-relaxed">
                We use the SM-2 algorithm to calculate the exact moment your brain is about to
                forget a concept. By reviewing it right at that moment, it cements the knowledge
                into your long-term memory much faster than traditional cramming.
              </p>
            </div>

            <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-xl">
              <h4 className="font-semibold text-lg mb-2">
                Are the mock exams timed exactly like the real UPCAT?
              </h4>
              <p className="text-[var(--muted)] leading-relaxed">
                Yes! The Mock Exam Engine strictly enforces the time limits to build your endurance
                and time management skills under pressure.
              </p>
            </div>

            <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-xl">
              <h4 className="font-semibold text-lg mb-2">Is the platform free?</h4>
              <p className="text-[var(--muted)] leading-relaxed">
                Our core spaced repetition engine and practice quizzes are entirely free during this
                beta phase.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-12 mt-auto">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuit className="h-6 w-6 text-[var(--color-primary)]" />
              <span className="font-display text-xl font-bold text-[var(--color-primary)]">
                UPCAT Prep
              </span>
            </div>
            <p className="text-sm text-[var(--muted)] max-w-sm">
              The smartest way to study for your college entrance exams. Powered by cognitive
              science and spaced repetition.
            </p>
          </div>

          <div>
            <h5 className="font-bold mb-4">Product</h5>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li>
                <Link href="/login" className="hover:text-[var(--foreground)]">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-[var(--foreground)]">
                  Create Account
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-[var(--foreground)]">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold mb-4">Legal</h5>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li>
                <a href="#" className="hover:text-[var(--foreground)]">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[var(--foreground)]">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-6 mt-12 pt-8 border-t border-[var(--border)] text-center text-sm text-[var(--muted)]">
          <p>© {new Date().getFullYear()} UPCAT Prep Platform. Built for milestone deployment.</p>
        </div>
      </footer>
    </div>
  );
}
