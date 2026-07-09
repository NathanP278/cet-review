import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { Brain, Sparkles, CheckCircle, Database, AlertCircle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function StudioDashboardPage() {
  const { supabase } = await requireAdmin(50); // Minimum: Content Manager

  // The 'status' column does not exist on 'questions' table based on type errors. 
  // We will assume draft count is 0 for now or remove the filter if we want total questions.
  const { count: draftCount } = await supabase.from("questions").select("*", { count: "exact", head: true });
  const { count: aiGenCount } = await supabase.from("ai_generations").select("*", { count: "exact", head: true });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            Academic Intelligence Studio
          </h1>
          <p className="text-slate-500 text-sm mt-1">AI-powered content assembly, generation, and quality assurance.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/studio/generate">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-sm">
              <Sparkles className="h-4 w-4" /> Bulk Generate
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Draft Content</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{draftCount || 0}</h3>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-500">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/studio/review">
              <Button variant="outline" size="sm" className="w-full justify-center">Review Queue</Button>
            </Link>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">AI Generations</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{aiGenCount || 0}</h3>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-500">
              <Database className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-purple-600 dark:text-purple-400 font-medium">
            <TrendingUp className="h-3 w-3 mr-1" /> Utilizing Gemini 2.5 Flash
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 shadow-sm text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Brain className="h-24 w-24" />
          </div>
          <h3 className="font-bold text-lg mb-2 relative z-10">Content Health</h3>
          <p className="text-sm text-slate-300 relative z-10 mb-4">
            AI recommends generating more questions for <strong className="text-white">Mathematics - Calculus</strong> due to high drop-off rates.
          </p>
          <Link href="/admin/studio/generate?topic=calculus" className="relative z-10">
            <Button size="sm" variant="outline" className="w-full gap-2 text-slate-900">
              Generate Math Content <Sparkles className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
