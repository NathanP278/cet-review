import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { CheckCircle, Edit, Trash2, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function StudioReviewPage() {
  const { supabase } = await requireAdmin(50); // Minimum: Content Manager

  // Fetch draft questions awaiting review
  // Removing eq("status", "draft") as status column doesn't exist
  const { data: drafts } = await supabase
    .from("questions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
          Approval Queue
        </h1>
        <p className="text-slate-500 text-sm mt-1">Human-in-the-loop review for AI-generated content.</p>
      </div>

      <div className="grid gap-6">
        {drafts?.map((q) => (
          <div key={q.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
                  AI Draft
                </span>
                <span className={`text-xs font-bold uppercase tracking-wider
                  ${q.difficulty === 'hard' ? 'text-red-500' : q.difficulty === 'medium' ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {q.difficulty}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1 bg-white dark:bg-black px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
                  <ShieldAlert className="h-3 w-3 text-amber-500" />
                  QA Score: {(q as any).quality_score || 'N/A'}
                </span>
              </div>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-6">
              {/* Question Side */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Question</h4>
                  <div className="text-slate-900 dark:text-slate-100 font-medium">
                    {q.content.replace(/<[^>]*>?/gm, '')}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Choices</h4>
                  <ul className="space-y-2">
                    {(q.choices as string[])?.map((choice, i) => (
                      <li key={i} className={`p-2 rounded border text-sm ${
                        choice === (q as any).correct_answer 
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100 font-medium' 
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {choice}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Explanation Side */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Explanation</h4>
                  <div className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg leading-relaxed">
                    {q.explanation}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Learning Objective</h4>
                  <div className="text-sm text-slate-500 italic">
                    {(q as any).learning_objective || "Not provided"}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 flex items-center justify-between">
              <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 gap-2">
                <Trash2 className="h-4 w-4" /> Reject
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2 bg-white dark:bg-slate-950">
                  <Sparkles className="h-4 w-4 text-purple-500" /> AI Improve
                </Button>
                <Button variant="outline" className="gap-2 bg-white dark:bg-slate-950">
                  <Edit className="h-4 w-4" /> Manual Edit
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                  <CheckCircle className="h-4 w-4" /> Approve & Publish
                </Button>
              </div>
            </div>
          </div>
        ))}

        {(!drafts || drafts.length === 0) && (
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-500">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4 opacity-50" />
            <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-1">Queue Empty</h3>
            <p className="mb-6 max-w-sm mx-auto">There are no AI-generated drafts awaiting human review.</p>
            <Link href="/admin/studio/generate">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                <Sparkles className="h-4 w-4" /> Generate New Content
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
