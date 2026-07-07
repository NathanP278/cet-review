"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, Clock, CheckCircle2, PlayCircle, Settings, Layers, Zap } from "lucide-react";
import { createExamSession, ExamConfig } from "@/app/actions/exam";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Subject {
  id: string;
  name: string;
}

export function ExamConfigForm({ subjects }: { subjects: Subject[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<ExamConfig["mode"]>("full");
  const [subjectId, setSubjectId] = useState<string>("");
  const [difficulty, setDifficulty] = useState<ExamConfig["difficulty"] | "">("");
  const [questionCount, setQuestionCount] = useState<number>(60);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(120);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const config: ExamConfig = {
        mode,
        questionCount,
        timeLimitSeconds: timeLimitMinutes * 60,
      };

      if (mode === "subject" && subjectId) {
        config.subjectId = subjectId;
      }

      if (mode === "custom") {
        if (subjectId) config.subjectId = subjectId;
        if (difficulty) config.difficulty = difficulty as ExamConfig["difficulty"];
      }

      if (mode === "quick") {
        config.questionCount = 10;
        config.timeLimitSeconds = 10 * 60; // 10 mins
      }

      const attemptId = await createExamSession(config);
      router.push(`/exam/session/${attemptId}`);
    } catch (err: any) {
      setError(err.message || "Failed to start exam");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Modes */}
        <Card 
          className={cn("cursor-pointer transition-all border-2", mode === "full" ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]/10" : "border-transparent hover:border-[var(--border)]")}
          onClick={() => { setMode("full"); setQuestionCount(120); setTimeLimitMinutes(120); }}
        >
          <CardContent className="p-4 flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Full CET Mock</h3>
            <p className="text-xs text-[var(--muted)]">120 Qs • 120 Mins • All Subjects</p>
          </CardContent>
        </Card>

        <Card 
          className={cn("cursor-pointer transition-all border-2", mode === "subject" ? "border-[var(--color-secondary)] bg-[var(--color-secondary-light)]/10" : "border-transparent hover:border-[var(--border)]")}
          onClick={() => { setMode("subject"); setQuestionCount(30); setTimeLimitMinutes(30); }}
        >
          <CardContent className="p-4 flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] rounded-full">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Subject Focus</h3>
            <p className="text-xs text-[var(--muted)]">30 Qs • 30 Mins • One Subject</p>
          </CardContent>
        </Card>

        <Card 
          className={cn("cursor-pointer transition-all border-2", mode === "quick" ? "border-[var(--color-warning)] bg-[var(--color-warning-light)]/10" : "border-transparent hover:border-[var(--border)]")}
          onClick={() => { setMode("quick"); setQuestionCount(10); setTimeLimitMinutes(10); }}
        >
          <CardContent className="p-4 flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-[var(--color-warning)]/10 text-[var(--color-warning)] rounded-full">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Quick Practice</h3>
            <p className="text-xs text-[var(--muted)]">10 Qs • 10 Mins • Mixed</p>
          </CardContent>
        </Card>

        <Card 
          className={cn("cursor-pointer transition-all border-2", mode === "custom" ? "border-purple-500 bg-purple-500/10" : "border-transparent hover:border-[var(--border)]")}
          onClick={() => { setMode("custom"); setQuestionCount(50); setTimeLimitMinutes(60); }}
        >
          <CardContent className="p-4 flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-full">
              <Settings className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Diagnostic Exam</h3>
            <p className="text-xs text-[var(--muted)]">Adaptive • Strengths & Weaknesses</p>
          </CardContent>
        </Card>

        <Card 
          className={cn("cursor-pointer transition-all border-2", mode === "custom" ? "border-[var(--color-neutral)] bg-[var(--color-neutral-light)]/10" : "border-transparent hover:border-[var(--border)]")}
          onClick={() => { setMode("custom"); setQuestionCount(20); setTimeLimitMinutes(20); }}
        >
          <CardContent className="p-4 flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-[var(--color-neutral)]/10 text-[var(--color-neutral)] rounded-full">
              <Settings className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Custom Mock</h3>
            <p className="text-xs text-[var(--muted)]">You choose the rules</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-t-4 border-t-[var(--color-primary)]">
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>Adjust the parameters for your mock exam.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {(mode === "subject" || mode === "custom") && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Subject</label>
              <select
                className="flex h-10 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
              >
                <option value="">Any Subject (Mixed)</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {mode === "custom" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <select
                  className="flex h-10 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                >
                  <option value="">Any Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Questions</label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    className="flex h-10 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Limit (Mins)</label>
                  <input
                    type="number"
                    min={1}
                    max={300}
                    className="flex h-10 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(parseInt(e.target.value))}
                  />
                </div>
              </div>
            </>
          )}

          <div className="bg-[var(--color-warning-light)]/20 text-[var(--color-warning-dark)] p-4 rounded-lg border border-[var(--color-warning)] text-sm">
            <strong className="font-bold flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4" />
              Important Rules
            </strong>
            <ul className="list-disc pl-5 space-y-1 ml-1">
              <li>Your progress will be continuously autosaved. You can close and resume safely.</li>
              <li>You can flag questions and skip them using the navigation grid.</li>
              <li>When the timer runs out, the exam will automatically submit.</li>
            </ul>
          </div>

          {error && (
            <div className="bg-[var(--color-danger-light)]/20 text-[var(--color-danger)] p-3 rounded text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-[var(--border)]">
            <Button size="lg" className="gap-2 w-full sm:w-auto" onClick={handleStart} disabled={isLoading || ((mode === "subject" || mode === "custom") && mode !== "custom" && !subjectId)}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <PlayCircle className="h-5 w-5" />}
              {isLoading ? "Generating Exam..." : "Start Exam Now"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
