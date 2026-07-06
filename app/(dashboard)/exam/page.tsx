import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, Clock, CheckCircle2, PlayCircle } from "lucide-react";

export default function ExamLandingPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-display">Mock Exam Engine</h1>
        <p className="text-[var(--muted)] mt-2">
          Simulate the real CET experience under time pressure.
        </p>
      </div>

      <Card className="border-t-4 border-t-[var(--color-primary)]">
        <CardHeader>
          <CardTitle>Full Simulated Exam</CardTitle>
          <CardDescription>Comprehensive test across all CET subjects.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
              <span className="text-[var(--muted)] text-sm mb-1 flex items-center gap-1">
                <Clock className="h-4 w-4" /> Duration
              </span>
              <span className="font-semibold text-lg">120 Minutes</span>
            </div>
            <div className="flex flex-col p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
              <span className="text-[var(--muted)] text-sm mb-1 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Questions
              </span>
              <span className="font-semibold text-lg">60 Total</span>
            </div>
            <div className="flex flex-col p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
              <span className="text-[var(--muted)] text-sm mb-1 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> Format
              </span>
              <span className="font-semibold text-lg">Multiple Choice</span>
            </div>
          </div>

          <div className="bg-[var(--color-warning-light)]/20 text-[var(--color-warning-dark)] p-4 rounded-lg border border-[var(--color-warning)] text-sm">
            <strong className="font-bold flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4" />
              Important Rules
            </strong>
            <ul className="list-disc pl-5 space-y-1 ml-1">
              <li>Do not refresh the page during the exam, or your progress will be lost.</li>
              <li>You can skip questions and navigate back using the grid sidebar.</li>
              <li>
                When the timer runs out, the exam will automatically submit whatever you have
                answered.
              </li>
            </ul>
          </div>

          <div className="flex justify-end pt-4">
            <Link href="/exam/session">
              <Button size="lg" className="gap-2">
                <PlayCircle className="h-5 w-5" />
                Start Exam Now
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
